const heroSection = document.querySelector('#hero-section');
const logo = document.querySelector('#header-logo');
const footer = document.querySelector('#footer');
const visibility = { hero: false, footer: false };

function handleIntersect(entries) {
	entries.forEach((entry) => {

		if (entry.target === heroSection) {
			visibility.hero = entry.isIntersecting;
		}

		if (entry.target === footer) {
			visibility.footer = entry.isIntersecting;
		}
	});

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

function createObserver() {
	const options = {
		root: null,
		threshold: '0.85',
		rootMargin: '0px',
	};

	const observer = new IntersectionObserver(handleIntersect, options);
	observer.observe(heroSection);
	observer.observe(footer);
}

createObserver();