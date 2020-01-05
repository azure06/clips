import { ActionTree } from 'vuex';
import { ClipsState, Clip, RootState } from '@/store/types';
import { createDB } from '@/rxdb';
import { from, EMPTY, of } from 'rxjs';
import { ClipSearchConditions } from '@/rxdb/clips.models';
import { map, concatMap, tap, take, catchError, startWith } from 'rxjs/operators';
import * as Sentry from '@sentry/electron';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import { GaxiosResponse, GaxiosError } from 'gaxios';
import { isGaxiosResponse } from '@/utils/gaxios';

let clipsDB = from(createDB());
const collection = () => clipsDB.pipe(map((db) => db.clips));

const actions: ActionTree<ClipsState, RootState> = {
  loadClips: async ({ commit }, searchConditions: Partial<ClipSearchConditions>) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.findClips(searchConditions)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((clips) => commit('loadClips', { clips })))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  loadNext: async ({ commit, state }, searchConditions: Partial<ClipSearchConditions>) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.findClips({ skip: state.clips.length, ...searchConditions })).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((clips) => commit('addClips', { clips })))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  addClip: async ({ commit }, clip: Clip) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods
              .findClips({
                filters: { plainText: clip.plainText },
              })
              .then(async ([targetClip]) => {
                clip = !targetClip
                  ? await methods.insertClip(clip)
                  : await methods.modifyClip(targetClip);
                return { action: targetClip ? 'modifyClip' : 'addClip', clip };
              })
          ).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return EMPTY;
            })
          )
        )
      )
      .pipe(tap(({ action, clip }) => commit(action, { clip })))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  modifyClip: async (
    { commit },
    { clip, options }: { clip: Clip; options?: { silently?: boolean } }
  ) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.modifyClip(clip)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return EMPTY;
            })
          )
        )
      )
      .pipe(tap((clip) => (clip ? commit('modifyClip', { clip, options }) : null)))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  removeClips: async ({ commit }, ids: string[]) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.removeClips(ids)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((clips) => commit('removeClips', { clips })))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  removeClipsLte: async ({ commit }, updatedAt: number) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods
              .findClipsLte(updatedAt)
              .then((clips) => methods.removeClips(clips.map((clip) => clip.id)))
          ).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((clips) => commit('removeClips', { clips })))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  restoreFactoryDefault: async ({ commit }) => {
    return collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(concatMap((methods) => methods.restore()))
      .pipe()
      .pipe(
        tap((result) => {
          if (result) {
            clipsDB = from(createDB());
            commit('loadClips', { clips: [] });
          }
          return result;
        })
      )
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise();
  },
  copyToClipboard: async ({ commit }, clip: Clip) =>
    from(
      ipcRenderer.invoke(
        'copy-to-clipboard',
        clip.type,
        clip.type === 'image' ? clip.dataURI : clip.plainText
      )
    )
      .pipe(catchError((error) => Sentry.captureException(error)))
      .pipe(take(1))
      .toPromise(),
  uploadToDrive: async ({ commit }, args: { clip: Clip; threshold: number; force?: boolean }) => {
    const store = new Store();
    const targetNm = 'clips';
    const clips: Clip[] = store.get(targetNm, []);
    clips.push(args.clip);
    if (clips.length >= args.threshold || args.force) {
      commit('setSyncStatus', 'pending');
      const response: GaxiosResponse | GaxiosError = await ipcRenderer
        .invoke('upload-to-drive', clips)
        .catch((_) => {});
      if (isGaxiosResponse(response) && response.status === 200) {
        store.set(targetNm, []);
        commit('setSyncStatus', 'resolved');
      } else {
        commit('setSyncStatus', 'rejected');
      }
    } else {
      store.set(targetNm, clips);
      return clips;
    }
  },
};

export default actions;
