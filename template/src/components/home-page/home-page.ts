import { BaseComponent, html, css } from '../../core/base-component.ts';
import { appStore } from '../../store/app-store.ts';

const template = html`
<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-4xl w-full">
    <header class="mb-12">
      <h1 class="text-7xl font-extrabold text-gray-900 mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Boba</h1>
      <p class="text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">Welcome to your new Boba application!</p>
    </header>

    <div class="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 mb-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Global State Example</h2>
      <div class="flex items-center justify-center space-x-8 mb-10">
        <button id="decrement" class="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full text-2xl font-bold transition-all">-</button>
        <span id="home-counter" class="text-6xl font-black text-blue-600 tabular-nums">0</span>
        <button id="increment" class="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-green-100 hover:text-green-600 rounded-full text-2xl font-bold transition-all">+</button>
      </div>
      <p class="text-gray-500 italic">This counter is synchronized with the navigation bar via the Boba Store.</p>
    </div>

    <div class="bg-gray-900 text-white p-10 rounded-3xl shadow-2xl mb-16 relative overflow-hidden">
      <div class="relative z-10 text-left">
        <h3 class="text-xl font-bold mb-6 flex items-center">
          <svg class="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Quick Start
        </h3>
        <p class="text-gray-400 mb-4">Edit <code>src/components/home-page/home-page.ts</code> to start building your application.</p>
        <div class="flex flex-wrap gap-4 mt-8">
          <div class="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-xs font-mono">
            <span class="text-green-400"># Start local server</span><br/>npm run dev
          </div>
          <div class="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-xs font-mono">
            <span class="text-green-400"># Run tests</span><br/>npm test
          </div>
        </div>
      </div>
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
    </div>

    <div class="flex items-center justify-center space-x-6 text-sm">
      <div class="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span class="text-gray-600 font-mono">Tests: PASSING</span>
      </div>
      <div class="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
        <span class="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Version</span>
        <span id="version-tag" class="text-blue-600 font-bold font-mono">v1.0.0</span>
      </div>
    </div>
  </div>
</div>
`;

const style = css`
:host {
  display: block;
}
`;

export class HomeComponent extends BaseComponent {
  static tagName = 'home-page';

  constructor() {
    super(template, style);
  }

  init() {
    this.setupEventListeners();
    this.updateCounter(appStore.getState().count);

    appStore.addEventListener('change', ((e: CustomEvent) => {
      this.updateCounter(e.detail.count);
    }) as EventListener);
  }

  setupEventListeners() {
    this.shadowRoot?.getElementById('increment')?.addEventListener('click', () => {
      const { count } = appStore.getState();
      appStore.setState({ count: count + 1 });
    });

    this.shadowRoot?.getElementById('decrement')?.addEventListener('click', () => {
      const { count } = appStore.getState();
      appStore.setState({ count: count - 1 });
    });
  }

  updateCounter(count: number) {
    const counterEl = this.shadowRoot?.getElementById('home-counter');
    if (counterEl) {
      counterEl.textContent = count.toString();
    }
  }
}

if (!customElements.get(HomeComponent.tagName)) {
  customElements.define(HomeComponent.tagName, HomeComponent);
}
