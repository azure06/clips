import { from, lastValueFrom } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { IDevice } from '@/electron/services/socket.io/types';
import {
  createClipsRxDB as createClipsRxDB__,
  getCollection,
  initPlugins,
  removeClipsRxDB,
} from '@/rxdb';
import { ClipSearchConditions } from '@/rxdb/clips/model';
import { MessageDoc } from '@/rxdb/message/model';
import { UserDoc } from '@/rxdb/user/model';
import { whenRenderer } from '@/utils/environment';
import * as handler from '@/utils/result';

import { randomColor } from '../renderer/store/network/actions';
import { Clip } from '../renderer/store/types';

const adapter = from(
  whenRenderer(
    () => initPlugins('idb'),
    () => initPlugins('leveldb')
  )
);
const captureException = whenRenderer(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  () => require('@/utils/sentry').captureException,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  () => require('@/utils/sentry').captureException
);
let clipsRxDB = createClipsRxDB__(adapter);
const runCatching = handler.runCatching(captureException);
const clipsCollection = () => lastValueFrom(getCollection(clipsRxDB, 'clips'));
const userCollection = () => lastValueFrom(getCollection(clipsRxDB, 'user'));
const roomCollection = () => lastValueFrom(getCollection(clipsRxDB, 'room'));
const messageCollection = () =>
  lastValueFrom(getCollection(clipsRxDB, 'message'));

export type Methods =
  | 'findClips'
  | 'addClip'
  | 'modifyClip'
  | 'removeClips'
  | 'removeClipsLte'
  | 'restoreFactoryDefault'
  | 'dumpCollection'
  | 'countAllDocuments'
  | 'findUser'
  | 'upsertUser'
  | 'findRooms'
  | 'findRoomFromUserOrCreate'
  | 'loadMessages'
  | 'findMessage'
  | 'upsertMessage'
  | 'setMessageToRead';

export type ReturnFindClips = ReturnType<typeof findClips>;
export type ReturnAddClip = ReturnType<typeof addClip>;
export type ReturnModifyClip = ReturnType<typeof modifyClip>;
export type ReturnRemoveClips = ReturnType<typeof removeClips>;
export type ReturnRemoveClipsLte = ReturnType<typeof removeClipsLte>;
export type ReturnRestoreFactoryDefault = ReturnType<
  typeof restoreFactoryDefault
>;
export type ReturnDumpCollection = ReturnType<typeof dumpCollection>;
export type ReturnCountAllDocuments = ReturnType<typeof countAllDocuments>;
export type ReturnFindUser = ReturnType<typeof findUser>;
export type ReturnUpsertUser = ReturnType<typeof upsertUser>;
export type ReturnFindRooms = ReturnType<typeof findRooms>;
export type ReturnFindRoomFromUserOrCreate = ReturnType<
  typeof findRoomFromUserOrCreate
>;
export type ReturnLoadMessages = ReturnType<typeof loadMessages>;
export type ReturnFindMessage = ReturnType<typeof findMessage>;
export type ReturnUpsertMessage = ReturnType<typeof upsertMessage>;
export type ReturnSetMessageToRead = ReturnType<typeof setMessageToRead>;

//

export type ParamsFindClips = Parameters<typeof findClips>;
export type ParamsAddClip = Parameters<typeof addClip>;
export type ParamsModifyClip = Parameters<typeof modifyClip>;
export type ParamsRemoveClips = Parameters<typeof removeClips>;
export type ParamsRemoveClipsLte = Parameters<typeof removeClipsLte>;
export type ParamsRestoreFactoryDefault = Parameters<
  typeof restoreFactoryDefault
>;
export type ParamsDumpCollection = Parameters<typeof dumpCollection>;
export type ParamsCountAllDocuments = Parameters<typeof countAllDocuments>;
export type ParamsFindUser = Parameters<typeof findUser>;
export type ParamsUpsertUser = Parameters<typeof upsertUser>;
export type ParamsFindRooms = Parameters<typeof findRooms>;
export type ParamsFindRoomFromUserOrCreate = Parameters<
  typeof findRoomFromUserOrCreate
>;
export type ParamsLoadMessages = Parameters<typeof loadMessages>;
export type ParamsFindMessage = Parameters<typeof findMessage>;
export type ParamsUpsertMessage = Parameters<typeof upsertMessage>;
export type ParamsSetMessageToRead = Parameters<typeof setMessageToRead>;

export type MethodsReturnType =
  | ReturnFindClips
  | ReturnAddClip
  | ReturnModifyClip
  | ReturnRemoveClips
  | ReturnRemoveClipsLte
  | ReturnRestoreFactoryDefault
  | ReturnDumpCollection
  | ReturnCountAllDocuments
  | ReturnFindUser
  | ReturnUpsertUser
  | ReturnFindRooms
  | ReturnFindRoomFromUserOrCreate
  | ReturnLoadMessages
  | ReturnFindMessage
  | ReturnUpsertMessage
  | ReturnSetMessageToRead;

