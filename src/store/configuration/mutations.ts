import { MutationTree } from 'vuex';
import {
  Appearance,
  General,
  AppConfState,
  Label,
  Advanced,
  User,
  InAppStatus,
  Drive,
} from '@/store/types';
import { Framework } from 'vuetify';
import * as storeService from '@/electron/services/electron-store';
import Vue from 'vue';

function isObject<T>(item: T) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep<T>(source: T, target: T): T {
  return Object.entries(target).reduce(
    (acc, [key, value]) => {
      if (isObject(value)) {
        return key in source
          ? (() => {
              acc[key as keyof T] = mergeDeep(source[key as keyof T], value);
              return acc;
            })()
          : Object.assign(acc, { [key]: value });
      } else {
        return Object.assign(acc, { [key]: value });
      }
    },
    { ...source }
  );
}

function labelMap(func: (args: Label[]) => Label[], conf: AppConfState) {
  const { labels } = storeService.getAppConf(conf);
  const labels_ = func(labels);
  storeService.setAppConf({
    ...conf,
    labels: labels_,
  });
  return storeService.getAppConf(conf).labels;
}

const mutations: MutationTree<AppConfState> = {
  loadConfig(state, { vuetify }: { vuetify: Framework }) {
    const storedConfig = storeService.getAppConf(state);
    Object.assign(
      state,
      mergeDeep(state, { ...storedConfig, inAppStatus: 'none' })
    );
    vuetify.theme.dark = state.appearance.theme === 'dark';
  },
  setUser(state, user: User) {
    storeService.setAppConf({ ...state, user });
    Vue.set(state, 'user', storeService.getAppConf(state).user);
  },
  setGeneral(state, general: General) {
    storeService.setAppConf({ ...state, general });
    state.general = storeService.getAppConf(state).general;
  },
  setAdvanced(state, advanced: Advanced) {
    storeService.setAppConf({ ...state, advanced });
    state.advanced = storeService.getAppConf(state).advanced;
  },
  setDrive(state, drive: Drive) {
    storeService.setAppConf({ ...state, drive });
    state.drive = storeService.getAppConf(state).drive;
  },
  setAppearance(state, payload: Appearance & { vuetify: Framework }) {
    const { vuetify, ...appearance } = payload;
    storeService.setAppConf({ ...state, appearance });
    state.appearance = storeService.getAppConf(state).appearance;
    vuetify.theme.dark = state.appearance.theme === 'dark';
  },
  setPremium: (state, premium: boolean) => {
    storeService.setAppConf({ ...state, premium });
    state.premium = storeService.getAppConf(state).premium;
  },
  setInAppStatus: (state, inAppStatus: InAppStatus) => {
    storeService.setAppConf({ ...state, inAppStatus });
    state.inAppStatus = storeService.getAppConf(state).inAppStatus;
  },
  addLabel(state, label: Label) {
    state.labels = labelMap(
      (labels) =>
        labels.find((label_) => label_.name === label.name)
          ? labels
          : [
              ...labels,
              { ...label, createdAt: Date.now(), updatedAt: Date.now() },
            ],
      state
    );
  },
  modifyLabel(state, label: Label) {
    state.labels = labelMap(
      (labels) =>
        labels.find((label_) => label_.name === label.name)
          ? labels
          : labels.map((label_) =>
              label_.id === label.id
                ? { ...label, updateAt: Date.now() }
                : label_
            ),
      state
    );
  },
  removeLabel(state, labelId: string) {
    state.labels = labelMap(
      (labels) => labels.filter((label) => label.id !== labelId),
      state
    );
  },
  restoreSettings() {
    storeService.clear();
  },
};

export default mutations;
