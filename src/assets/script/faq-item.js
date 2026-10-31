class FaqItem extends HTMLElement {
	connectedCallback() {
		this.classList.remove('no-js');
		this.wrap = this.querySelector('.expand-wrap');
		this.svg = this.querySelector('.arrow');
		this.activeClass = this.getAttribute('active-css');

		this.isOpen = false;
		this.wrap.classList.add('H0');
		this.addEventListener('click', this.toggle);
	}

	toggle = () => {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	};

	open() {
		const section = this.closest('#faq-section');

		if (section) {
			section.querySelectorAll('faq-item').forEach((item) => {

				if (item !== this) {
					item.close();
				}
			});
		}

		this.isOpen = true;
		this.classList.add(this.activeClass);
		this.svg?.classList.add('-Rt180d');
		this._animate('open');
	}

	close() {
		this.isOpen = false;
		this.classList.remove(this.activeClass);
		this.svg?.classList.remove('-Rt180d');
		this._animate('close');
	}

	_animate(direction) {
		const startHeight = this.wrap.getBoundingClientRect().height;
		const savedTransition = this.wrap.style.transition;
		this.wrap.style.transition = 'none';

		if (direction === 'open') {
			this.wrap.classList.remove('H0');
			this.wrap.style.height = 'auto';
		} else {
			this.wrap.classList.add('H0');
			this.wrap.style.height = '';
		}

		const endHeight = this.wrap.getBoundingClientRect().height;
		this.wrap.style.height = startHeight + 'px';
		void this.wrap.offsetHeight;

		this.wrap.style.transition = savedTransition;
		this.wrap.style.height = endHeight + 'px';

		this.wrap.addEventListener('transitionend', () => {
			this.wrap.style.height = direction === 'open' ? 'auto' : '';
		}, { once: true });
	}
}

customElements.define('faq-item', FaqItem);