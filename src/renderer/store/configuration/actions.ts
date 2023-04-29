import { from, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionTree } from 'vuex';

import * as configurationInvokers from '@/renderer/invokers/configuration';
import * as remote from '@/renderer/invokers/remote';
import * as signInInvokers from '@/renderer/invokers/sign-in';
import { AppConfState, Clip, RootState } from '@/renderer/store/types';
import { clipsModel } from '@/rxdb-v2/dist/src';
import { isSuccess, isSuccessHttp } from '@/utils/result';

const actions: ActionTree<AppConfState, RootState> = {
  signIn: async ({ commit }) => {
    lastValueFrom(
      from(signInInvokers.signIn()).pipe(
        tap((res) => {
          if (isSuccessHttp(res) && res.data.user)
            commit('setUser', res.data.user);
        })
      )
    );
  },
  signOut: async ({ commit }) => {
    lastValueFrom(
      from(signInInvokers.signOut()).pipe(tap(() => commit('setUser', null)))
    );
  },
  async removeLabel({ commit, dispatch }, labelId: string) {
    const clips: Clip[] = await dispatch(
      'clips/findClips',
      {
        filters: { category: labelId },
      } as Partial<clipsModel.ClipSearchConditions>,
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
    if (isSuccess(await configurationInvokers.setStartup(startup))) {
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
    if (isSuccess(await configurationInvokers.setShortcut(shortcut))) {
      commit('setAdvanced', { ...state.advanced, shortcut });
    }
  },
  async relaunchApp() {
    return configurationInvokers.relaunchApp();
  },
};

export default actions;
