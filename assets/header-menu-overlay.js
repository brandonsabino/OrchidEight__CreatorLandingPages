/*
  Desktop mega menu: overlay, scroll lock, and an exit animation.

  <details> stops rendering its content the moment `open` is removed, so a
  closing animation needs the attribute held back until the animation ends.
  Dawn's HeaderMenu overrides onToggle without calling super, so none of the
  animation handling in DetailsDisclosure applies to these menus.

  Escape and focus-out close through Dawn's own code paths, which remove `open`
  directly — those still close instantly, without the exit animation.
*/
class HeaderMenuOverlay {
  constructor() {
    this.header = document.querySelector('.header-wrapper');
    if (!this.header) return;

    this.menus = Array.from(this.header.querySelectorAll('header-menu > details.mega-menu'));
    if (!this.menus.length) return;

    this.menus.forEach((details) => {
      const summary = details.querySelector('summary');
      if (summary) summary.addEventListener('click', (event) => this.onSummaryClick(event, details));
      details.addEventListener('toggle', () => this.sync());
    });

    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.sync();
  }

  get openMenu() {
    return this.menus.find((details) => details.hasAttribute('open'));
  }

  onSummaryClick(event, details) {
    // Only intercept closing; opening is left to the browser
    if (!details.hasAttribute('open') || details.classList.contains('is-closing')) return;

    event.preventDefault();
    this.close(details);
  }

  onDocumentClick(event) {
    const open = this.openMenu;
    if (open && !open.contains(event.target)) this.close(open);
  }

  close(details) {
    const content = details.querySelector('.mega-menu__content');

    if (!content) {
      details.removeAttribute('open');
      this.sync();
      return;
    }

    details.classList.add('is-closing');

    const finish = () => {
      details.classList.remove('is-closing');
      details.removeAttribute('open');
      const summary = details.querySelector('summary');
      if (summary) summary.setAttribute('aria-expanded', 'false');
      this.sync();
    };

    content.addEventListener('animationend', finish, { once: true });
    // Fallback in case the animation never fires (reduced motion, interrupted)
    setTimeout(() => {
      if (details.classList.contains('is-closing')) finish();
    }, 500);
  }

  sync() {
    const isOpen = Boolean(this.openMenu);
    this.header.classList.toggle('header-wrapper--menu-open', isOpen);
    document.body.classList.toggle('overflow-hidden', isOpen);
  }
}

const initHeaderMenuOverlay = () => new HeaderMenuOverlay();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderMenuOverlay);
} else {
  initHeaderMenuOverlay();
}
