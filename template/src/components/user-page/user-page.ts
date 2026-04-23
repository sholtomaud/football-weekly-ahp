import { BaseComponent, html, css } from '../../core/base-component.ts';

const style = css`
  .user-container {
    padding: 2rem;
    text-align: center;
  }
  h1 {
    color: var(--primary-color, #007bff);
  }
  strong {
    color: #fff;
    font-weight: bold;
  }
`;

export class UserPageComponent extends BaseComponent {
  static tagName = 'user-page';
  name: string = 'Guest';

  constructor() {
    const template = html`
      <div class="user-container">
        <h1>User Profile</h1>
        <p>Welcome, <strong><span id="user-name"></span></strong>!</p>
        <p>This page demonstrates dynamic routing with parameters.</p>
      </div>
    `;
    super(template, style);
  }

  init() {
    this.render();
  }

  render() {
    const nameElement = this.shadowRoot?.getElementById('user-name');
    if (nameElement) {
      nameElement.textContent = this.name;
    }
  }
}

if (!customElements.get(UserPageComponent.tagName)) {
  customElements.define(UserPageComponent.tagName, UserPageComponent);
}
