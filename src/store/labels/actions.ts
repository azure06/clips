import { ActionTree } from 'vuex';
import { Clip, RootState } from '@/store/types';
import { ClipSearchConditions } from '@/rxdb/clips/model';

const actions: ActionTree<unknown, RootState> = {
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
};

export default actions;