export type MethodsParams =
  | ParamsFindClips
  | ParamsAddClip
  | ParamsModifyClip
  | ParamsRemoveClips
  | ParamsRemoveClipsLte
  | ParamsRestoreFactoryDefault
  | ParamsDumpCollection
  | ParamsCountAllDocuments
  | ParamsFindUser
  | ParamsUpsertUser
  | ParamsFindRooms
  | ParamsFindRoomFromUserOrCreate
  | ParamsLoadMessages
  | ParamsFindMessage
  | ParamsUpsertMessage
  | ParamsSetMessageToRead;

/**
 * Clips
 */

export const findClips = runCatching(
  (searchConditions: Partial<ClipSearchConditions>) =>
    clipsCollection().then((methods) => methods.findClips(searchConditions))
);

export const addClip = runCatching((clip: Omit<Clip, 'id'>) =>
  clipsCollection().then((methods) =>
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
      .then(async ([targetClip]) => ({
        action: !targetClip ? 'addClip' : 'modifyClip',
        clip: !targetClip
          ? await methods.insertClip(clip)
          : await methods.modifyClip(targetClip),
      }))
  )
);

export const modifyClip = runCatching((clip: Clip) =>
  clipsCollection().then((methods) => methods.modifyClip(clip))
);

export const removeClips = runCatching((clipIds: string[]) =>
  clipsCollection().then(async (methods) => methods.removeClips(clipIds))
);

export const removeClipsLte = runCatching((updatedAt: number) =>
  clipsCollection()
    .then(async (methods) =>
      methods
        .findClipsLte(updatedAt)
        .then((clips) => removeClips(clips.map((clip) => clip.id)))
    )
    .then((response) =>
      handler.isSuccess(response)
        ? response.data
        : Promise.reject(response.message)
    )
);

export const restoreFactoryDefault = runCatching(async () => {
  const obs = removeClipsRxDB(adapter).pipe(
    concatMap((result) =>
      result.ok
        ? (async () => {
            clipsRxDB = createClipsRxDB__(adapter);
          })()
        : Promise.reject('Unable to remove DB')
    )
  );
  return lastValueFrom(obs);
});

export const dumpCollection = runCatching(() =>
  clipsCollection().then((methods) => methods.dumpCollection())
);

export const countAllDocuments = runCatching(() =>
  clipsCollection().then((methods) => methods.countAllDocuments())
);

/**
 * User
 */

export const findUser = runCatching((deviceId: string) =>
  userCollection().then((methods) => methods.findUser(deviceId))
);

export const upsertUser = runCatching(
  (user: Partial<Omit<UserDoc, 'device'>> & { device: IDevice }) =>
    userCollection().then(async (methods) => {
      const userCurrent = await methods.findUser(user.device.mac);
      const { username, ...device } = user.device;
      return methods.upsertUser({
        color: randomColor(),
        permission: 'once',
        username,
        ...(userCurrent || {}),
        ...(user || {}),
        device, // Last as single source of truth
      });
    })
);

/**
 * Room
 */
export const findRooms = runCatching(() =>
  roomCollection().then(async (methods) => methods.findRooms())
);

export const findRoomFromUserOrCreate = runCatching(
  (user: Pick<UserDoc, 'id' | 'username'>) =>
    roomCollection().then(async (methods) => {
      const [room] = await methods.findRoomsByUserIds([user.id]);
      return (
        room ??
        methods.addRoom({
          roomName: user.username,
          userIds: [user.id],
        })
      );
    })
);

/**
 * Message
 */
export const loadMessages = runCatching(
  (args: { roomId: string; options?: { limit: number; skip: number } }) =>
    messageCollection().then(async (methods) =>
      methods.findMessages(args.roomId, args.options)
    )
);

export const findMessage = runCatching((roomId: string, messageId: string) =>
  messageCollection().then(async (methods) =>
    methods.findMessage(roomId, messageId)
  )
);

export const upsertMessage = runCatching(
  (
    message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'> & {
      id?: string;
      updatedAt?: number;
      createdAt?: number;
    }
  ) =>
    messageCollection().then(async (methods) => methods.upsertMessage(message))
);

export const setMessageToRead = runCatching(
  (roomId: string, senderId: string) =>
    messageCollection().then(async (methods) => {
      const messages = await methods.findMessagesByStatus(
        roomId,
        senderId,
        'sent'
      );
      const upsert = async (
        [head, ...tail]: MessageDoc[],
        acc: MessageDoc[]
      ): Promise<MessageDoc[]> =>
        head
          ? upsert(tail, [
              ...acc,
              await methods.upsertMessage({
                ...head,
                status: 'read',
              }),
            ])
          : acc;
      return upsert(messages, []);
    })
);
