import { ActionTree } from 'vuex';
import { ClipsState, Clip, RootState, AppConfState } from '@/store/types';
import { createClipsRxDB, removeClipsRxDB, getCollection } from '@/rxdb';
import { from, EMPTY, of, range } from 'rxjs';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import {
  concatMap,
  tap,
  take,
  catchError,
  expand,
  mapTo,
} from 'rxjs/operators';
import * as Sentry from '@sentry/electron';
import { remote } from 'electron';
import * as storeService from '@/electron/services/electron-store';
import {
  copyToClipboard,
  createBackup,
  restoreBackup,
  removeImage,
  removeImageDirectory,
  retrieveFileFromDrive,
  uploadToDrive,
} from '@/utils/invocation';
import { isSuccess, isSuccessHttp } from '@/utils/invocation-handler';
import { isAuthenticated } from '@/utils/common';
import { Data } from '@/electron/services/clipboard';

const collection = () => getCollection('clips');

const actions: ActionTree<ClipsState, RootState> = {
  findClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
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
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  loadClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
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
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  loadNext: async (
    { commit, state },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
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
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  addClip: async ({ commit }, clip: Clip) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods
              .findClips({
                filters: clip.dataURI
                  ? {
                      plainText: clip.plainText || undefined,
                      dataURI: clip.dataURI || undefined,
                    }
                  : {
                      plainText: clip.plainText || undefined,
                    },
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
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  modifyClip: async (
    { commit },
    { clip, options }: { clip: Clip; options?: { silently?: boolean } }
  ) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((collection) =>
          from(collection.modifyClip(clip)).pipe(
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
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  removeClips: async ({ commit }, ids: string[]) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.removeClips(ids)).pipe(
            concatMap(async (clips) => {
              await Promise.all(
                clips
                  .filter((clip) => clip.type === 'image')
                  .map((clip) =>
                    from(removeImage(clip.dataURI))
                      .pipe(take(1))
                      .toPromise()
                  )
              );
              return clips;
            })
          )
        )
      )
      .pipe(tap((clips) => commit('removeClips', { clips })))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  /** Remove clipboard item before X date excluding starred */
  removeClipsLte: async ({ commit, dispatch }, updatedAt: number) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(
            methods.findClipsLte(updatedAt).then((clips) =>
              dispatch(
                'removeClips',
                clips.map((clip) => clip.id)
              )
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
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  restoreFactoryDefault: async ({ commit }) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => removeClipsRxDB()))
      .pipe(
        tap((result) => {
          if (result.ok) commit('loadClips', { clips: [] });
        })
      )
      .pipe(concatMap(() => createClipsRxDB()))
      .pipe(
        concatMap(() =>
          from(removeImageDirectory())
            .pipe(take(1))
            .toPromise()
        )
      )
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  copyToClipboard: async (
    _,
    { type, data }: { type: 'text' | 'image'; data: Data }
  ) =>
    from(copyToClipboard(type, data))
      .pipe(take(1))
      .toPromise(),
  // force:
  retrieveFromDrive: async (
    { commit, dispatch, rootState },
    args: { fileIds: string[]; force?: boolean }
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { drive } = (rootState as any).configuration as AppConfState;
    return of(
      args.fileIds.filter(
        (fieldId) => !drive.syncedFiles[fieldId] || args.force
      )
    )
      .pipe(
        tap(() => commit('setSyncStatus', 'pending')),
        expand((fieldIds) => {
          const [fileId, ...tail] = fieldIds;
          return fieldIds.length > 0
            ? from(retrieveFileFromDrive(fileId))
                .pipe(
                  concatMap(async (response) => {
                    if (isSuccessHttp(response)) {
                      await Promise.all(
                        response.data.map((clip) => dispatch('addClip', clip))
                      );
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const { drive } = (rootState as any)
                        .configuration as AppConfState;
                      commit(
                        'configuration/setDrive',
                        {
                          ...drive,
                          syncedFiles: {
                            ...drive.syncedFiles,
                            [fileId]: true,
                          },
                        },
                        { root: true }
                      );
                    } else {
                      return Promise.resolve([]);
                    }
                  })
                )
                .pipe(mapTo(tail))
            : EMPTY;
        }),
        tap(() => commit('setSyncStatus', 'resolved'))
      )
      .toPromise();
  },
  uploadToDrive: async (
    { commit, rootState },
    args?: { clip: Clip; threshold?: number }
  ) => {
    const clips =
      args && args.clip
        ? [...storeService.getClips(), args.clip]
        : storeService.getClips();
    if (
      isAuthenticated() &&
      (!args ||
        (args.threshold === undefined && clips.length > 0) ||
        (!!args &&
          args.threshold !== undefined &&
          clips.length >= args.threshold))
    ) {
      commit('setSyncStatus', 'pending');
      const response = await uploadToDrive(clips);
      if (isSuccessHttp(response) && response.data.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { drive } = (rootState as any).configuration as AppConfState;
        commit(
          'configuration/setDrive',
          {
            ...drive,
            syncedFiles: { ...drive.syncedFiles, [response.data.id]: true },
          },
          { root: true }
        );
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
      .pipe(tap(() => commit('setProcessingStatus', true)))
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap((methods) => methods.dumpCollection()))
      .pipe(
        catchError((error) => {
          Sentry.captureException(error);
          return of([]);
        })
      )
      .pipe(tap(() => commit('setProcessingStatus', false)))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  createBackup: async ({ commit }, clips: Clip[]) =>
    collection()
      .pipe(tap(() => commit('setProcessingStatus', true)))
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap(async () => {
          const { filePath } = await remote.dialog.showSaveDialog({
            defaultPath: 'untitled',
            filters: [{ name: 'Json File', extensions: ['json'] }],
          });
          return filePath
            ? (async () => {
                const response = await createBackup(filePath, clips);
                return isSuccess(response) ? clips : [];
              })()
            : [];
        })
      )
      .pipe(tap(() => commit('setProcessingStatus', false)))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  restoreBackup: async ({ commit, dispatch }) =>
    collection()
      .pipe(tap(() => commit('setProcessingStatus', true)))
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap(async () => {
          const { filePaths } = await remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Json File', extensions: ['json'] }],
          });
          return filePaths.length > 0
            ? (async () => {
                const result = await restoreBackup(filePaths[0]);
                return isSuccess(result) ? result.data : [];
              })()
            : Promise.resolve([] as Clip[]);
        })
      )
      .pipe(
        concatMap((clips) =>
          Promise.all(clips.map((clip) => dispatch('addClip', clip)))
        )
      )
      .pipe(tap(() => commit('setProcessingStatus', false)))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  countClips: ({ commit }) =>
    collection()
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(async (methods) => methods.countAllDocuments()))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
};

export default actions;
