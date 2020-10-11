import { MutationTree } from 'vuex';
import { ClipsState, Clip } from '@/store/types';
import { storeService } from '@/electron/services/electron-store';

const mutations: MutationTree<ClipsState> = {
  loadClips: (state, { clips }: { clips: Clip[] }) => {
    state.clips = clips;
  },
  addClip: (state, { clip }: { clip: Clip }) => {
    state.clips.unshift(clip);
  },
  addClips: (state, { clips }: { clips: Clip[] }) => {
    clips.forEach((clip) => state.clips.push(clip));
  },
  /**
   *  @param silently if silently is set to true the clip will be not positioned at the top
   */
  modifyClip: (state, data: { clip: Clip; options?: { silently?: boolean } }) => {
    const silently = data.options ? !!data.options.silently : false;
    state.clips = silently
      ? (() => {
          const index = state.clips.findIndex((clip) => clip.id === data.clip.id);
          if (index !== -1) state.clips[index] = data.clip;
          return [...state.clips];
        })()
      : [data.clip, ...state.clips.filter((clip) => clip.id !== data.clip.id)];
  },
  removeClips: (state, { clips }: { clips: Clip[] }) => {
    state.clips = state.clips.filter(
      (clip) => !clips.find((targetClip) => targetClip.id === clip.id)
    );
  },
  setLoadingStatus: (state, loading: boolean) => {
    state.loading = loading;
  },
  setProcessingStatus: (state, processing: boolean) => {
    state.processing = processing;
  },
  setSyncStatus: (state, sync: 'pending' | 'resolved' | 'rejected') => {
    state.sync = sync;
  },
  setPremium: (state, premium: boolean) => {
    storeService.setPremium(premium);
    state.premium = premium;
  },
};

export default mutations;
