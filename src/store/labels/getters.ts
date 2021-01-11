import { GetterTree } from 'vuex';
import { LabelState, RootState } from '@/store/types';

const getters: GetterTree<LabelState, RootState> = {
  labels: (state) => state.labels,
};

export default getters;
