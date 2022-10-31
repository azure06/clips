import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { NetworkState, RootState } from '@/renderer/store/types';
import { Module } from 'vuex';

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
