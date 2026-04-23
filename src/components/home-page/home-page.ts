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
    const whuStayUpEl = this.shadowRoot?.getElementById('whu-stayup-home');
    const arsenalEl = this.shadowRoot?.getElementById('arsenal-title-home');
    const cityEl = this.shadowRoot?.getElementById('city-title-home');
    const spursSurvEl = this.shadowRoot?.getElementById('spurs-survival-home');

    if (whuStayUpEl) {
      whuStayUpEl.innerHTML = `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#7A263A" stroke="#1BB1E7" stroke-width="2"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-weight="900" font-size="20">WHU</text></svg>`;
    }
    if (arsenalEl) arsenalEl.innerHTML = arsenalCrest;
    if (spursSurvEl) spursSurvEl.innerHTML = spursCrest;
    if (cityEl) {
      cityEl.innerHTML = `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#6CABDD" stroke="#ffffff" stroke-width="1.5"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-weight="900" font-size="20">MCFC</text></svg>`;
    }

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
