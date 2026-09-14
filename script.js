(() => {
  "use strict";

  class CVCarousel {
    constructor(root) {
      this.root = root;
      this.track = root.querySelector(".carousel-track");
      this.cards = [...root.querySelectorAll(".carousel-card")];
      this.prevButton = root.querySelector("[data-carousel-prev]");
      this.nextButton = root.querySelector("[data-carousel-next]");
      this.dots = root.querySelector("[data-carousel-dots]");
      this.counter = root.querySelector("[data-carousel-counter]");
      this.current = 0;
      this.touchStartX = 0;
      this.touchEndX = 0;

      if (!this.track || !this.cards.length) return;

      this.createDots();
      this.bindEvents();
      this.render();
    }

    createDots() {
      if (!this.dots) return;

      this.dots.innerHTML = "";

      this.cards.forEach((_, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "carousel-dot";
        button.setAttribute("aria-label", `Mostrar elemento ${index + 1}`);
        button.addEventListener("click", () => this.goTo(index));
        this.dots.appendChild(button);
      });
    }

    bindEvents() {
      this.prevButton?.addEventListener("click", () => this.previous());
      this.nextButton?.addEventListener("click", () => this.next());

      this.root.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          this.previous();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          this.next();
        }

        if (event.key === "Home") {
          event.preventDefault();
          this.goTo(0);
        }

        if (event.key === "End") {
          event.preventDefault();
          this.goTo(this.cards.length - 1);
        }
      });

      this.root.addEventListener("touchstart", (event) => {
        this.touchStartX = event.changedTouches[0].screenX;
      }, { passive: true });

      this.root.addEventListener("touchend", (event) => {
        this.touchEndX = event.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });

      window.addEventListener("resize", () => this.render());

      // Clicking a side card makes it the active card.
      this.cards.forEach((card, index) => {
        card.addEventListener("click", () => {
          if (index !== this.current) this.goTo(index);
        });
      });
    }

    handleSwipe() {
      const distance = this.touchEndX - this.touchStartX;

      if (Math.abs(distance) < 45) return;

      if (distance < 0) {
        this.next();
      } else {
        this.previous();
      }
    }

    next() {
      this.goTo(this.current + 1);
    }

    previous() {
      this.goTo(this.current - 1);
    }

    goTo(index) {
      const total = this.cards.length;
      this.current = (index + total) % total;
      this.render();
    }

    render() {
      const total = this.cards.length;

      this.cards.forEach((card, index) => {
        let offset = index - this.current;

        // Wrap the offset so the closest cards remain visible on either side.
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const abs = Math.abs(offset);
        const isActive = offset === 0;

        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-visible", abs <= 2);

        if (abs > 2) {
          card.style.transform = "translate3d(0, 0, -900px) scale(.65)";
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
          card.style.zIndex = "0";
          return;
        }

        const x = offset * this.getHorizontalOffset();
        const z = isActive ? 0 : -Math.min(abs * 105, 210);
        const scale = isActive ? 1 : abs === 1 ? 0.86 : 0.72;
        const rotateY = offset * -18;
        const opacity = isActive ? 1 : abs === 1 ? 0.72 : 0.32;

        card.style.transform =
          `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
        card.style.opacity = opacity;
        card.style.zIndex = String(100 - abs);
        card.style.pointerEvents = isActive ? "auto" : "auto";
      });

      if (this.prevButton) {
        this.prevButton.disabled = total < 2;
      }

      if (this.nextButton) {
        this.nextButton.disabled = total < 2;
      }

      if (this.counter) {
        this.counter.textContent = `${this.current + 1} / ${total}`;
      }

      if (this.dots) {
        [...this.dots.children].forEach((dot, index) => {
          const active = index === this.current;
          dot.classList.toggle("is-active", active);
          dot.setAttribute("aria-current", active ? "true" : "false");
        });
      }
    }

    getHorizontalOffset() {
      if (window.innerWidth <= 600) return 150;
      if (window.innerWidth <= 900) return 210;
      return 270;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".cv-carousel").forEach((carousel) => {
      carousel.setAttribute("tabindex", "0");
      new CVCarousel(carousel);
    });
  });
})();