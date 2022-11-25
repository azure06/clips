import {
  BehaviorSubject,
  EMPTY,
  Subject,
  from,
  lastValueFrom,
  merge,
  of,
  range,
} from 'rxjs';
import {
  concatMap,
  expand,
  map,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { ActionTree } from 'vuex';

import { Data } from '@/electron/services/clipboard';
import * as storeService from '@/electron/services/electron-store';
import * as clipboardInvokers from '@/renderer/invokers/clipboard';
import * as configurationInvokers from '@/renderer/invokers/configuration';
import * as googleDriveInvokers from '@/renderer/invokers/google-drive';
import * as leveldownInvokers from '@/renderer/invokers/leveldown';
import * as remote from '@/renderer/invokers/remote';
import {
  AppConfState,
  Clip,
  ClipsState,
  RootState,
  Advanced,
} from '@/renderer/store/types';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { isAuthenticated } from '@/utils/common';
import { always, identity } from '@/utils/environment';
import { fold, isSuccess, isSuccessHttp } from '@/utils/result';

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
      const res = await leveldownInvokers.switchdb(of('idb'))('findClips', {
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

export const methods = leveldownInvokers.switchdb(
  adapterObserver.pipe(take(1))
);

const actions: ActionTree<ClipsState, RootState> = {
  findClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(concatMap(() => methods('findClips', searchConditions)))
        .pipe(map((result) => (isSuccess(result) ? result.data : [])))
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  loadClips: async (
    { commit },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(concatMap(() => methods('findClips', searchConditions)))
        .pipe(map((result) => (isSuccess(result) ? result.data : [])))
        .pipe(tap((clips) => commit('loadClips', { clips })))
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  loadNext: async (
    { commit, state },
    searchConditions: Partial<ClipSearchConditions>
  ) =>
    lastValueFrom(
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
    ),
  addClip: async ({ commit }, clip: Clip) =>
    lastValueFrom(
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
    ),
  modifyClip: async (
    { commit },
    { clip, options }: { clip: Clip; options?: { silently?: boolean } }
  ) =>
    lastValueFrom(
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
    ),
  editImage: async (_, clip: Clip) => configurationInvokers.openEditor(clip.id),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withCommand: async (
    { rootState },
    args: { format: configurationInvokers.Format; data: string }
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { advanced }: { advanced: Advanced } = (rootState as any)
      .configuration;
    const func = async (command: string, commandArgs: string) => {
      const result =
        args.format === 'image/png'
          ? await clipboardInvokers.imagePathToDataURI(args.data) // This is smart enough to handle real links and dataURI
          : { status: 'success' as const, data: args.data };
      if (isSuccess(result))
        configurationInvokers.withCommand(
          { format: args.format, command, args: commandArgs },
          result.data
        );
    };
    const arr = await Promise.all(
      advanced.commands.map(async ([_, command, argu, format, action]) => {
        switch (format) {
          case 'all':
            return func(command, argu);
          case 'html':
            return args.format === 'text/html'
              ? func(command, argu)
              : Promise.resolve();
          case 'json':
            return args.format === 'plain/text'
              ? Promise.resolve(args.data)
                  .then((data) => JSON.parse(data))
                  .then(() => func(command, argu))
                  .catch(() => console.log('Invalid json'))
              : Promise.resolve();
          case 'picture':
            return args.format === 'image/png'
              ? func(command, argu)
              : Promise.resolve();
          case 'rtf':
            return args.format === 'text/rtf'
              ? func(command, argu)
              : Promise.resolve();
          case 'text':
            return args.format === 'plain/text'
              ? func(command, argu)
              : Promise.resolve();
        }
      })
    );
    console.log(arr);
  },
  removeClips: async ({ commit }, ids: string[]) =>
    lastValueFrom(
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
                    .map((clip) => clipboardInvokers.removeImage(clip.dataURI))
                )
              : Promise.resolve()
          )
        )
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  /** Remove clipboard item before X date excluding starred */
  removeClipsLte: async ({ commit }, updatedAt: number) =>
    lastValueFrom(
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
                    .map((clip) => clipboardInvokers.removeImage(clip.dataURI))
                )
              : Promise.resolve()
          )
        )
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  restoreFactoryDefault: async ({ commit }) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(
          concatMap(() =>
            Promise.all([
              methods('restoreFactoryDefault'),
              clipboardInvokers.removeImageDirectory(),
            ])
          )
        )
        .pipe(map(([head]) => head))
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  copyToClipboard: async (_, data: Data) =>
    clipboardInvokers.copyToClipboard(data),
  // force:
  retrieveFromDrive: async (
    { commit, dispatch, rootState },
    args: { fileIds: string[]; force?: boolean }
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { drive } = (rootState as any).configuration as AppConfState;
    const obs = of(
      args.fileIds.filter(
        (fieldId) => !drive.syncedFiles[fieldId] || args.force
      )
    ).pipe(
      tap(() => commit('setSyncStatus', 'pending')),
      expand((fieldIds) => {
        const [fileId, ...tail] = fieldIds;
        return fieldIds.length > 0
          ? from(googleDriveInvokers.retrieveFileFromDrive(fileId))
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
              .pipe(map(always(tail)))
          : EMPTY;
      }),
      tap(() => commit('setSyncStatus', 'resolved'))
    );
    return lastValueFrom(obs);
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
      const response = await googleDriveInvokers.uploadToDrive(clips);
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
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setProcessingStatus', true)))
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(concatMap(() => methods('dumpCollection')))
        .pipe(map((result) => (isSuccess(result) ? result.data : [])))
        .pipe(tap(() => commit('setProcessingStatus', false)))
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  createBackup: async ({ commit }, clips: Clip[]) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setProcessingStatus', true)))
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(
          concatMap(async () => {
            const { filePath } = await remote.dialog('showSaveDialog', {
              defaultPath: 'untitled',
              filters: [{ name: 'Json File', extensions: ['json'] }],
            });
            return filePath
              ? (async () => {
                  // prettier-ignore
                  const func = async ([head, ...tail]: Clip[], data: Clip[] = []): Promise<Clip[]> => {
                    return head === undefined
                      ? data
                      : func(tail, [...data, { ...head, dataURI: fold(identity, always(head.dataURI), await clipboardInvokers.imagePathToDataURI(head.dataURI)) }]);
                  };
                  const response = await clipboardInvokers.createBackup(
                    filePath,
                    await func(clips)
                  );
                  return isSuccess(response) ? clips : [];
                })()
              : [];
          })
        )
        .pipe(tap(() => commit('setProcessingStatus', false)))
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
  restoreBackup: async ({ commit, dispatch }) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setProcessingStatus', true)))
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(
          concatMap(async () => {
            const { filePaths } = await remote.dialog('showOpenDialog', {
              properties: ['openFile'],
              filters: [{ name: 'Json File', extensions: ['json'] }],
            });
            return filePaths.length > 0
              ? (async () => {
                  const result = await clipboardInvokers.restoreBackup(
                    filePaths[0]
                  );
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
    ),
  countClips: ({ commit }) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setLoadingStatus', true)))
        .pipe(concatMap(async () => methods('countAllDocuments')))
        .pipe(map((result) => (isSuccess(result) ? result.data : 0)))
        .pipe(tap(() => commit('setLoadingStatus', false)))
    ),
};

export default actions;
