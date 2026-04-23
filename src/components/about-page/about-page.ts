import { BaseComponent } from '../../core/base-component.ts';
import { Router } from '../../core/router/router.ts';
import { ahpState } from '../../core/ahp/state.ts';
import styles from './about-page.css?inline';
import rawTemplate from './about-page.html?raw';

export class AboutComponent extends BaseComponent {
  static tagName = 'about-page';

  constructor() {
    super(rawTemplate, styles);
  }

  init() {
    this.shadowRoot?.getElementById('start-btn')?.addEventListener('click', () => {
      ahpState.reset();
      Router.getInstance().navigate('/analysis');
    });
  }
}

if (!customElements.get(AboutComponent.tagName)) {
  customElements.define(AboutComponent.tagName, AboutComponent);
}
