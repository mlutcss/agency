class ProfileCard extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.wrap = this.querySelector('.expand-wrap');
		this.btn = this.querySelector('.expand-btn');
		this.btnText = this.btn.textContent;
		this.context = this.getAttribute('class-context');
		this.expanded = false;
		this._applyJsReadyClasses();
		this.btn.addEventListener('click', this.toggle);

		this._onTransitionEnd = (e) => {
			if (e.propertyName !== 'height') {
				return;
			}

			this.wrap.style.height = this.expanded ? 'auto' : '';
		};

		this.wrap.addEventListener('transitionend', this._onTransitionEnd);
	}

	disconnectedCallback() {
		this.btn.removeEventListener('click', this.toggle);
		this.wrap.removeEventListener('transitionend', this._onTransitionEnd);
	}

	_applyJsReadyClasses() {
		this.classList.add(this.context);
		this.btn.classList.remove('D-n');
	}

	toggle = () => {
		this.expanded = !this.expanded;
		this.btn.textContent = this.expanded ? 'Свернуть' : this.btnText;
		const startHeight = this.wrap.getBoundingClientRect().height;
		this.wrap.style.transition = 'none';

		if (this.expanded) {
			this.classList.remove(this.context);
			this.wrap.style.height = 'auto';
		} else {
			this.classList.add(this.context);
			this.wrap.style.height = '';
		}

		const endHeight = this.wrap.getBoundingClientRect().height;
		this.wrap.style.height = startHeight + 'px';
		// Это принудительный reflow — трюк, чтобы браузер применил предыдущее изменение стилей до следующего.
		// Без него анимация не запустится.
		void this.wrap.offsetHeight;

		this.wrap.style.transition = '';
		this.wrap.style.height = endHeight + 'px';
	};
}

customElements.define('profile-card', ProfileCard);