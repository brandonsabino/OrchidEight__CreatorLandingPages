/*
  Creator YouTube videos.

  A scroll-snap carousel: arrows step one video at a time and wrap around at
  either end, dots jump to a video, and both stay in sync with manual swiping.
  Never plays or advances on its own.

  Wrapping is done by jumping the scroll position rather than cloning slides,
  which would load every cloned YouTube embed a second time.
*/
class CreatorYoutubeGrid extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-yt-track]');
    if (!this.track) return;

    this.slides = Array.from(this.track.children);
    this.prev = this.querySelector('[data-yt-prev]');
    this.next = this.querySelector('[data-yt-next]');
    this.dots = Array.from(this.querySelectorAll('[data-yt-dot]'));

    if (this.prev) this.prev.addEventListener('click', () => this.step(-1));
    if (this.next) this.next.addEventListener('click', () => this.step(1));
    this.dots.forEach((dot, index) => dot.addEventListener('click', () => this.goTo(index)));

    this.track.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.onScroll.bind(this));
    this.update();
  }

  get slideWidth() {
    if (this.slides.length < 2) return this.track.clientWidth;
    return this.slides[1].offsetLeft - this.slides[0].offsetLeft;
  }

  get maxScroll() {
    return this.track.scrollWidth - this.track.clientWidth;
  }

  step(direction) {
    // A pixel of slack: fractional widths mean the ends are rarely exact
    const atStart = this.track.scrollLeft <= 1;
    const atEnd = this.track.scrollLeft >= this.maxScroll - 1;

    if (direction > 0 && atEnd) {
      this.track.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    if (direction < 0 && atStart) {
      this.track.scrollTo({ left: this.maxScroll, behavior: 'smooth' });
      return;
    }

    this.track.scrollBy({ left: direction * this.slideWidth, behavior: 'smooth' });
  }

  goTo(index) {
    this.track.scrollTo({ left: index * this.slideWidth, behavior: 'smooth' });
  }

  onScroll() {
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.update(), 80);
  }

  update() {
    const width = this.slideWidth;
    const index = width ? Math.round(this.track.scrollLeft / width) : 0;

    // Arrows never disable: they wrap around instead of stopping at the ends
    this.dots.forEach((dot, position) => {
      const active = position === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }
}

customElements.define('creator-youtube-grid', CreatorYoutubeGrid);
