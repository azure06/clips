import { storeService } from '../../electron/services/electron-store';
import { MutationTree } from 'vuex';
import { UserState, User } from '@/store/types';
import Vue from 'vue';

const mutations: MutationTree<UserState> = {
  loadUser(state) {
    Vue.set(state, 'user', storeService.getUser());
  },
  setUser(state, user: User) {
    Vue.set(state, 'user', user);
  },
};

export default mutations;
