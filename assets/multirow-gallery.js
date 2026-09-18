/*
  Multirow row gallery.

  Swipeable, loops infinitely in both directions, never auto-advances.
  Looping is done with a cloned slide at each end: when the viewer settles on a
  clone, the scroll position jumps silently to the matching real slide.
*/
class MultirowGallery extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-gallery-track]');
    this.bars = Array.from(this.querySelectorAll('[data-gallery-bar]'));
    this.count = Number(this.dataset.count || 0);

    if (!this.track || this.count < 2) return;

    this.addClones();
    this.bars.forEach((bar, index) => bar.addEventListener('click', () => this.goTo(index)));
    this.track.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.onResize.bind(this));

    // Start on the first real slide, past the leading clone
    requestAnimationFrame(() => this.scrollToIndex(1, 'auto'));
  }

  addClones() {
    const slides = Array.from(this.track.children);
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    [firstClone, lastClone].forEach((clone) => {
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.clone = 'true';
      clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
    });

    this.track.appendChild(firstClone);
    this.track.insertBefore(lastClone, slides[0]);
  }

  get slideWidth() {
    return this.track.clientWidth;
  }

  scrollToIndex(index, behavior) {
    this.track.scrollTo({ left: index * this.slideWidth, behavior: behavior || 'smooth' });
  }

  goTo(realIndex) {
    this.scrollToIndex(realIndex + 1, 'smooth');
  }

  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.scrollToIndex(this.activeIndex + 1, 'auto'), 100);
  }

  onScroll() {
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.onSettled(), 80);
  }

  onSettled() {
    const index = Math.round(this.track.scrollLeft / this.slideWidth);

    if (index === 0) {
      // Leading clone of the last slide — jump to the real last slide
      this.scrollToIndex(this.count, 'auto');
      this.setActive(this.count - 1);
      return;
    }

    if (index === this.count + 1) {
      // Trailing clone of the first slide — jump to the real first slide
      this.scrollToIndex(1, 'auto');
      this.setActive(0);
      return;
    }

    this.setActive(index - 1);
  }

  setActive(index) {
    this.activeIndex = index;
    this.bars.forEach((bar, position) => {
      bar.classList.toggle('is-active', position === index);
      bar.setAttribute('aria-current', position === index ? 'true' : 'false');
    });
  }
}

customElements.define('multirow-gallery', MultirowGallery);
