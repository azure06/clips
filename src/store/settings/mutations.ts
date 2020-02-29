import { MutationTree } from 'vuex';
import { SettingsState } from '@/store/types';
import { Framework } from 'vuetify';
import objectUtil from '@/utils/object';
import { storeService } from '@/electron/services/electron-store.service';

const mutations: MutationTree<SettingsState> = {
  loadSettings(state, { vuetify }: { vuetify: Framework }) {
    const storedSettings = storeService.getAppSettings(state);
    Object.assign(state, objectUtil.mergeDeep(state, storedSettings));
    vuetify.theme.dark = state.appearance.theme.dark;
  },
  changeSettings(state, { vuetify, payload }: { vuetify: Framework; payload: SettingsState }) {
    storeService.setAppSettings(payload);
    Object.assign(state, storeService.getAppSettings());
    vuetify.theme.dark = state.appearance.theme.dark;
  },
  restoreSettings() {
    storeService.clear();
  },
};

export default mutations;
