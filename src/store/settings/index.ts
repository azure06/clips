import { Module } from 'vuex';
import { RootState, SettingsState } from '@/store/types';
import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { remote } from 'electron';

const currentWindow = remote.getCurrentWindow();
const { x, y } = currentWindow.getBounds();

const state: SettingsState = {
  drive: {
    sync: false,
    threshold: 100,
  },
  storage: {
    search: {
      type: 'fuzzy',
    },
    optimize: {
      every: 0,
    },
    formats: {
      plainText: true,
      richText: false,
      htmlText: false,
      dataURI: true,
    },
  },
  appearance: {
    theme: {
      dark: false,
    },
  },
  system: {
    display: {
      type: 'maintain',
      position: { x, y },
      width: 820,
      height: 410,
    },
    notifications: true,
    startup: false,
    blur: false,
    language: 'Auto',
    shortcut: remote.process.platform === 'darwin' ? ['⌘', 'shift', 'V'] : ['ctrl', 'alt', 'V'],
  },
};

export const settings: Module<SettingsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
