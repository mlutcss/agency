class ProfileCard extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.jsReady = this.getAttribute('class-js-ready') || '';
		this.input = this.querySelector('.expand-input');
		this.wrap = this.querySelector('.expand-wrap');

		this._jsReady();
		this.collapsedHeight = this.wrap.getBoundingClientRect().height;
		this.input.addEventListener('change', () => this.toggle());
	}

	toggle() {
		const isExpanding = this.input.checked;
		const startHeight = this.wrap.getBoundingClientRect().height;

		this.wrap.style.height = 'auto';
		const endHeight = isExpanding ? this.wrap.getBoundingClientRect().height : this.collapsedHeight;

		this.wrap.style.height = startHeight + 'px';
		void this.wrap.offsetHeight;

		this.wrap.style.height = endHeight + 'px';

		this.wrap.addEventListener('transitionend', () => {

			if (isExpanding) {
				this.wrap.style.height = 'auto';
			}
		}, { once: true });
	}

	_jsReady() {
		this.label = this.querySelector('.js-ready');

		if (this.jsReady) {
			const classes = this.jsReady.split(/\s+/).filter(Boolean);
			this.wrap.classList.add(...classes);
			this.label.classList.remove('D-n');
		}
	}
}

customElements.define('profile-card', ProfileCard);