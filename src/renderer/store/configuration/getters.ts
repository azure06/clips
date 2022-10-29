import { GetterTree } from 'vuex';
import { AppConfState, RootState } from '@/renderer/store/types';

const getters: GetterTree<AppConfState, RootState> = {
  user: (state: AppConfState) => state.user,
  labels: (state: AppConfState) => state.labels,
  general: (state: AppConfState) => state.general,
  advanced: (state: AppConfState) => state.advanced,
  drive: (state: AppConfState) => state.drive,
  appearance: (state: AppConfState) => state.appearance,
  premium: (state: AppConfState) => state.premium,
  development: (state: AppConfState) => state.development,
  inAppStatus: (state: AppConfState) => state.inAppStatus,
};

export default getters;
