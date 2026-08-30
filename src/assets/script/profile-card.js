class ProfileCard extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.button = this.querySelector('button');
		this.button.addEventListener('click', () => {
			this.toggleCard();
		});
	}

	toggleCard() {
		const btnText = this.button.textContent;
		const newText = btnText === 'Свернуть' ? 'Подробнее' : 'Свернуть';
		this.button.textContent = newText;
		this.classList.toggle('no-js');
	}
}

customElements.define('profile-card', ProfileCard);