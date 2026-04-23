import { BaseComponent, html, css } from '../../core/base-component.ts';

const template = html`
  <div class="about-container">
    <h1>About Boba</h1>
    <p>Boba is a minimalist framework for building web applications using modern Web Components and TypeScript.</p>
    <h2>Key Features:</h2>
    <ul>
      <li><strong>Web Components:</strong> Built on standard Custom Elements.</li>
      <li><strong>TypeScript:</strong> Full type safety with Node.js 25+ type stripping.</li>
      <li><strong>Router:</strong> Lightweight client-side routing with dynamic parameters.</li>
      <li><strong>Store:</strong> Simple reactive state management.</li>
    </ul>
  </div>
`;

const style = css`
  .about-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 {
    color: var(--primary-color, #007bff);
  }
  h2 {
    margin-top: 1.5rem;
  }
  ul {
    line-height: 1.6;
  }
`;

export class AboutComponent extends BaseComponent {
  static tagName = 'about-page';

  constructor() {
    super(template, style);
  }

  init() {}
}

if (!customElements.get(AboutComponent.tagName)) {
  customElements.define(AboutComponent.tagName, AboutComponent);
}
