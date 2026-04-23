import './components/home-page/home-page.ts';
import './components/nav-page/nav-page.ts';
import './components/analysis-page/analysis-page.ts';
import './components/results-page/results-page.ts';
import './components/about-page/about-page.ts';
import './components/history-page/history-page.ts';
import { Router } from './core/router/router.ts';

// GitHub Pages base URL for this repo
window.BOBA_BASE_URL = '/football-weekly-ahp/';

function getInitialAppPath() {
  const pathname = window.location.pathname;
  const BASE_URL = window.BOBA_BASE_URL;
  const normalizedBaseUrl =
    BASE_URL.endsWith('/') || BASE_URL === '/' ? BASE_URL : BASE_URL + '/';

  if (pathname.startsWith(normalizedBaseUrl) && normalizedBaseUrl.length > 1) {
    let appPath = pathname.substring(normalizedBaseUrl.length - 1);
    if (!appPath.startsWith('/')) {
      appPath = '/' + appPath;
    }
    return appPath === '' ? '/' : appPath;
  }
  return pathname.startsWith('/') ? pathname : '/' + pathname;
}

// Register routes
const router = Router.getInstance();
router.registerRoute({ path: '/', component: 'home-page' });
router.registerRoute({ path: '/analysis', component: 'analysis-page' });
router.registerRoute({ path: '/results', component: 'results-page' });
router.registerRoute({ path: '/about', component: 'about-page' });
router.registerRoute({ path: '/history', component: 'history-page' });

// Initial load
router.navigate(getInitialAppPath());
