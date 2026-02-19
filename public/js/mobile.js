/* ============================================
   MOBILE.JS - Hamburger menü és mobil navigáció
   Minden oldalhoz hozzá kell adni!
   ============================================ */

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

	// Hamburger gomb kattintás
	hamburgerBtn.addEventListener("click", function (e) {
		e.stopPropagation();
		toggleMobileNav();
	});

	// Overlay kattintás → bezárás
	mobileNavOverlay.addEventListener("click", closeMobileNav);

	// ESC billentyű → bezárás
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && mobileNavDrawer.classList.contains("active")) {
			closeMobileNav();
		}
	});

	// Swipe to close (jobbról balra húzás a draweren)
	let touchStartX = 0;
	let touchStartY = 0;

	mobileNavDrawer.addEventListener(
		"touchstart",
		function (e) {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		},
		{ passive: true }
	);

	mobileNavDrawer.addEventListener(
		"touchend",
		function (e) {
			const touchEndX = e.changedTouches[0].clientX;
			const touchEndY = e.changedTouches[0].clientY;
			const deltaX = touchEndX - touchStartX;
			const deltaY = Math.abs(touchEndY - touchStartY);

			// Ha jobbra húzták (>80px) és nem volt nagy vertikális mozgás
			if (deltaX > 80 && deltaY < 100) {
				closeMobileNav();
			}
		},
		{ passive: true }
	);

	// Ablak átméretezés → bezárás ha desktop méret
	window.addEventListener("resize", function () {
		if (window.innerWidth > 768 && mobileNavDrawer.classList.contains("active")) {
			closeMobileNav();
		}
	});
});
