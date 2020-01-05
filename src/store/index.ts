import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import { clips } from './clips/index';
import { user } from './user/index';
import { settings } from './settings/index';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0',
  },
  modules: {
    clips,
    user,
    settings,
  },
};

export default new Vuex.Store<RootState>(store);
