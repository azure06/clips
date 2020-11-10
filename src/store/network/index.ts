import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { RootState, NetworkState } from '@/store/types';
import { Module } from 'vuex';

const state: NetworkState = {
  status: 'closed', // Server status
  users: [],
  rooms: [],
  loading: {
    room: false,
    message: false,
    user: false,
    devices: false,
  },
};

export const network: Module<NetworkState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
