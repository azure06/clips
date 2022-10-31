import { ipcRenderer } from 'electron';
import { Module } from 'vuex';

import { ShortcutFuzzy } from '@/electron/services/shortcuts';
import { AppConfState, RootState } from '@/renderer/store/types';
import { SENDERS } from '@/utils/constants';
import { always, whenMacOS } from '@/utils/environment';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const { x, y } = ipcRenderer.sendSync(SENDERS.GET_BOUNDS_SYNC);

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
    rxdbAdapter: 'auto',
    searchMode: 'fuzzy',
    optimize: 0,
    formats: {
      plainText: true,
      richText: false,
      htmlText: false,
      dataURI: true,
    },
    language: 'Auto',
    shortcut: whenMacOS<ShortcutFuzzy>(
      always(['⌘', 'shift', 'V']),
      always(['ctrl', 'alt', 'V'])
    ),
  },
  development: { analytics: true },
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
