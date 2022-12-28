import { Module } from 'vuex';

import { NetworkState, RootState } from '@/renderer/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state: NetworkState = {
  status: 'closed', // Server status
  users: [],
  rooms: [],
  loading: [false, false, false],
};

export const network: Module<NetworkState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
