import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { UserState, RootState } from '@/store/types';
import { Module } from 'vuex';

const state: UserState = {};

export const user: Module<UserState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
