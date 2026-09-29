class ProcessScroll extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.track = this.querySelector('.track');
		this.track.addEventListener('wheel', this.onWheel, { passive: false });
	}

	onWheel = (e) => {
		const { deltaY } = e;
		const maxScrollLeft = this.track.scrollWidth - this.track.clientWidth;
		const canScrollRight = deltaY > 0 && this.track.scrollLeft < maxScrollLeft - 2;
		const canScrollLeft = deltaY < 0 && this.track.scrollLeft > 2;

		if (canScrollRight || canScrollLeft) {
			e.preventDefault();
			const speed = 3.2;
			this.track.scrollBy({ left: deltaY * speed, behavior: 'smooth' });
		}
	};
}

customElements.define('process-scroll', ProcessScroll);