import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { ClipsState, RootState } from '@/renderer/store/types';
import { Module } from 'vuex';

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
