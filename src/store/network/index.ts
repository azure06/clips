import { Module } from 'vuex';
import { RootState, NetworkState } from '@/store/types';
import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const state: NetworkState = {
  users: [],
  rooms: [],
  fetching: false,
};

export const network: Module<NetworkState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
