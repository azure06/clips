import { Module } from 'vuex';

import { ClipsState, RootState } from '@/renderer/store/types';

import actions from './actions';
import getters from './getters';
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
