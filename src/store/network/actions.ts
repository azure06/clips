import { ActionTree } from 'vuex';
import { RootState, NetworkState } from '@/store/types';
import { EMPTY, from, of, range } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  mapTo,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import {
  discoverDevices,
  sendMessage,
} from '@/electron/services/socket.io/client';
import * as Sentry from '@sentry/electron';
import { getCollection } from '@/rxdb';
import { MessageDoc, stringifyContent } from '@/rxdb/message/model';
import { UserDoc } from '@/rxdb/user/model';
import { IDevice } from '@/electron/services/socket.io/types';
import { toDictionary } from '@/utils/common';
import { getMyDevice, handleIoServer, sendFile } from '@/utils/invocation';
import { isSuccess } from '@/electron/utils/invocation-handler';

export type UserUpsert = Partial<Omit<UserDoc, 'device'>> & { device: IDevice };

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomColor(): string {
  switch (randomInt(0, 5)) {
    case 0:
      return 'amber lighten-1' as const;
    case 1:
      return 'pink accent-4' as const;
    case 2:
      return 'blue accent-3' as const;
    default:
      return 'teal darken-1' as const;
  }
}

const actions: ActionTree<NetworkState, RootState> = {
  handleServer: async ({ commit, dispatch }, action: 'start' | 'close') =>
    from(handleIoServer(action))
      .pipe(
        tap(async (response) => {
          commit('setServerStatus', action === 'start' ? 'started' : 'closed');
          // Set this user
          if (isSuccess(response)) {
            const thisUser = await dispatch('upsertUser', {
              device: response.data,
            });
            commit('setThisUser', thisUser);
          }
        }),
        mapTo(true),
        catchError((error) => {
          Sentry.captureException(error);
          return of(false);
        })
      )
      .toPromise(),
  discoverUsers: async ({ commit, dispatch }) =>
    new Promise((resolve) =>
      range(1, 1)
        .pipe(
          tap(() => commit('setLoadingDevices', true)),
          concatMap(() => from(getMyDevice())),
          switchMap((response) =>
            isSuccess(response)
              ? discoverDevices(response.data.ip).pipe(
                  concatMap((device) =>
                    dispatch('upsertUser', {
                      device,
                    })
                  ),
                  catchError((error) => {
                    Sentry.captureException(error);
                    return of<undefined>();
                  })
                )
              : EMPTY
          )
        )
        .subscribe({
          complete: () => {
            commit('setLoadingDevices', false);
            resolve(null);
          },
        })
    ),
  findUser: async (_, userId: string) =>
    getCollection('user')
      .pipe(
        concatMap((collection) =>
          from(collection.findUser(userId)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of(undefined);
            })
          )
        )
      )
      .pipe(take(1))
      .toPromise(),
  upsertUser: async (
    { commit },
    user: Partial<Omit<UserDoc, 'device'>> & { device: IDevice }
  ) =>
    getCollection('user')
      .pipe(
        concatMap((collection) =>
          from(
            (async () => {
              const userCurrent = await collection.findUser(user.device.mac);
              const { username, ...device } = user.device;
              const userNew = await collection.upsertUser({
                color: randomColor(),
                permission: 'once',
                username,
                ...(userCurrent || {}),
                ...(user || {}),
                device, // Last as single source of truth
              });
              commit('addOrUpdateUser', userNew);
              return userNew;
            })()
          ).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of(undefined);
            })
          )
        )
      )
      .pipe(take(1))
      .toPromise(),
  findRoomFromUserOrCreate: async (
    { state, commit },
    user: Pick<UserDoc, 'id' | 'username'>
  ) =>
    getCollection('room')
      .pipe(
        concatMap((collection) =>
          from(
            (async () => {
              const [room] = await collection.findRoomsByUserIds([user.id]);
              return (
                room ||
                collection.addRoom({
                  roomName: user.username,
                  userIds: [user.id],
                })
              );
            })()
          ).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of(undefined);
            })
          )
        )
      )
      .pipe(
        tap((room) => {
          // Instead of merge just add(?)
          if (room) commit('mergeRooms', [room]);
        })
      )
      .pipe(
        map((room) =>
          // Once committed using 'mergeRooms', the room should contain the messages
          room ? state.rooms.find((room_) => room_.id === room.id) : undefined
        )
      )
      .pipe(take(1))
      .toPromise(),
  loadRooms: async ({ state, commit }) =>
    getCollection('room')
      .pipe(tap(() => commit('setLoadingRooms', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.findRooms()).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((rooms) => commit('mergeRooms', rooms)))
      .pipe(map(() => state.rooms)) // At this point should contain message property
      .pipe(tap(() => commit('setLoadingRooms', false)))
      .pipe(take(1))
      .toPromise(),
  loadMessages: async (
    { state, commit },
    data: { roomId: string; options?: { limit: number; skip: number } }
  ) =>
    getCollection('message')
      .pipe(tap(() => commit('setLoadingMessages', true)))
      .pipe(
        concatMap((collection) =>
          from(collection.findMessages(data.roomId, data.options)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(
        tap((messages) =>
          commit(
            !data.options || data.options.skip === 0
              ? 'setMessages'
              : 'addMessages',
            { roomId: data.roomId, messages }
          )
        )
      )
      .pipe(map(() => toDictionary(state.rooms)[data.roomId].messages))
      .pipe(tap(() => commit('setLoadingMessages', false)))
      .pipe(take(1))
      .toPromise(),
  findMessage: async (_, { roomId, messageId }) =>
    getCollection('message')
      .pipe(
        concatMap((collection) =>
          from(
            collection.findMessage(roomId, messageId).catch((error) => {
              Sentry.captureException(error);
              return undefined;
            })
          )
        )
      )
      .pipe(take(1))
      .toPromise(),
  addOrUpdateMessage: async (
    { commit },
    args: {
      message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'> & {
        id?: string;
      };
      skipUpsert?: boolean;
    }
  ) =>
    getCollection('message')
      .pipe(
        concatMap((methods) =>
          args.skipUpsert
            ? Promise.resolve(args.message)
            : from(methods.upsertMessage(args.message)).pipe(
                catchError((error) => {
                  Sentry.captureException(error);
                  return of(undefined);
                })
              )
        )
      )
      .pipe(
        tap((message) => {
          if (message) commit('addOrUpdateMessage', message);
        })
      )
      .pipe(take(1))
      .toPromise(),
  setMessagesToRead: async (
    { commit },
    { roomId, senderId }: { roomId: string; senderId: string }
  ) =>
    getCollection('message')
      .pipe(
        concatMap((collection) =>
          from(
            (async () => {
              const messages = await collection.findMessagesByStatus(
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
                      await collection.upsertMessage({
                        ...head,
                        status: 'read',
                      }),
                    ])
                  : acc;
              return upsert(messages, []);
            })()
          ).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([] as MessageDoc[]);
            })
          )
        )
      )
      .pipe(
        tap((messages) =>
          messages.forEach((message) => commit('addOrUpdateMessage', message))
        )
      )
      .pipe(take(1))
      .toPromise(),
  sendMessage: async (
    { commit },
    args: {
      message: Pick<MessageDoc, 'roomId' | 'content'> & {
        id?: string;
      };
      sender?: IDevice;
      receiver: IDevice;
    }
  ) =>
    getCollection('message')
      .pipe(
        concatMap((collection) =>
          from(
            collection
              .upsertMessage({
                ...args.message,
                type: 'text',
                senderId: args.sender?.mac || 'unknown',
                status: 'pending',
              })
              .then(async (message) => {
                commit('addOrUpdateMessage', message);
                const sentResult = args.sender
                  ? sendMessage(args.sender, args.receiver, message)
                  : Promise.reject(new Error('Sender absent'));
                return sentResult
                  .then(() => ({ ...message, status: 'sent' as const }))
                  .catch((error) => {
                    Sentry.captureException(error);
                    return {
                      ...message,
                      status: 'rejected' as const,
                    };
                  });
              })
              .then((message) =>
                collection.upsertMessage(message).catch((error) => {
                  Sentry.captureException(error);
                  return message;
                })
              )
          )
        )
      )
      .pipe(tap((message) => commit('addOrUpdateMessage', message)))
      .pipe(take(1))
      .toPromise(),
  sendFile: async (
    { commit },
    args: {
      message: {
        roomId: string;
        id?: string;
        path: string;
      };
      sender?: IDevice;
      receiver: IDevice;
    }
  ) =>
    getCollection('message')
      .pipe(
        concatMap((collection) =>
          from(
            collection
              .upsertMessage({
                roomId: args.message.roomId,
                senderId: args.sender?.mac || 'unknown',
                type: 'file',
                content: stringifyContent({
                  path: args.message.path,
                  progress: {
                    eta: 0,
                    length: 0,
                    percentage: 0,
                    remaining: 0,
                    runtime: 0,
                    speed: 0,
                    transferred: 0,
                  },
                }),
                ext: ((arg: RegExpExecArray | null) =>
                  arg ? arg[0] : undefined)(
                  /(?:\.([^.]+))?$/.exec(args.message.path)
                ),
                status: 'pending',
              })
              .then(async (message) => {
                commit('addOrUpdateMessage', message);
                return args.sender
                  ? sendFile(args.sender, args.receiver, message)
                  : Promise.reject(new Error('Sender absent'));
              })
          )
        )
      )
      .pipe(take(1))
      .toPromise(),
};

export default actions;
