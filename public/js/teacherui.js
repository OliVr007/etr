class InfiniteCarousel {
	constructor(container) {
		this.container = container;
		this.track = container.querySelector(".carousel-track");
		this.cards = Array.from(container.querySelectorAll(".carousel-card"));
		this.prevBtn = container.querySelector(".prev-btn");
		this.nextBtn = container.querySelector(".next-btn");

		this.currentIndex = 0;
		this.cardWidth = this.cards[0].offsetWidth + 30; // + gap
		this.visibleCards = this.getVisibleCardsCount();
		this.autoPlayInterval = null;
		this.isAnimating = false;

		// Klónozzuk a kártyákat a végtelen hatás érdekében
		this.setupInfiniteCards();
		this.init();
	}

	setupInfiniteCards() {
		// Klónozzuk az első és utolsó kártyákat
		const firstClone = this.cards[0].cloneNode(true);
		const lastClone = this.cards[this.cards.length - 1].cloneNode(true);

		this.track.appendChild(firstClone);
		this.track.insertBefore(lastClone, this.track.firstChild);

		// Frissítjük a kártyák listáját
		this.cards = Array.from(this.track.querySelectorAll(".carousel-card"));
		this.currentIndex = 1; // Kezdjük az első eredeti kártyánál
	}

	getVisibleCardsCount() {
		const containerWidth = this.container.offsetWidth;
		const cardWidth = this.cards[0].offsetWidth + 30;
		return Math.floor(containerWidth / cardWidth);
	}

	init() {
		this.updateCarousel();
		this.addEventListeners();
		this.startAutoPlay();

		window.addEventListener("resize", () => {
			this.visibleCards = this.getVisibleCardsCount();
			this.updateCarousel();
		});
	}

	addEventListeners() {
		this.prevBtn.addEventListener("click", () => this.prev());
		this.nextBtn.addEventListener("click", () => this.next());

		// Touch események
		let startX = 0;
		let endX = 0;

		this.track.addEventListener("touchstart", (e) => {
			startX = e.touches[0].clientX;
			this.stopAutoPlay();
		});

		this.track.addEventListener("touchend", (e) => {
			endX = e.changedTouches[0].clientX;
			this.handleSwipe();
			this.startAutoPlay();
		});

		// Egérgörgő navigáció
		this.track.addEventListener("wheel", (e) => {
			e.preventDefault();
			if (e.deltaY > 0) {
				this.next();
			} else {
				this.prev();
			}
		});

		// Auto-play szüneteltetése hover alatt
		this.container.addEventListener("mouseenter", () => this.stopAutoPlay());
		this.container.addEventListener("mouseleave", () => this.startAutoPlay());
	}

	handleSwipe() {
		const swipeThreshold = 50;
		const diff = startX - endX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				this.next();
			} else {
				this.prev();
			}
		}
	}

	prev() {
		if (this.isAnimating) return;

		this.isAnimating = true;
		this.currentIndex--;

		this.updateCarousel();

		// Végtelen loop ellenőrzés
		if (this.currentIndex === 0) {
			setTimeout(() => {
				this.track.style.transition = "none";
				this.currentIndex = this.cards.length - 2;
				this.updateCarousel();
				setTimeout(() => {
					this.track.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
				}, 50);
			}, 600);
		}

		setTimeout(() => {
			this.isAnimating = false;
		}, 600);
	}

	next() {
		if (this.isAnimating) return;

		this.isAnimating = true;
		this.currentIndex++;

		this.updateCarousel();

		// Végtelen loop ellenőrzés
		if (this.currentIndex === this.cards.length - 1) {
			setTimeout(() => {
				this.track.style.transition = "none";
				this.currentIndex = 1;
				this.updateCarousel();
				setTimeout(() => {
					this.track.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
				}, 50);
			}, 600);
		}

		setTimeout(() => {
			this.isAnimating = false;
		}, 600);
	}

	updateCarousel() {
		const translateX = -this.currentIndex * this.cardWidth;
		this.track.style.transform = `translateX(${translateX}px)`;

		// Aktív kártya stílus frissítése
		this.cards.forEach((card, index) => {
			const isActive = index === this.currentIndex;
			card.classList.toggle("active", isActive);
		});
	}

	startAutoPlay() {
		this.stopAutoPlay();
		this.autoPlayInterval = setInterval(() => {
			this.next();
		}, 4000); // 4 másodpercenként vált
	}

	stopAutoPlay() {
		if (this.autoPlayInterval) {
			clearInterval(this.autoPlayInterval);
			this.autoPlayInterval = null;
		}
	}
}

// Carousel inicializálása
document.addEventListener("DOMContentLoaded", () => {
	const carouselContainer = document.querySelector(".carousel-container");
	if (carouselContainer) {
		new InfiniteCarousel(carouselContainer);
	}

	// Kártya kattintási események
	const cards = document.querySelectorAll(".carousel-card");
	cards.forEach((card) => {
		card.addEventListener("click", (e) => {
			if (!e.target.closest(".view-all")) {
				card.classList.toggle("expanded");
			}
		});
	});
});
