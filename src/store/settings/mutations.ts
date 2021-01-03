import { MutationTree } from 'vuex';
import { SettingsState } from '@/store/types';
import { Framework } from 'vuetify';
import { storeService } from '@/electron/services/electron-store';

function isObject<T>(item: T) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep<T>(source: T, target: T): T {
  return Object.entries(source).reduce(
    (acc, [key, value]) => {
      if (isObject(value)) {
        return key in target
          ? (() => {
              acc[key as keyof T] = mergeDeep(value, target[key as keyof T]);
              return acc;
            })()
          : Object.assign(acc, { [key]: value });
      } else {
        return Object.assign(acc, { [key]: value });
      }
    },
    { ...target }
  );
}

const mutations: MutationTree<SettingsState> = {
  loadSettings(state, { vuetify }: { vuetify: Framework }) {
    const storedSettings = storeService.getAppSettings(state);
    Object.assign(state, mergeDeep(storedSettings, state));
    vuetify.theme.dark = state.appearance.theme.dark;
  },
  changeSettings(
    state,
    { vuetify, payload }: { vuetify: Framework; payload: SettingsState }
  ) {
    storeService.setAppSettings(payload);
    Object.assign(state, storeService.getAppSettings());
    vuetify.theme.dark = state.appearance.theme.dark;
  },
  restoreSettings() {
    storeService.clear();
  },
};

export default mutations;
