import { GetterTree } from 'vuex';
import { UserState, RootState, SettingsState } from '@/store/types';

const getters: GetterTree<SettingsState, RootState> = {
  settings: (state: SettingsState) => state,
};

export default getters;
