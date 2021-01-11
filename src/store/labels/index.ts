import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { Label, LabelState, RootState } from '@/store/types';
import { Module } from 'vuex';

export const defaultLabel = {
  color: 'blue darken-2',
  id: 'starred',
  name: 'Starred',
};

export const labels: Module<LabelState, RootState> = {
  namespaced: true,
  state: {
    labels: (() => {
      try {
        return [
          defaultLabel,
          ...JSON.parse(localStorage.getItem('labels') || '[]'),
        ] as Label[];
      } catch (e) {
        return [defaultLabel];
      }
    })(),
  },
  getters,
  actions,
  mutations,
};
