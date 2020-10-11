import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import { clips } from './clips/index';
import { user } from './user/index';
import { settings } from './settings/index';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    // @ts-ignore
    date: __DATE__,
    // @ts-ignore
    commit: __COMMITHASH__,
    // @ts-ignore
    version: __VERSION__,
    // @ts-ignore
    branch: __BRANCH__,
  },
  getters: {
    rootState: (state) => state,
  },
  modules: {
    clips,
    user,
    settings,
  },
};

export default new Vuex.Store<RootState>(store);
