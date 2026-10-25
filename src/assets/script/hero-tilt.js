class HeroTilt extends HTMLElement {
	constructor() {
		super();
		this.maxRotateX = 10; // градусов по вертикали
		this.maxRotateY = 15; // градусов по горизонтали
		this.raf = null;
		this.lastX = 0;
		this.lastY = 0;
		this.active = false;
	}

	connectedCallback() {
		// Только мышь/трекпад и без reduce-motion
		if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
			return;
		}

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		this.addEventListener('mousemove', this.onMove);
		this.addEventListener('mouseleave', this.onLeave);
	}

	apply = () => {
		this.raf = null;

		if (!this.active) {
			return;
		}

		const rect = this.getBoundingClientRect();
		// Нормализуем позицию курсора: -0.5..0.5 относительно центра
		const nx = (this.lastX - rect.left) / rect.width - 0.5;
		const ny = (this.lastY - rect.top) / rect.height - 0.5;
		// Курсор справа → положительный rotateY (правый край отходит назад)
		// Курсор снизу → отрицательный rotateX (низ отходит назад)
		const rotY = nx * 2 * this.maxRotateY;
		const rotX = -ny * 2 * this.maxRotateX;

		this.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
	};

	onMove = (e) => {
		this.lastX = e.clientX;
		this.lastY = e.clientY;
		this.active = true;

		if (!this.raf) {
			this.raf = requestAnimationFrame(this.apply);
		}
	};

	onLeave = () => {
		this.active = false;

		if (this.raf) {
			cancelAnimationFrame(this.raf);
			this.raf = null;
		}

		this.style.transform = 'rotateX(0deg) rotateY(0deg)';
	};
}

customElements.define('hero-tilt', HeroTilt);