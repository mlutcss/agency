const heroSection = document.querySelector('#hero-section');
const footer = document.querySelector('#footer');
const logo = document.querySelector('#header-logo');

let anyVisible = false;

function handleIntersect(entries) {
	entries.forEach((entry) => {
		if (entry.target === heroSection || entry.target === footer) {
			anyVisible = entry.isIntersecting;
		}
	});

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