import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import { clips } from './clips/index';
import { configuration } from './configuration';
import { network } from './network/index';
import { RootState } from './types';

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
    configuration,
    network,
  },
};

export default new Vuex.Store<RootState>(store);
