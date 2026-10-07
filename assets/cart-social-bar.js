/*
  Cart Social Bar.

  The cart page changes quantities and removes items without a reload, so the
  creators listed here can go stale. On every cart update this re-fetches the
  section through the Section Rendering API and swaps in the fresh markup.
*/
if (!customElements.get('cart-social-bar')) {
  customElements.define(
    'cart-social-bar',
    class CartSocialBar extends HTMLElement {
      connectedCallback() {
        if (typeof subscribe !== 'function' || typeof PUB_SUB_EVENTS === 'undefined') return;
        this.unsubscribe = subscribe(PUB_SUB_EVENTS.cartUpdate, () => this.refresh());
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      async refresh() {
        const sectionId = this.dataset.sectionId;
        const cartUrl = (window.routes && window.routes.cart_url) || '/cart';

        try {
          const response = await fetch(`${cartUrl}?section_id=${sectionId}`);
          if (!response.ok) return;

          const html = new DOMParser().parseFromString(await response.text(), 'text/html');
          const fresh = html.querySelector('cart-social-bar');
          if (fresh) this.innerHTML = fresh.innerHTML;
        } catch (error) {
          console.error(error);
        }
      }
    }
  );
}
