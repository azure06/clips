import { ActionTree } from 'vuex';
import { ClipsState, Clip, RootState } from '@/store/types';
import { createDatabase } from '@/rxdb';
import { from, EMPTY, of } from 'rxjs';
import { ClipSearchConditions } from '@/rxdb/clips.models';
import { map, concatMap, tap, take, catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/electron';
import { ipcRenderer } from 'electron';
import { isDriveResponse } from '@/utils/drive';
import { storeService } from '@/electron/services/electron-store';
import { remote } from 'electron';

let clipsDB = from(createDatabase());

const collection = () => clipsDB.pipe(map((db) => db.clips));

const actions: ActionTree<ClipsState, RootState> = {
  loadClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    collection()
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
      .toPromise(),
  loadNext: async (
    { commit, state },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods.findClips({ skip: state.clips.length, ...searchConditions })
          ).pipe(
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
      .toPromise(),
  addClip: async ({ commit }, clip: Clip) =>
    collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods
              .findClips({
                filters: clip.dataURI
                  ? { dataURI: clip.dataURI }
                  : { plainText: clip.plainText },
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
      .toPromise(),
  modifyClip: async (
    { commit },
    { clip, options }: { clip: Clip; options?: { silently?: boolean } }
  ) =>
    collection()
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
      .pipe(
        tap((clip) => (clip ? commit('modifyClip', { clip, options }) : null))
      )
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  removeClips: async ({ commit }, ids: string[]) =>
    collection()
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
      .toPromise(),
  /** Remove clipboard item before X date excluding starred */
  removeClipsLte: async ({ commit }, updatedAt: number) =>
    collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods
              .findClipsLte(updatedAt)
              .then((clips) =>
                methods.removeClips(clips.map((clip) => clip.id))
              )
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
      .toPromise(),
  restoreFactoryDefault: async ({ commit }) =>
    collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(concatMap((methods) => methods.restore()))
      .pipe()
      .pipe(
        tap((result) => {
          if (result) {
            clipsDB = from(createDatabase());
            commit('loadClips', { clips: [] });
          }
          return result;
        })
      )
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  copyToClipboard: async (
    { commit },
    { type, payload }: { type: 'text' | 'base64'; payload: string }
  ) =>
    from(ipcRenderer.invoke('copy-to-clipboard', type, payload))
      .pipe(catchError((error) => Sentry.captureException(error)))
      .pipe(take(1))
      .toPromise(),
  uploadToDrive: async (
    { commit },
    args?: { clip: Clip; threshold?: number }
  ) => {
    const clips =
      args && args.clip
        ? [...storeService.getClips(), args.clip]
        : storeService.getClips();
    if (
      !args ||
      (args.threshold === undefined && clips.length > 0) ||
      (!!args && args.threshold !== undefined && clips.length >= args.threshold)
    ) {
      commit('setSyncStatus', 'pending');
      const response = await ipcRenderer
        .invoke('upload-to-drive', clips)
        .catch((error) => error);
      if (isDriveResponse(response)) {
        storeService.removeClips();
        commit('setSyncStatus', 'resolved');
      } else {
        commit('setSyncStatus', 'rejected');
      }
    } else {
      storeService.setClips(clips);
    }
    return clips;
  },
  fromDump: async ({ commit }) =>
    collection()
      .pipe(tap((_) => commit('setProcessingStatus', true)))
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(concatMap((methods) => methods.dumpCollection()))
      .pipe(
        catchError((error) => {
          Sentry.captureException(error);
          return of([]);
        })
      )
      .pipe(tap((_) => commit('setProcessingStatus', false)))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  downloadJson: async ({ commit }, clips: Clip[]) =>
    collection()
      .pipe(tap((_) => commit('setProcessingStatus', true)))
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap(async () => {
          const { filePath } = await remote.dialog.showSaveDialog({
            defaultPath: 'untitled',
            filters: [{ name: 'Json File', extensions: ['json'] }],
          });
          return filePath
            ? ipcRenderer.invoke('downloadJson', filePath, clips)
            : [];
        })
      )
      .pipe(
        catchError((error) => {
          Sentry.captureException(error);
          return of([]);
        })
      )
      .pipe(tap((_) => commit('setProcessingStatus', false)))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  uploadJson: async ({ commit, dispatch }) =>
    collection()
      .pipe(tap((_) => commit('setProcessingStatus', true)))
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap(async (_) => {
          const { filePaths } = await remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Json File', extensions: ['json'] }],
          });
          return (filePaths.length > 0
            ? ipcRenderer.invoke('uploadJson', filePaths[0])
            : Promise.resolve([])) as Promise<Clip[]>;
        })
      )
      .pipe(
        catchError((error) => {
          Sentry.captureException(error);
          return of([] as Clip[]);
        })
      )
      .pipe(
        concatMap((clips) =>
          Promise.all(clips.map((clip) => dispatch('addClip', clip)))
        )
      )
      .pipe(tap((_) => commit('setProcessingStatus', false)))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  countClips: ({ commit }) =>
    collection()
      .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(concatMap(async (methods) => methods.countAllDocuments()))
      .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
};

export default actions;
