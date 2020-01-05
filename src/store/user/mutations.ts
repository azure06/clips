import { MutationTree } from 'vuex';
import { UserState, User } from '@/store/types';
import Vue from 'vue';
import Store from 'electron-store';

const mutations: MutationTree<UserState> = {
  loadUser(state) {
    const store = new Store();
    Vue.set(state, 'user', store.get('user'));
  },
  setUser(state, user: User) {
    Vue.set(state, 'user', user);
  },
};

export default mutations;
