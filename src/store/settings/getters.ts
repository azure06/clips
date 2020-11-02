import { GetterTree } from 'vuex';
import { RootState, SettingsState } from '@/store/types';

const getters: GetterTree<SettingsState, RootState> = {
  settings: (state: SettingsState) => state,
};

export default getters;
