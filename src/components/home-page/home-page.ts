import { BaseComponent } from '../../core/base-component.ts';
import { Router } from '../../core/router/router.ts';
import { ahpState } from '../../core/ahp/state.ts';
import rawTemplate from './home-page.html?raw';
import styles from './home-page.css?inline';
import arsenalCrest from '../../assets/crests/arsenal-crest.svg?raw';
import spursCrest from '../../assets/crests/spurs-crest.svg?raw';

export class HomeComponent extends BaseComponent {
  static tagName = 'home-page';

  constructor() {
    super(rawTemplate, styles);
  }

  init() {
    // Inject SVG crests into placeholder containers
    const spursCrestEl = this.shadowRoot?.getElementById('spurs-crest-home');
    const arsenalCrestEl = this.shadowRoot?.getElementById('arsenal-crest-home');

    if (spursCrestEl) spursCrestEl.innerHTML = spursCrest;
    if (arsenalCrestEl) arsenalCrestEl.innerHTML = arsenalCrest;

    // Start Analysis CTA
    this.shadowRoot?.getElementById('start-btn')?.addEventListener('click', () => {
      ahpState.reset();
      Router.getInstance().navigate('/analysis');
    });
  }
}

if (!customElements.get(HomeComponent.tagName)) {
  customElements.define(HomeComponent.tagName, HomeComponent);
}
