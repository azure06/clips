import { MutationTree } from 'vuex';
import { UserState, User } from '@/store/types';
import Vue from 'vue';
import storeService from '../../electron/service/electron-store.service';

const mutations: MutationTree<UserState> = {
  loadUser(state) {
    storeService.getUser();
    Vue.set(state, 'user', storeService.getUser());
  },
  setUser(state, user: User) {
    Vue.set(state, 'user', user);
  },
};

export default mutations;
