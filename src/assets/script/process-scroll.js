class processScroll extends HTMLElement {
	constructor() {
		super();
		this.track = this.querySelector('.track');
		this.init();
	}

	init() {
		this.addEventListener('wheel', (e) => {
			const { deltaY } = e;
			const maxScrollLeft = this.track.scrollWidth - this.track.clientWidth;
			const canScrollLeft = deltaY > 0 && this.track.scrollLeft < maxScrollLeft;
			const canScrollRight = deltaY < 0 && this.track.scrollLeft > 0;

			if (canScrollLeft || canScrollRight) {
				e.preventDefault();
				const speed = 2;
				this.track.scrollBy({ left: deltaY * speed, behavior: 'smooth' });
			}
		}, { passive: false });
	}
}

customElements.define('process-scroll', processScroll);