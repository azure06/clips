import { ActionTree } from 'vuex';
import { UserState, User, RootState } from '@/store/types';
import { from, of } from 'rxjs';
import { map, concatMap, tap, take, catchError } from 'rxjs/operators';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

const actions: ActionTree<UserState, RootState> = {
  signIn: async ({ commit }) => {
    from(ipcRenderer.invoke('sign-in'))
      .pipe(
        tap((user?: User) => {
          if (user) {
            new Store().set('user', user);
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
          new Store().delete('user');
          commit('setUser', undefined);
        })
      )
      .toPromise();
  },
};

export default actions;
