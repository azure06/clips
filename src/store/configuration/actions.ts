import { ActionTree } from 'vuex';
import { RootState, AppConfState, Clip } from '@/store/types';
import {
  relaunchApp,
  setAlwaysOnTop,
  setShortcut,
  setSkipTaskbar,
  setStartup,
  signIn,
  signOut,
} from '@/utils/invocation';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isSuccess, isSuccessHttp } from '@/utils/handler';

const actions: ActionTree<AppConfState, RootState> = {
  signIn: async ({ commit }) => {
    from(signIn())
      .pipe(
        tap((res) => {
          if (isSuccessHttp(res) && res.data.user)
            commit('setUser', res.data.user);
        })
      )
      .toPromise();
  },
  signOut: async ({ commit }) => {
    from(signOut())
      .pipe(tap(() => commit('setUser', null)))
      .toPromise();
  },
  async removeLabel({ commit, dispatch }, labelId: string) {
    const clips: Clip[] = await dispatch(
      'clips/findClips',
      { filters: { category: labelId } } as Partial<ClipSearchConditions>,
      {
        root: true,
      }
    );
    await Promise.all(
      clips.map((clip) =>
        dispatch(
          'clips/modifyClip',
          { clip: { ...clip, category: 'none' } },
          {
            root: true,
          }
        )
      )
    );
    commit('removeLabel', labelId);
  },
  async setStartup({ commit, state }, startup) {
    if (isSuccess(await setStartup(startup))) {
      commit('setGeneral', { ...state.general, startup });
    }
  },
  async setAlwaysOnTop({ commit, state }, alwaysOnTop) {
    if (isSuccess(await setAlwaysOnTop(alwaysOnTop))) {
      commit('setGeneral', { ...state.general, alwaysOnTop });
    }
  },
  async setSkipTaskbar({ commit, state }, skipTaskbar) {
    if (isSuccess(await setSkipTaskbar(skipTaskbar))) {
      commit('setGeneral', { ...state.general, skipTaskbar });
    }
  },
  async setShortcut({ commit, state }, shortcut) {
    if (isSuccess(await setShortcut(shortcut))) {
      commit('setAdvanced', { ...state.advanced, shortcut });
    }
  },
  async relaunchApp() {
    return relaunchApp();
  },
};

export default actions;
