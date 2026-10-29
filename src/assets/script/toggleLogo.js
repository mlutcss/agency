const heroSection = document.querySelector('#hero-section');
const footer = document.querySelector('#footer');
const logo = document.querySelector('#header-logo');

let anyVisible = false;

function isInViewport(el) {
	if (!el) {
		return false;
	}

	const rect = el.getBoundingClientRect();

	return rect.top < window.innerHeight && rect.bottom > 0;
}

function handleIntersect() {
	anyVisible = isInViewport(heroSection) || isInViewport(footer);

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

const observer = new IntersectionObserver(handleIntersect, { threshold: 0 });

if (heroSection) {
	observer.observe(heroSection);
}

if (footer) {
	observer.observe(footer);
}