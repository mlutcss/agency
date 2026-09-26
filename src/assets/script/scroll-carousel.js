class ScrollCarousel extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.track = this.querySelector('.scroll-track');
		this.prevBtn = this.querySelector('.prev');
		this.nextBtn = this.querySelector('.next');
		this.slide = this.track?.querySelector('.scroll-slide');

		this._onScroll = () => this._updateButtonsVisibility();

		this._onResize = () => {
			this._measure();
			this._updateButtonsVisibility();
		};

		this.prevBtn.addEventListener('click', () => this.scrollByCard(-1));
		this.nextBtn.addEventListener('click', () => this.scrollByCard(1));
		this.track.addEventListener('scroll', this._onScroll);
		window.addEventListener('resize', this._onResize);

		this._measure();
		this._updateButtonsVisibility();
	}

	disconnectedCallback() {
		if (this.track) {
			this.track.removeEventListener('scroll', this._onScroll);
		}

		window.removeEventListener('resize', this._onResize);
	}

	_measure() {
		this.gap = parseFloat(getComputedStyle(this.track).columnGap || 0);
		this.cardWidth = this.slide.offsetWidth;
	}

	scrollByCard(direction) {
		const distance = (this.cardWidth + this.gap) * direction;
		this.track.scrollBy({ left: distance, behavior: 'smooth' });
	}

	_updateButtonsVisibility() {
		const maxScrollLeft = this.track.scrollWidth - this.track.clientWidth;

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