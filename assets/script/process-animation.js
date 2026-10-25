import * as three from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const options = {
	floatAmplitude: 4,
	floatSpeed: 2.4,
	floatAmplitudeX: 0,
	floatSpeedX: 1.2,
	pulseAmount: 0.02,
	pulseSpeed: 1.6,
	phaseStep: 0.7,
	overlayClass: 'process-card__canvas',
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
		this.images = [...card.querySelectorAll('.arc-line')];

		if (this.images.length === 0) {
			return;
		}

		this.sprites = [];
		this.visible = false;
		this.ready = false;
		this._rafId = null;
		this._completed = 0;

		Promise.all(this.images.map((img) => this._waitForImage(img)))
			.then(() => this._setup());
	}

	_waitForImage(img) {
		if (img.complete) {
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

		const cardRect = this.card.getBoundingClientRect();
		this.cardW = cardRect.width;
		this.cardH = cardRect.height;

		const overflow = options.overflow;
		this.W = this.cardW + overflow.left + overflow.right;
		this.H = this.cardH + overflow.top + overflow.bottom;

		// ---------- Renderer ----------
		this.renderer = new three.WebGLRenderer({
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
		const overlay = document.createElement('div');
		overlay.className = options.overlayClass;
		overlay.style.cssText = [
			'position:absolute',
			`top:${-overflow.top}px`,
			`right:${-overflow.right}px`,
			`bottom:${-overflow.bottom}px`,
			`left:${-overflow.left}px`,
			'pointer-events:none',
			'z-index:0',
		].join(';');
		overlay.appendChild(canvas);
		this.card.appendChild(overlay);
		this.overlay = overlay;

		// Текстовый блок — поверх канваса
		const textBlock = this.card.querySelector(
			':scope > div:not(.' + options.overlayClass + ')'
		);

		if (textBlock) {
			if (getComputedStyle(textBlock).position === 'static') {
				textBlock.style.position = 'relative';
			}

			textBlock.style.zIndex = '1';
		}

		// ---------- Scene + ортографическая камера ----------
		this.scene = new three.Scene();
		this.camera = new three.OrthographicCamera(
			-this.W / 2, this.W / 2,
			this.H / 2, -this.H / 2,
			0.1, 1000
		);
		this.camera.position.z = 100;

		// ---------- Загрузка текстур ----------
		const loader = new three.TextureLoader();

		this.images.forEach((img, i) => {
			const settled = () => {
				this._completed++;
				this._maybeReady();
			};

			loader.load(
				img.src,
				(texture) => {
					texture.colorSpace = three.SRGBColorSpace;
					texture.minFilter = three.LinearFilter;
					texture.magFilter = three.LinearFilter;
					texture.generateMipmaps = false;

					const material = new three.SpriteMaterial({
						map: texture,
						transparent: true,
						depthTest: false,
						depthWrite: false,
					});

					const sprite = new three.Sprite(material);
					const pos = this._computeSpritePosition(img, cardRect);
					sprite.position.set(pos.x, pos.y, 0);
					sprite.scale.set(pos.w, pos.h, 1);

					sprite.userData = {
						baseX: pos.x,
						baseY: pos.y,
						baseW: pos.w,
						baseH: pos.h,
						phase: i * options.phaseStep,
						img,
					};

					this.scene.add(sprite);
					this.sprites.push(sprite);
					img.style.visibility = 'hidden';
					settled();
				},
				undefined,
				() => {
					console.warn('[CardAnimator] failed to load texture:', img.src);
					img.style.visibility = '';
					settled();
				}
			);
		});

		// ---------- Видимость ----------
		this.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					this.visible = e.isIntersecting;

					if (this.visible) {
						this._startAnimation();
					} else {
						this._stopAnimation();
					}
				});
			},
			{
				rootMargin: '-10px 0px',
				threshold: 0,
			}
		);
		this.observer.observe(this.card);

		// ---------- Ресайз ----------
		this._onResize = () => this._handleResize();
		window.addEventListener('resize', this._onResize);

		// ---------- Часы ----------
		this.clock = new three.Clock();
	}

	_maybeReady() {
		if (this._completed === this.images.length) {
			this.ready = true;
			this._startAnimation();
		}
	}

	_computeSpritePosition(img, cardRect) {
		const r = img.getBoundingClientRect();
		const overflow = options.overflow;
		const cxOverlay = (r.left - cardRect.left) + overflow.left + r.width / 2;
		const cyOverlay = (r.top - cardRect.top) + overflow.top + r.height / 2;

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

		const overflow = options.overflow;
		this.W = this.cardW + overflow.left + overflow.right;
		this.H = this.cardH + overflow.top + overflow.bottom;

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

	_startAnimation() {
		if (this._rafId === null && this.ready && this.visible) {
			this._rafId = requestAnimationFrame(this._animate);
		}
	}

	_stopAnimation() {
		if (this._rafId !== null) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}
	}

	_animate = () => {
		this._rafId = null;
		const t = this.clock.getElapsedTime();

		for (let i = 0; i < this.sprites.length; i++) {
			const sprite = this.sprites[i];
			const { baseX, baseY, baseW, baseH, phase } = sprite.userData;

			const dy = Math.sin(t * options.floatSpeed + phase) * options.floatAmplitude;
			const pulse = 1 + Math.sin(t * options.pulseSpeed + phase) * options.pulseAmount;

			sprite.position.x = baseX;
			sprite.position.y = baseY + dy;
			sprite.scale.set(baseW * pulse, baseH * pulse, 1);
		}

		this.renderer.render(this.scene, this.camera);
		this._rafId = requestAnimationFrame(this._animate);
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