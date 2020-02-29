import { Module } from 'vuex';
import { ClipsState, RootState } from '@/store/types';
import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const state: ClipsState = {
  loading: false,
  processing: false,
  sync: 'resolved',
  clips: [],
};

export const clips: Module<ClipsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
