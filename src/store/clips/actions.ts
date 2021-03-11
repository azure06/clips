import { ActionTree } from 'vuex';
import { ClipsState, Clip, RootState, AppConfState } from '@/store/types';
import { from, EMPTY, of, range, BehaviorSubject, Subject, merge } from 'rxjs';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import {
  concatMap,
  tap,
  take,
  expand,
  mapTo,
  withLatestFrom,
  map,
} from 'rxjs/operators';
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
  openEditor,
  switchdb,
} from '@/utils/invocation';
import { isAuthenticated } from '@/utils/common';
import { Data } from '@/electron/services/clipboard';
import { isSuccess, isSuccessHttp } from '@/utils/handler';

export const copySilently = new BehaviorSubject(false);
export const rxAdapter = new Subject<'idb' | 'leveldb'>();

storeService.watchRxDBAdapter((value) =>
  value !== 'auto' ? rxAdapter.next(value) : null
);

export const adapterObserver = merge(
  from(
    (async () => {
      // {"filename":"//./src/helpers/methods.ts?","function":"Module.eval [as findClips]","type":"ReferenceError","value":"Cannot access 'findClips' before initialization"}
      await new Promise((resolve) => setTimeout(resolve, 0));
      const res = await switchdb(of('idb'))('findClips', {
        limit: 1,
      });
      return isSuccess(res) ? res.data.length === 0 : false;
    })()
  ).pipe(
    map((isEmpty) => {
      const { rxdbAdapter } = storeService.getAppConf()?.advanced ?? {
        rxdbAdapter: 'auto',
      };
      return rxdbAdapter === 'auto'
        ? isEmpty
          ? ('leveldb' as const)
          : ('idb' as const)
        : rxdbAdapter;
    })
  ),
  rxAdapter.asObservable()
);

export const methods = switchdb(adapterObserver.pipe(take(1)));

const actions: ActionTree<ClipsState, RootState> = {
  findClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('findClips', searchConditions)))
      .pipe(map((result) => (isSuccess(result) ? result.data : [])))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  loadClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('findClips', searchConditions)))
      .pipe(map((result) => (isSuccess(result) ? result.data : [])))
      .pipe(tap((clips) => commit('loadClips', { clips })))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  loadNext: async (
    { commit, state },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap(() =>
          methods('findClips', {
            skip: state.clips.length,
            ...searchConditions,
          })
        )
      )
      .pipe(map((result) => (isSuccess(result) ? result.data : [])))
      .pipe(tap((clips) => commit('addClips', { clips })))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  addClip: async ({ commit }, clip: Clip) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('addClip', clip)))
      .pipe(withLatestFrom(copySilently.asObservable()))
      .pipe(
        tap(([response, silently]) => {
          copySilently.next(false);
          if (isSuccess(response))
            commit(response.data.action, {
              clip: response.data.clip,
              options: { silently },
            });
        })
      )
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  modifyClip: async (
    { commit },
    { clip, options }: { clip: Clip; options?: { silently?: boolean } }
  ) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('modifyClip', clip)))
      .pipe(
        tap((response) => {
          if (isSuccess(response))
            commit('modifyClip', { clip: response.data, options });
        })
      )
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  editImage: async (_, clip: Clip) => openEditor(clip.id),
  removeClips: async ({ commit }, ids: string[]) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('removeClips', ids)))
      .pipe(
        tap((response) => {
          if (isSuccess(response))
            commit('removeClips', { clips: response.data });
        })
      )
      .pipe(
        concatMap((res) =>
          isSuccess(res)
            ? Promise.all(
                res.data
                  .filter((clip) => clip.type === 'image')
                  .map((clip) => removeImage(clip.dataURI))
              )
            : Promise.resolve()
        )
      )
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  /** Remove clipboard item before X date excluding starred */
  removeClipsLte: async ({ commit }, updatedAt: number) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('removeClipsLte', updatedAt)))
      .pipe(
        tap((response) => {
          if (isSuccess(response))
            commit('removeClips', { clips: response.data });
        })
      )
      .pipe(
        concatMap((res) =>
          isSuccess(res)
            ? Promise.all(
                res.data
                  .filter((clip) => clip.type === 'image')
                  .map((clip) => removeImage(clip.dataURI))
              )
            : Promise.resolve()
        )
      )
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  restoreFactoryDefault: async ({ commit }) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(
        concatMap(() =>
          Promise.all([
            methods('restoreFactoryDefault'),
            removeImageDirectory(),
          ])
        )
      )
      .pipe(map(([head]) => head))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  copyToClipboard: async (_, data: Data) => copyToClipboard(data),
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
    range(1, 1)
      .pipe(tap(() => commit('setProcessingStatus', true)))
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(() => methods('dumpCollection')))
      .pipe(map((result) => (isSuccess(result) ? result.data : [])))
      .pipe(tap(() => commit('setProcessingStatus', false)))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
  createBackup: async ({ commit }, clips: Clip[]) =>
    range(1, 1)
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
      .toPromise(),
  restoreBackup: async ({ commit, dispatch }) =>
    range(1, 1)
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
      .toPromise(),
  countClips: ({ commit }) =>
    range(1, 1)
      .pipe(tap(() => commit('setLoadingStatus', true)))
      .pipe(concatMap(async () => methods('countAllDocuments')))
      .pipe(map((result) => (isSuccess(result) ? result.data : 0)))
      .pipe(tap(() => commit('setLoadingStatus', false)))
      .toPromise(),
};

export default actions;
