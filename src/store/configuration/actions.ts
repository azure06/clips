import { ActionTree } from 'vuex';
import { RootState, AppConfState, Clip, User } from '@/store/types';
import { setShortcut, setStartup, signIn, signOut } from '@/utils/invocation';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';

const actions: ActionTree<AppConfState, RootState> = {
  signIn: async ({ commit }) => {
    from(signIn())
      .pipe(tap((user?: User) => commit('setUser', user)))
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
  async setShortcut({ commit, state }, shortcut) {
    await setShortcut(shortcut);
    commit('setAdvanced', { ...state.advanced, shortcut });
  },
  async setStartup({ commit, state }, startup) {
    await setStartup(startup);
    commit('setGeneral', { ...state.general, startup });
  },
};

export default actions;
