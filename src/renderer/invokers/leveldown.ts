import { ipcRenderer } from 'electron';
import { Observable, lastValueFrom } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { RxDBAdapterNm } from '@/rxdb';
import {
  Methods,
  MethodsReturnType,
  ParamsAddClip,
  ParamsCountAllDocuments,
  ParamsDumpCollection,
  ParamsFindClips,
  ParamsFindMessage,
  ParamsFindRoomFromUserOrCreate,
  ParamsFindRooms,
  ParamsFindUser,
  ParamsLoadMessages,
  ParamsModifyClip,
  ParamsRemoveClips,
  ParamsRemoveClipsLte,
  ParamsRestoreFactoryDefault,
  ParamsSetMessageToRead,
  ParamsUpsertMessage,
  ParamsUpsertUser,
  ReturnAddClip,
  ReturnCountAllDocuments,
  ReturnDumpCollection,
  ReturnFindClips,
  ReturnFindMessage,
  ReturnFindRoomFromUserOrCreate,
  ReturnFindRooms,
  ReturnFindUser,
  ReturnLoadMessages,
  ReturnModifyClip,
  ReturnRemoveClips,
  ReturnRemoveClipsLte,
  ReturnRestoreFactoryDefault,
  ReturnSetMessageToRead,
  ReturnUpsertMessage,
  ReturnUpsertUser,
} from '@/utils/methods';
import * as methods from '@/utils/methods';

import { INVOCATION } from '../../utils/constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function switchdb(
  adapterObserver: Observable<RxDBAdapterNm>
): <T extends Methods>(
  methodNm: T,
  ...args: T extends 'findClips'
    ? ParamsFindClips
    : T extends 'addClip'
    ? ParamsAddClip
    : T extends 'modifyClip'
    ? ParamsModifyClip
    : T extends 'removeClips'
    ? ParamsRemoveClips
    : T extends 'removeClipsLte'
    ? ParamsRemoveClipsLte
    : T extends 'restoreFactoryDefault'
    ? ParamsRestoreFactoryDefault
    : T extends 'dumpCollection'
    ? ParamsDumpCollection
    : T extends 'countAllDocuments'
    ? ParamsCountAllDocuments
    : T extends 'findUser'
    ? ParamsFindUser
    : T extends 'upsertUser'
    ? ParamsUpsertUser
    : T extends 'findRooms'
    ? ParamsFindRooms
    : T extends 'findRoomFromUserOrCreate'
    ? ParamsFindRoomFromUserOrCreate
    : T extends 'loadMessages'
    ? ParamsLoadMessages
    : T extends 'findMessage'
    ? ParamsFindMessage
    : T extends 'upsertMessage'
    ? ParamsUpsertMessage
    : T extends 'setMessageToRead'
    ? ParamsSetMessageToRead
    : never
) => T extends 'findClips'
  ? ReturnFindClips
  : T extends 'addClip'
  ? ReturnAddClip
  : T extends 'modifyClip'
  ? ReturnModifyClip
  : T extends 'removeClips'
  ? ReturnRemoveClips
  : T extends 'removeClipsLte'
  ? ReturnRemoveClipsLte
  : T extends 'restoreFactoryDefault'
  ? ReturnRestoreFactoryDefault
  : T extends 'dumpCollection'
  ? ReturnDumpCollection
  : T extends 'countAllDocuments'
  ? ReturnCountAllDocuments
  : T extends 'findUser'
  ? ReturnFindUser
  : T extends 'upsertUser'
  ? ReturnUpsertUser
  : T extends 'findRooms'
  ? ReturnFindRooms
  : T extends 'findRoomFromUserOrCreate'
  ? ReturnFindRoomFromUserOrCreate
  : T extends 'loadMessages'
  ? ReturnLoadMessages
  : T extends 'findMessage'
  ? ReturnFindMessage
  : T extends 'upsertMessage'
  ? ReturnUpsertMessage
  : T extends 'setMessageToRead'
  ? ReturnSetMessageToRead
  : never;
export function switchdb(
  adapterObserver: Observable<RxDBAdapterNm>
): <T extends Methods>(methodNm: T, ...args: never[]) => MethodsReturnType {
  return <T extends Methods>(methodNm: T, ...args: never[]) => {
    const obs = adapterObserver.pipe(
      concatMap((adapter) =>
        adapter === 'idb'
          ? // eslint-disable-next-line import/namespace
            methods[methodNm](...args)
          : ipcRenderer.invoke(INVOCATION.NODE_DB, methodNm, args)
      )
    );
    return lastValueFrom(obs);
  };
}
