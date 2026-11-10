if (!customElements.get('collection-list-infinite-scroll')) {
  customElements.define(
    'collection-list-infinite-scroll',
    class CollectionListInfiniteScroll extends HTMLElement {
      constructor() {
        super();
        this.list = document.getElementById(this.dataset.listId);
        this.spinner = this.querySelector('.loading__spinner');
        this.loading = false;
      }

      connectedCallback() {
        if (!this.list || !this.dataset.nextUrl) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) this.loadNextPage();
          },
          { rootMargin: '0px 0px 600px 0px' }
        );
        this.observer.observe(this);
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
      }

      async loadNextPage() {
        if (this.loading || !this.dataset.nextUrl) return;
        this.loading = true;
        this.spinner.classList.remove('hidden');

        try {
          const url = new URL(this.dataset.nextUrl, window.location.origin);
          url.searchParams.set('section_id', this.dataset.sectionId);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error(`Request failed: ${response.status}`);

          const html = new DOMParser().parseFromString(await response.text(), 'text/html');
          const nextList = html.getElementById(this.dataset.listId);
          const nextTrigger = html.querySelector('collection-list-infinite-scroll');

          if (nextList) {
            // Stage new items in a container so the reveal-on-scroll observer only picks up the new cards.
            const staging = document.createElement('div');
            staging.append(...nextList.children);
            if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(staging);
            this.list.append(...staging.children);
          }

          if (nextTrigger && nextTrigger.dataset.nextUrl) {
            this.dataset.nextUrl = nextTrigger.dataset.nextUrl;
            this.loading = false;
            this.spinner.classList.add('hidden');
            // Re-check in case the sentinel is still in view after appending.
            this.observer.unobserve(this);
            this.observer.observe(this);
          } else {
            this.remove();
          }
        } catch (error) {
          console.error(error);
          this.loading = false;
          this.spinner.classList.add('hidden');
        }
      }
    }
  );
}
