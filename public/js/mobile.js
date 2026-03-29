document.addEventListener("DOMContentLoaded", function () {
	const hamburgerBtn = document.querySelector(".hamburger-btn");
	const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
	const mobileNavDrawer = document.querySelector(".mobile-nav-drawer");

	if (!hamburgerBtn || !mobileNavOverlay || !mobileNavDrawer) return;

	let scrollPosition = 0;

	function openMobileNav() {
		scrollPosition = window.pageYOffset;
		hamburgerBtn.classList.add("active");
		mobileNavOverlay.classList.add("active");
		mobileNavDrawer.classList.add("active");
		document.body.classList.add("mobile-nav-open");
		document.body.style.top = `-${scrollPosition}px`;
	}

	function closeMobileNav() {
		hamburgerBtn.classList.remove("active");
		mobileNavOverlay.classList.remove("active");
		mobileNavDrawer.classList.remove("active");
		document.body.classList.remove("mobile-nav-open");
		document.body.style.top = "";
		window.scrollTo(0, scrollPosition);
	}

	function toggleMobileNav() {
		if (mobileNavDrawer.classList.contains("active")) {
			closeMobileNav();
		} else {
			openMobileNav();
		}
	}

	hamburgerBtn.addEventListener("click", function (e) {
		e.stopPropagation();
		toggleMobileNav();
	});

	mobileNavOverlay.addEventListener("click", closeMobileNav);

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && mobileNavDrawer.classList.contains("active")) {
			closeMobileNav();
		}
	});

	let touchStartX = 0;
	let touchStartY = 0;

	mobileNavDrawer.addEventListener(
		"touchstart",
		function (e) {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		},
		{ passive: true },
	);

	mobileNavDrawer.addEventListener(
		"touchend",
		function (e) {
			const touchEndX = e.changedTouches[0].clientX;
			const touchEndY = e.changedTouches[0].clientY;
			const deltaX = touchEndX - touchStartX;
			const deltaY = Math.abs(touchEndY - touchStartY);

			if (deltaX > 80 && deltaY < 100) {
				closeMobileNav();
			}
		},
		{ passive: true },
	);

	window.addEventListener("resize", function () {
		if (window.innerWidth > 768 && mobileNavDrawer.classList.contains("active")) {
			closeMobileNav();
		}
	});
});
