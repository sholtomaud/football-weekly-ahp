import { BaseComponent } from '../../core/base-component.ts';
import { Router } from '../../core/router/router.ts';
import template from './nav-page.html?raw';
import styles from './nav-page.css?inline';

export class NavComponent extends BaseComponent {
  static tagName = 'app-nav';

  constructor() {
    super(template, styles);
  }

  init() {
    // Intercept internal anchor clicks → client-side routing
    this.shadowRoot?.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          Router.getInstance().navigate(href);
        });
      }
    });

    // Brand click → home
    this.shadowRoot?.getElementById('nav-brand')?.addEventListener('click', () => {
      Router.getInstance().navigate('/');
    });

    this.shadowRoot?.getElementById('nav-brand')?.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        e.preventDefault();
        Router.getInstance().navigate('/');
      }
    });
  }
}

if (!customElements.get(NavComponent.tagName)) {
  customElements.define(NavComponent.tagName, NavComponent);
}
