export class BaseComponent extends HTMLElement {
  template: HTMLTemplateElement;

  constructor(htmlContent: string, cssContent: string) {
    super();
    this.template = document.createElement('template');
    this.template.innerHTML = `<style>${cssContent}</style>${htmlContent}`;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot?.appendChild(this.template.content.cloneNode(true));
    this.init();
  }

  init() {}
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

export function css(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}
