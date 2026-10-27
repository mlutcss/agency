const heroSection = document.querySelector('#hero-section');
const footer = document.querySelector('#footer');
const logo = document.querySelector('#header-logo');

const visibility = { hero: false, footer: false };

function updateLogo() {
	const anyVisible = visibility.hero || visibility.footer;

	if (anyVisible) {
		logo.style.opacity = 0;
		setTimeout(() => {
			logo.style.visibility = 'hidden';
		}, 200);
	} else {
		logo.style.visibility = 'visible';
		logo.style.opacity = 1;
	}
}

function handleIntersect(entries) {
	entries.forEach((entry) => {
		if (entry.target === heroSection) {
			visibility.hero = entry.isIntersecting;
		}

		if (entry.target === footer) {
			visibility.footer = entry.isIntersecting;
		}
	});

	updateLogo();
}

function createObserver() {
	const options = {
		root: null,
		threshold: '0.3',
		rootMargin: '0px',
	};

	const observer = new IntersectionObserver(handleIntersect, options);

	if (heroSection) {
		observer.observe(heroSection);
	}

	if (footer) {
		observer.observe(footer);
	}
}

createObserver();