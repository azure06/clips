import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { RootState, AppConfState } from '@/store/types';
import { Module } from 'vuex';
import { remote } from 'electron';
import { isMacOS } from '@/utils/environment';

const currentWindow = remote.getCurrentWindow();
const { x, y } = currentWindow.getBounds();

const state: AppConfState = {
  user: null,
  labels: [
    {
      color: 'blue darken-2',
      id: 'starred',
      name: 'Starred',
    },
  ],
  general: {
    notifications: true,
    startup: false,
    blur: false,
    alwaysOnTop: false,
    positioningMode: {
      type: 'maintain',
      position: { x, y },
      width: 820,
      height: 410,
    },
    skipTaskbar: true,
  },
  appearance: {
    theme: 'light',
  },
  drive: {
    sync: false,
    syncThreshold: 3600000 * 24, // 24h
    backup: false,
    backupThreshold: 100,
    syncedFiles: {},
  },
  advanced: {
    searchMode: 'fuzzy',
    optimize: 0,
    formats: {
      plainText: true,
      richText: false,
      htmlText: false,
      dataURI: true,
    },
    language: 'Auto',
    shortcut: isMacOS ? ['⌘', 'shift', 'V'] : ['ctrl', 'alt', 'V'],
  },
  premium: false,
  inAppStatus: 'none',
};

export const configuration: Module<AppConfState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
