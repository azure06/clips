import { GetterTree } from 'vuex';
import { ClipsState, RootState } from '@/store/types';

const getters: GetterTree<ClipsState, RootState> = {
  loading: (state: ClipsState) => {
    return state.loading;
  },
  processing: (state: ClipsState) => {
    return state.processing;
  },
  syncStatus: (state: ClipsState) => {
    return state.sync;
  },
  clips: (state: ClipsState) => {
    return state.clips;
  },
};

export default getters;
