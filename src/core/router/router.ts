export class Router {
  static instance;
  routes = [];

  constructor() {
    window.addEventListener('popstate', this.handleRoute.bind(this));
  }

  static getInstance() {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  getAppPath() {
    const pathname = window.location.pathname;
    // For plain JS without Vite, we might not have BASE_URL unless we define it
    const BASE_URL = window.BOBA_BASE_URL || '/';
    const normalizedBaseUrl =
      BASE_URL.endsWith('/') || BASE_URL === '/' ? BASE_URL : BASE_URL + '/';

    if (
      pathname.startsWith(normalizedBaseUrl) &&
      normalizedBaseUrl.length > 1
    ) {
      let appPath = pathname.substring(normalizedBaseUrl.length);
      if (!appPath.startsWith('/')) {
        appPath = '/' + appPath;
      }
      return appPath === '' ? '/' : appPath;
    }
    return pathname.startsWith('/') ? pathname : '/' + pathname;
  }

  registerRoute(route) {
    const normalizedPath = route.path.startsWith('/')
      ? route.path
      : '/' + route.path;
    this.routes.push({ ...route, path: normalizedPath });
  }

  navigate(appPath) {
    const normalizedAppPath = appPath.startsWith('/') ? appPath : '/' + appPath;
    const BASE_URL = window.BOBA_BASE_URL || '/';

    const dummyAbsoluteBase = 'http://dummy';
    const publicPath = new URL(
      normalizedAppPath.substring(1),
      dummyAbsoluteBase + (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/')
    ).pathname;

    if (window.location.pathname !== publicPath) {
      window.history.pushState({}, '', publicPath);
    }
    this.handleRoute();
  }

  handleRoute() {
    const appPathToMatch = this.getAppPath();
    const route = this.routes.find((r) => r.path === appPathToMatch);

    if (route) {
      this.loadComponent(route.component);
    } else {
      this.show404();
    }
  }

  async loadComponent(tagName) {
    const outlet = document.querySelector('#router-outlet');
    if (!outlet) return;

    try {
      // In plain JS, we expect components to be already imported or we lazy load them here
      // For simplicity in this "simplified" version, we might just assume they are registered
      // Or we can use dynamic imports if we have a mapping.

      // Let's assume a global mapping or conventional paths
      if (!customElements.get(tagName)) {
        await import(`../../components/${tagName}/${tagName}.ts`);
      }

      outlet.innerHTML = `<${tagName}></${tagName}>`;
    } catch (error) {
      console.error(`Failed to load component: ${tagName}`, error);
      this.show404();
    }
  }

  show404() {
    const outlet = document.querySelector('#router-outlet');
    if (outlet) {
      outlet.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
  }
}
