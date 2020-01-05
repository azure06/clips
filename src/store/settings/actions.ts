import { ActionTree } from 'vuex';
import { RootState, SettingsState } from '@/store/types';
import { ipcRenderer } from 'electron';

const actions: ActionTree<SettingsState, RootState> = {
  async changeShortcut({ commit, state }, { vuetify, payload }) {
    await ipcRenderer.invoke('change-shortcut', payload);
    commit('changeSettings', {
      vuetify: vuetify,
      payload: { ...state, system: { ...state.system, shortcut: payload } } as SettingsState,
    });
  },
};

export default actions;
