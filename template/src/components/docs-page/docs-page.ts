import { BaseComponent, html, css } from '../../core/base-component.ts';

const template = html`
<div class="container mx-auto p-8 max-w-4xl">
  <header class="mb-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
    <p class="text-xl text-gray-600">Learn how to build minimalist web applications with Boba.</p>
  </header>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Getting Started</h2>
    <p class="mb-4 text-gray-700">Boba is designed for simplicity. It uses native Web Components and TypeScript with Node.js v25+ type stripping, meaning you can write TypeScript that runs almost directly in the browser.</p>
    <div class="bg-gray-100 p-4 rounded-lg font-mono text-sm">
      <pre>npx github:sholtomaud/boba my-app
cd my-app
npm install
npm start</pre>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Components</h2>
    <p class="mb-4 text-gray-700">Components in Boba are standard Web Components that extend <code>BaseComponent</code>. They encapsulate their own HTML and CSS.</p>
    <div class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
<pre>import { BaseComponent, html, css } from '../../core/base-component.ts';

const template = html\`&lt;h1&gt;Hello World&lt;/h1&gt;\`;
const style = css\`h1 { color: blue; }\`;

export class MyComponent extends BaseComponent {
  static tagName = 'my-component';
  constructor() {
    super(template, style);
  }
}

customElements.define(MyComponent.tagName, MyComponent);</pre>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Routing</h2>
    <p class="mb-4 text-gray-700">The lightweight router allows you to map paths to components easily in <code>main.ts</code>.</p>
    <div class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
<pre>const router = Router.getInstance();
router.registerRoute({ path: '/', component: 'home-page' });
router.registerRoute({ path: '/about', component: 'about-page' });</pre>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Global State</h2>
    <p class="mb-4 text-gray-700">Boba includes a simple <code>Store</code> class for reactive global state management using <code>EventTarget</code>.</p>
    <div class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
<pre>// In your store file
export const appStore = new Store({ count: 0 });

// In your component
init() {
  appStore.addEventListener('change', (e) => {
    this.render(e.detail.count);
  });
}</pre>
    </div>
  </section>
</div>
`;

const style = css`
:host {
  display: block;
}
code {
  background-color: #edf2f7;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}
`;

export class DocsPageComponent extends BaseComponent {
  static tagName = 'docs-page';
  constructor() {
    super(template, style);
  }
}

if (!customElements.get(DocsPageComponent.tagName)) {
  customElements.define(DocsPageComponent.tagName, DocsPageComponent);
}
