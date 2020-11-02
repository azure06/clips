import { RootState } from './types';
import { clips } from './clips/index';
import { user } from './user/index';
import { settings } from './settings/index';
import { network } from './network/index';
import Vuex, { StoreOptions } from 'vuex';
import Vue from 'vue';

declare const __DATE__: number;
declare const __COMMITHASH__: string;
declare const __VERSION__: string;
declare const __BRANCH__: string;

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    date: __DATE__,
    commit: __COMMITHASH__,
    version: __VERSION__,
    branch: __BRANCH__,
  },
  getters: {
    rootState: (state) => state,
  },
  modules: {
    clips,
    user,
    settings,
    network,
  },
};

export default new Vuex.Store<RootState>(store);
