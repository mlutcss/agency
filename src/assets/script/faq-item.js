class FaqItem extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this._text = this.querySelector('.text');
		this._svg = this.querySelector('.arrow');
		this._activeClass = this.getAttribute('active-css') || '';
		this._onClick = () => this.toggle();
		this.addEventListener('click', this._onClick);
	}

	toggle() {
		if (this.isOpen()) {
			this.close();
		} else {
			this.open();
		}
	}

	open() {
		const section = this.closest('#faq-section');

		if (section) {
			section.querySelectorAll('faq-item').forEach((item) => {
				if (item !== this) {
					item.close();
				}
			});
		}

		if (this._activeClass) {
			this.classList.add(this._activeClass);
		}

		this._svg?.classList.add('-Rt180d');
		this._text?.classList.remove('D-n');
	}

	close() {
		if (this._activeClass) {
			this.classList.remove(this._activeClass);
		}

		this._svg?.classList.remove('-Rt180d');
		this._text?.classList.add('D-n');
	}

	isOpen() {
		return this._activeClass ? this.classList.contains(this._activeClass) : !this._text?.classList.contains('D-n');
	}
}

customElements.define('faq-item', FaqItem);