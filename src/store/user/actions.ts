import { ActionTree } from 'vuex';
import { UserState, User, RootState } from '@/store/types';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ipcRenderer } from 'electron';
import { storeService } from '../../electron/services/electron-store.service';

const actions: ActionTree<UserState, RootState> = {
  signIn: async ({ commit }) => {
    from(ipcRenderer.invoke('sign-in'))
      .pipe(
        tap((user?: User) => {
          if (user) {
            storeService.setUser(user);
            commit('setUser', user);
          }
        })
      )
      .toPromise();
  },
  signOut: async ({ commit }) => {
    from(ipcRenderer.invoke('sign-out'))
      .pipe(
        tap((_) => {
          storeService.removeUser();
          commit('setUser', undefined);
        })
      )
      .toPromise();
  },
};

export default actions;
