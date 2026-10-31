class FaqItem extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.classList.remove('no-js');
		this._text = this.querySelector('.text');
		this._svg = this.querySelector('.arrow');
		this._activeClass = this.getAttribute('active-css') || '';
		this._isOpen = false;

		this.close();
		this.addEventListener('click', this.toggle);
	}

	toggle = () => {
		if (this._isOpen) {
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

		this._isOpen = true;
		this.classList.add(this._activeClass);
		this._svg?.classList.add('-Rt180d');
		this._text?.classList.remove('D-n');
	}

	close() {
		this._isOpen = false;
		this.classList.remove(this._activeClass);
		this._svg?.classList.remove('-Rt180d');
		this._text?.classList.add('D-n');
	}
}

customElements.define('faq-item', FaqItem);