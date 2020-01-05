import { MutationTree } from 'vuex';
import { SettingsState } from '@/store/types';
import Store from 'electron-store';
import { Framework } from 'vuetify';
import Vue from 'vue';
import objectUtil from '@/utils/object';

const mutations: MutationTree<SettingsState> = {
  loadSettings(state, { vuetify }: { vuetify: Framework }) {
    const store = new Store();
    const storedSettings: SettingsState = store.get('app-settings', state);
    Object.assign(state, objectUtil.mergeDeep(state, storedSettings));
    vuetify.theme.dark = state.appearance.theme.dark;
  },
  changeSettings(state, { vuetify, payload }: { vuetify: Framework; payload: SettingsState }) {
    const store = new Store();
    store.set('app-settings', payload);
    Object.assign(state, store.get('app-settings'));
    vuetify.theme.dark = state.appearance.theme.dark;
  },
  restoreSettings() {
    const store = new Store();
    store.clear();
  },
};

export default mutations;
