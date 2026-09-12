class ScrollCarousel extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.track = this.querySelector('.scroll-track');
		this.prevBtn = this.querySelector('.prev');
		this.nextBtn = this.querySelector('.next');

		if (!this.track || !this.prevBtn || !this.nextBtn) {
			return;
		}

		this.prevBtn.addEventListener('click', () => {
			this.scrollByCard(-1);
		});

		this.nextBtn.addEventListener('click', () => {
			this.scrollByCard(1);
		});

		this.track.addEventListener('scroll', () => this._updateButtonsVisibility());
		window.addEventListener('resize', () => this._updateButtonsVisibility());

		this._updateButtonsVisibility();
	}

	disconnectedCallback() {
		if (this.track) {
			this.track.removeEventListener('scroll', () => this._updateButtonsVisibility());
		}

		window.removeEventListener('resize', () => this._updateButtonsVisibility());
	}

	scrollByCard(direction) {
		const slide = this.track.querySelector('.scroll-slide');

		if (!slide) {
			return;
		}

		const gap = parseFloat(getComputedStyle(this.track).columnGap || 0);
		const cardWidth = slide.getBoundingClientRect().width;
		const distance = (cardWidth + gap) * direction;

		this.track.scrollBy({
			left: distance,
			behavior: 'smooth',
		});
	}

	_updateButtonsVisibility() {
		const maxScrollLeft = this.track.scrollWidth - this.track.clientWidth;
		// this.prevBtn.classList.toggle('O0', this.track.scrollLeft <= 0);
		// this.nextBtn.classList.toggle('O0', this.track.scrollLeft >= maxScrollLeft - 1);

		if (this.track.scrollLeft <= 0) {
			this.prevBtn.classList.add('O0', 'Pne');
		} else {
			this.prevBtn.classList.remove('O0', 'Pne');
		}

		if (this.track.scrollLeft >= maxScrollLeft - 1) {
			this.nextBtn.classList.add('O0', 'Pne');
		} else {
			this.nextBtn.classList.remove('O0', 'Pne');
		}
	}
}

customElements.define('scroll-carousel', ScrollCarousel);