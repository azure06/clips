import { ActionTree } from 'vuex';
import { RootState, AppConfState, Clip, User } from '@/store/types';
import {
  setAlwaysOnTop,
  setShortcut,
  setStartup,
  signIn,
  signOut,
} from '@/utils/invocation';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isSuccess, isSuccessHttp } from '@/electron/utils/invocation-handler';

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
    } else {
      console.error("Something went wrong. Couldn't set at startup");
    }
  },
  async setAlwaysOnTop({ commit, state }, alwaysOnTop) {
    if (isSuccess(await setAlwaysOnTop(alwaysOnTop))) {
      commit('setGeneral', { ...state.general, alwaysOnTop });
    } else {
      console.error("Something went wrong. Couldn't set at always on Top");
    }
  },
  async setShortcut({ commit, state }, shortcut) {
    if (isSuccess(await setShortcut(shortcut))) {
      commit('setAdvanced', { ...state.advanced, shortcut });
    } else {
      console.error("Something went wrong. Couldn't set at always on Top");
    }
  },
};

export default actions;
