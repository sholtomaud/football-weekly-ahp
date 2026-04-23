import './components/home-page/home-page.ts';
import './components/about-page/about-page.ts';
import './components/todo-page/todo-page.ts';
import './components/user-page/user-page.ts';
import { Router } from './core/router/router.ts';
import './components/nav-page/nav-page.ts';
import './components/docs-page/docs-page.ts';

// Setup BASE_URL for the router
window.BOBA_BASE_URL = '/';

function getInitialAppPath() {
  const pathname = window.location.pathname;
  const BASE_URL = window.BOBA_BASE_URL;
  const normalizedBaseUrl =
    BASE_URL.endsWith('/') || BASE_URL === '/' ? BASE_URL : BASE_URL + '/';

  if (pathname.startsWith(normalizedBaseUrl) && normalizedBaseUrl.length > 1) {
    let appPath = pathname.substring(normalizedBaseUrl.length);
    if (!appPath.startsWith('/')) {
      appPath = '/' + appPath;
    }
    return appPath === '' ? '/' : appPath;
  }
  return pathname.startsWith('/') ? pathname : '/' + pathname;
}

// Initialize router and register routes
const router = Router.getInstance();
router.registerRoute({ path: '/', component: 'home-page' });
router.registerRoute({ path: '/docs', component: 'docs-page' });
router.registerRoute({ path: '/about', component: 'about-page' });
router.registerRoute({ path: '/todo', component: 'todo-page' });
router.registerRoute({ path: '/user/:name', component: 'user-page' });

// Initial load
router.navigate(getInitialAppPath());
