import { ActionTree } from 'vuex';
import { AppConfState, Clip, RootState } from '@/renderer/store/types';
import {
  relaunchApp,
  setShortcut,
  setStartup,
  signIn,
  signOut,
} from '@/renderer/invokers';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { from, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isSuccess, isSuccessHttp } from '@/utils/result';
import * as remote from '@/renderer/invokers/remote';

const actions: ActionTree<AppConfState, RootState> = {
  signIn: async ({ commit }) => {
    lastValueFrom(
      from(signIn()).pipe(
        tap((res) => {
          if (isSuccessHttp(res) && res.data.user)
            commit('setUser', res.data.user);
        })
      )
    );
  },
  signOut: async ({ commit }) => {
    lastValueFrom(from(signOut()).pipe(tap(() => commit('setUser', null))));
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
    if (
      isSuccess(await remote.getCurrentWindow('setAlwaysOnTop', alwaysOnTop))
    ) {
      commit('setGeneral', { ...state.general, alwaysOnTop });
    }
  },
  async setSkipTaskbar({ commit, state }, skipTaskbar) {
    if (
      isSuccess(await remote.getCurrentWindow('setSkipTaskbar', skipTaskbar))
    ) {
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
