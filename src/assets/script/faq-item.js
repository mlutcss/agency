class FaqItem extends HTMLElement {
	constructor() {
		super();
		this._svg = null;
		this._text = null;
	}

	connectedCallback() {
		this._text = this.querySelector('.text');
		this._svg = this.querySelector('.arrow');
		this._activeClass = this.getAttribute('active-css') || '';

		this.addEventListener('click', () => {
			this._svg.classList.toggle('-Rt180d');
			this._text.classList.toggle('D-n');
			this.classList.toggle(this._activeClass);
		});
	}
}

customElements.define('faq-item', FaqItem);