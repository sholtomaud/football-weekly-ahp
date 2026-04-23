import { Router } from '../../core/router/router.ts';
import { BaseComponent, html, css } from '../../core/base-component.ts';
import { appStore } from '../../store/app-store.ts';

const template = html`
<nav class="bg-gray-900 text-white p-4 shadow-md">
  <div class="container mx-auto flex justify-between items-center px-4">
    <div class="flex items-center space-x-6">
      <a href="/" class="text-2xl font-bold tracking-tight hover:text-blue-400 transition-colors">Boba</a>
      <ul class="flex space-x-6 text-sm font-medium">
        <li><a href="/" class="hover:text-blue-400 transition-colors">Home</a></li>
        <li><a href="/docs" class="hover:text-blue-400 transition-colors">Docs</a></li>
        <li><a href="/about" class="hover:text-blue-400 transition-colors">About</a></li>
        <li><a href="/todo" class="hover:text-blue-400 transition-colors">To-Do</a></li>
        <li><a href="/user/Boba" class="hover:text-blue-400 transition-colors">User</a></li>
      </ul>
    </div>
    <div class="flex items-center space-x-6">
      <div class="hidden md:flex items-center bg-gray-800 px-3 py-1 rounded-full text-xs font-mono">
        <span class="text-gray-400 mr-2">Counter:</span>
        <span id="nav-counter" class="text-blue-400 font-bold">0</span>
      </div>
      <a href="https://github.com/sholtomaud/boba" target="_blank" rel="noopener noreferrer" class="hover:text-gray-400 transition-colors" title="GitHub Repository">
        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
        </svg>
      </a>
    </div>
  </div>
</nav>
`;

const style = css`
:host {
  display: block;
}
`;

export class NavComponent extends BaseComponent {
  static tagName = 'app-nav';

  constructor() {
    super(template, style);
  }

  init() {
    this.shadowRoot?.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('/') || href === '')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          Router.getInstance().navigate(href);
        });
      }
    });

    appStore.addEventListener('change', ((e: CustomEvent) => {
      this.updateCounter(e.detail.count);
    }) as EventListener);

    // Initial value
    this.updateCounter(appStore.getState().count);
  }

  updateCounter(count: number) {
    const counterEl = this.shadowRoot?.getElementById('nav-counter');
    if (counterEl) {
      counterEl.textContent = count.toString();
    }
  }
}

if (!customElements.get(NavComponent.tagName)) {
  customElements.define(NavComponent.tagName, NavComponent);
}
