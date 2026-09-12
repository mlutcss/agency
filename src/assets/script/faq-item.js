class FaqItem extends HTMLElement {
	constructor() {
		super();
		this._button = null;
		this._text = null;
	}

	connectedCallback() {
		this._button = this.querySelector('.arrow-btn');
		this._text = this.querySelector('.text');
		this._svg = this._button?.querySelector('.arrow');
		this._activeClass = this.getAttribute('active-css') || '';

		if (!this._button || !this._text) {
			return;
		}

		this._button.addEventListener('click', () => {
			this._svg.classList.toggle('-Rt180d');
			this._text.classList.toggle('D-n');
			this.classList.toggle(this._activeClass);
		});
	}
}

customElements.define('faq-item', FaqItem);