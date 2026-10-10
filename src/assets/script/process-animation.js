import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const OPTIONS = {
	// Вертикальное покачивание
	floatAmplitude: 3,
	floatSpeed: 1.8,

	// Горизонтальное покачивание (по умолчанию выключено)
	floatAmplitudeX: 0,
	floatSpeedX: 1.2,

	// Пульсация масштаба — именно она даёт ощущение «расходимся по сторонам»
	pulseAmount: 0.015,
	pulseSpeed: 1.2,

	phaseStep: 0.7,
	overlayClass: 'process-card__canvas',

	// Насколько канвас выступает за границы карточки (в px).
	// Положительное значение = выступ наружу.
	overflow: {
		right: 105,
		left: 0,
		top: 0,
		bottom: 0,
	},
};

class CardAnimator {
	constructor(card) {
		this.card = card;
		this.images = [...card.querySelectorAll('img.Ps-a')];

		if (this.images.length === 0) {
			return;
		}

		this.sprites = [];
		this.visible = false;
		this.ready = false;

		Promise.all(this.images.map((img) => this._waitForImage(img)))
			.then(() => this._setup());
	}

	_waitForImage(img) {
		if (img.complete && img.naturalWidth) {
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			img.addEventListener('load', resolve, { once: true });
			img.addEventListener('error', resolve, { once: true });
		});
	}

	_setup() {
		if (getComputedStyle(this.card).position === 'static') {
			this.card.style.position = 'relative';
		}

		// Размеры карточки (без выступа)
		const cardRect = this.card.getBoundingClientRect();
		this.cardW = cardRect.width;
		this.cardH = cardRect.height;

		// Размеры overlay (с выступом)
		const o = OPTIONS.overflow;
		this.W = this.cardW + o.left + o.right;
		this.H = this.cardH + o.top + o.bottom;

		// ---------- Renderer ----------
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			premultipliedAlpha: true,
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(this.W, this.H);
		this.renderer.setClearColor(0x000000, 0);

		const canvas = this.renderer.domElement;
		canvas.style.display = 'block';
		canvas.style.width = '100%';
		canvas.style.height = '100%';

		// ---------- Overlay ----------
		// Отрицательные top/right/bottom/left «растягивают» блок за границы
		// карточки. pointer-events:none — чтобы не блокировать клики.
		// overflow:hidden НЕ ставим — иначе вылет спрайтов обрежется.
		const overlay = document.createElement('div');
		overlay.className = OPTIONS.overlayClass;
		overlay.style.cssText = [
			'position:absolute',
			`top:${-o.top}px`,
			`right:${-o.right}px`,
			`bottom:${-o.bottom}px`,
			`left:${-o.left}px`,
			'pointer-events:none',
			'z-index:0',
		].join(';');
		overlay.appendChild(canvas);
		this.card.appendChild(overlay);
		this.overlay = overlay;

		// Текстовый блок — поверх канваса
		const textBlock = this.card.querySelector(
			':scope > div:not(.' + OPTIONS.overlayClass + ')'
		);

		if (textBlock) {
			if (getComputedStyle(textBlock).position === 'static') {
				textBlock.style.position = 'relative';
			}

			textBlock.style.zIndex = '1';
		}

		// ---------- Scene + ортографическая камера ----------
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(
			-this.W / 2, this.W / 2,
			this.H / 2, -this.H / 2,
			0.1, 1000
		);
		this.camera.position.z = 100;

		// ---------- Загрузка текстур ----------
		const loader = new THREE.TextureLoader();

		this.images.forEach((img, i) => {
			loader.load(img.src, (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.generateMipmaps = false;

				const material = new THREE.SpriteMaterial({
					map: texture,
					transparent: true,
					depthTest: false,
					depthWrite: false,
				});

				const sprite = new THREE.Sprite(material);

				const pos = this._computeSpritePosition(img, cardRect);
				sprite.position.set(pos.x, pos.y, 0);
				sprite.scale.set(pos.w, pos.h, 1);

				sprite.userData = {
					baseX: pos.x,
					baseY: pos.y,
					baseW: pos.w,
					baseH: pos.h,
					phase: i * OPTIONS.phaseStep,
					img,
				};

				this.scene.add(sprite);
				this.sprites.push(sprite);

				img.style.visibility = 'hidden';

				if (this.sprites.length === this.images.length) {
					this.ready = true;
				}
			});
		});

		// ---------- Видимость ----------
		this.observer = new IntersectionObserver(
			(entries) => entries.forEach((e) => {
				this.visible = e.isIntersecting;
			}),
			{ rootMargin: '200px' }
		);
		this.observer.observe(this.card);

		// ---------- Ресайз ----------
		this._onResize = () => this._handleResize();
		window.addEventListener('resize', this._onResize);

		this.clock = new THREE.Clock();
		this._animate();
	}

	// Пересчёт координат с учётом смещения overlay
	_computeSpritePosition(img, cardRect) {
		const r = img.getBoundingClientRect();
		const o = OPTIONS.overflow;

		// Центр img в координатах overlay (левый-верхний угол = 0,0)
		const cxOverlay = (r.left - cardRect.left) + o.left + r.width / 2;
		const cyOverlay = (r.top - cardRect.top) + o.top + r.height / 2;

		// Переводим в координаты Three.js (центр overlay = 0,0, Y вверх)
		return {
			x: cxOverlay - this.W / 2,
			y: -(cyOverlay - this.H / 2),
			w: r.width,
			h: r.height,
		};
	}

	_handleResize() {
		const cardRect = this.card.getBoundingClientRect();

		if (
			Math.abs(cardRect.width - this.cardW) < 0.5 &&
			Math.abs(cardRect.height - this.cardH) < 0.5
		) {
			return;
		}

		this.cardW = cardRect.width;
		this.cardH = cardRect.height;

		const o = OPTIONS.overflow;
		this.W = this.cardW + o.left + o.right;
		this.H = this.cardH + o.top + o.bottom;

		this.renderer.setSize(this.W, this.H);
		this.renderer.domElement.style.width = '100%';
		this.renderer.domElement.style.height = '100%';

		this.camera.left = -this.W / 2;
		this.camera.right = this.W / 2;
		this.camera.top = this.H / 2;
		this.camera.bottom = -this.H / 2;
		this.camera.updateProjectionMatrix();

		this.sprites.forEach((sprite) => {
			const pos = this._computeSpritePosition(sprite.userData.img, cardRect);
			sprite.userData.baseX = pos.x;
			sprite.userData.baseY = pos.y;
			sprite.userData.baseW = pos.w;
			sprite.userData.baseH = pos.h;
			sprite.position.x = pos.x;
			sprite.position.y = pos.y;
			sprite.scale.set(pos.w, pos.h, 1);
		});
	}

	_animate = () => {
		requestAnimationFrame(this._animate);

		if (!this.ready || !this.visible) {
			return;
		}

		const t = this.clock.getElapsedTime();

		for (let i = 0; i < this.sprites.length; i++) {
			const sprite = this.sprites[i];
			const { baseX, baseY, baseW, baseH, phase } = sprite.userData;

			const dy = Math.sin(t * OPTIONS.floatSpeed + phase) * OPTIONS.floatAmplitude;
			const pulse = 1 + Math.sin(t * OPTIONS.pulseSpeed + phase) * OPTIONS.pulseAmount;

			sprite.position.x = baseX;
			sprite.position.y = baseY + dy;
			sprite.scale.set(baseW * pulse, baseH * pulse, 1);
		}

		this.renderer.render(this.scene, this.camera);
	};
}

function init() {
	document.querySelectorAll('.process-card')
		.forEach((card) => new CardAnimator(card));
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
