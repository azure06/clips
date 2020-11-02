import { ActionTree } from 'vuex';
import { RootState, SettingsState } from '@/store/types';
import { ipcRenderer } from 'electron';

const actions: ActionTree<SettingsState, RootState> = {
  async changeShortcut({ commit, state }, { vuetify, payload: shortcut }) {
    await ipcRenderer.invoke('change-shortcut', shortcut);
    commit('changeSettings', {
      vuetify,
      payload: {
        ...state,
        system: { ...state.system, shortcut },
      } as SettingsState,
    });
  },
  async changeStartup({ commit, state }, { vuetify, payload: startup }) {
    await ipcRenderer.invoke('change-startup', startup);
    commit('changeSettings', {
      vuetify,
      payload: {
        ...state,
        system: { ...state.system, startup },
      } as SettingsState,
    });
  },
};

export default actions;
