class FaqItem extends HTMLElement {
	connectedCallback() {
		this.classList.remove('no-js');
		this.wrap = this.querySelector('.expand-wrap');
		this.svg = this.querySelector('.arrow');
		this.activeClass = this.getAttribute('active-css');

		this.isOpen = false;
		this.wrap.classList.add('H0');
		this.addEventListener('click', this.toggle);

		this._onTransitionEnd = (e) => {
			if (e.propertyName !== 'height') {
				return;
			}

			this.wrap.style.height = this.isOpen ? 'auto' : '';
		};

		this.wrap.addEventListener('transitionend', this._onTransitionEnd);

	}

	disconnectedCallback() {
		this.wrap?.removeEventListener('transitionend', this._onTransitionEnd);
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
		this._animate();
	}

	close() {
		this.isOpen = false;
		this.classList.remove(this.activeClass);
		this.svg?.classList.remove('-Rt180d');
		this._animate();
	}

	_animate() {
		const startHeight = this.wrap.getBoundingClientRect().height;
		this.wrap.style.transition = 'none';

		if (this.isOpen) {
			this.wrap.style.height = 'auto';
		} else {
			this.wrap.style.height = '';
		}

		const endHeight = this.wrap.getBoundingClientRect().height;
		this.wrap.style.height = startHeight + 'px';
		//Это принудительный reflow — трюк, чтобы браузер применил предыдущее изменение стилей до следующего.
		// Без него анимация не запустится.
		void this.wrap.offsetHeight;

		this.wrap.style.transition = '';
		this.wrap.style.height = endHeight + 'px';
	}
}

customElements.define('faq-item', FaqItem);