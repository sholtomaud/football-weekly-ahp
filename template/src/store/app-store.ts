import { Store } from '../core/store.ts';

interface AppState {
  count: number;
}

export const appStore = new Store<AppState>({
  count: 0,
});
