import { GetterTree } from 'vuex';
import { UserState, RootState, SettingsState } from '@/store/types';

const getters: GetterTree<SettingsState, RootState> = {
  settings: (state: SettingsState) => {
    return state;
  },
};

export default getters;
