class ProfileCard extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.wrap = this.querySelector('.expand-wrap');
		this.btn = this.querySelector('.expand-btn');
		this.btnText = this.btn.textContent;
		this.classes = (this.getAttribute('class-expand')).split(/\s+/).filter(Boolean);
		this.expanded = false;
		this._applyJsReadyClasses();
		this.btn.addEventListener('click', this.toggle);
	}

	_applyJsReadyClasses() {
		this.wrap.classList.add(...this.classes);
		this.btn.classList.remove('D-n');
	}

	toggle = () => {
		this.expanded = !this.expanded;
		this.btn.textContent = this.expanded ? 'Свернуть' : this.btnText;
		const startHeight = this.wrap.getBoundingClientRect().height;
		const savedTransition = this.wrap.style.transition;
		this.wrap.style.transition = 'none';

		if (this.expanded) {
			this.wrap.classList.remove(...this.classes);
			this.wrap.style.height = 'auto';
		} else {
			this.wrap.classList.add(...this.classes);
			this.wrap.style.height = '';
		}

		const endHeight = this.wrap.getBoundingClientRect().height;
		this.wrap.style.height = startHeight + 'px';
		void this.wrap.offsetHeight;

		this.wrap.style.transition = savedTransition;
		this.wrap.style.height = endHeight + 'px';
		this.wrap.addEventListener('transitionend', (e) => {

			if (e.propertyName !== 'height') {
				return;
			}

			this.wrap.style.height = this.expanded ? 'auto' : '';
		}, { once: true });
	};
}

customElements.define('profile-card', ProfileCard);