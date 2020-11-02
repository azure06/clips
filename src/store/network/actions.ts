import { ActionTree } from 'vuex';
import { RootState, NetworkState } from '@/store/types';
import { EMPTY, from, of, range } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { ipcRenderer } from 'electron';
import {
  discoverDevices,
  findDevice,
  sendMessage,
} from '@/electron/services/socket.io/client';
import * as Sentry from '@sentry/electron';
import { getCollection } from '@/rxdb';
import { MessageDoc } from '@/rxdb/message/model';
import { UserDoc } from '@/rxdb/user/model';
import { IDevice } from '@/electron/services/socket.io/types';
import { toDictionary } from '@/utils/object';
import { readSync } from 'fs';

export type UserUpsert = Partial<Omit<UserDoc, 'device'>> & { device: IDevice };

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomColor() {
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
  initServer: async ({ state, commit, dispatch }) =>
    range(1, 1)
      .pipe(
        concatMap(() =>
          from(
            (async () => {
              const ip = (await ipcRenderer.invoke('my-ip')) as string;
              const device = await findDevice(ip);
              const ready = device
                ? !!device
                : await ipcRenderer.invoke('init-server');
              return ready;
            })()
          ).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of(false);
            })
          )
        )
      )
      .pipe(take(1))
      .toPromise(),
  closeServer: async ({ state, commit, dispatch }) =>
    range(1, 1)
      .pipe(
        concatMap(() =>
          from(ipcRenderer.invoke('close-server')).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of(false);
            })
          )
        )
      )
      .pipe(take(1))
      .toPromise(),
  discoverUsers: async ({ state, commit, dispatch }) =>
    new Promise((resolve) =>
      range(1, 1)
        .pipe(
          tap(() => commit('setLoading', { user: true })),
          concatMap(() =>
            from(ipcRenderer.invoke('my-ip') as Promise<string>).pipe(
              catchError((error) => {
                Sentry.captureException(error);
                return of<undefined>();
              })
            )
          ),
          switchMap((ip) =>
            ip
              ? discoverDevices(ip).pipe(
                  concatMap((device) =>
                    from(
                      dispatch('upsertUser', {
                        device,
                      } as UserUpsert) as Promise<UserDoc>
                    ).pipe(
                      catchError((error) => {
                        Sentry.captureException(error);
                        return of(undefined);
                      }),
                      tap((user) => {
                        if (user && ip === device.ip) {
                          commit('setThisUser', user);
                        }
                      })
                    )
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
            commit('setLoading', { user: false });
            resolve();
          },
        })
    ),
  findUser: async ({ state, commit }, userId: string) =>
    getCollection('user')
      .pipe(tap((_) => commit('setLoading', { user: true })))
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
      .pipe(tap((_) => commit('setLoading', { user: false })))
      .pipe(take(1))
      .toPromise(),
  upsertUser: async (
    { state, commit },
    user: Partial<Omit<UserDoc, 'device'>> & { device: IDevice }
  ) =>
    getCollection('user')
      .pipe(tap((_) => commit('setLoading', { user: true })))
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
      .pipe(tap((_) => commit('setLoading', { user: false })))
      .pipe(take(1))
      .toPromise(),
  findRoomFromUserOrCreate: async (
    { state, commit },
    user: Pick<UserDoc, 'id' | 'username'>
  ) =>
    getCollection('room')
      .pipe(tap((_) => commit('setLoading', { room: true })))
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
      .pipe(tap((_) => commit('setLoading', { room: false })))
      .pipe(take(1))
      .toPromise(),
  loadRooms: async ({ state, commit }) =>
    getCollection('room')
      .pipe(tap((_) => commit('setLoading', { room: true })))
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
      .pipe(map((_) => state.rooms)) // At this point should contain message property
      .pipe(tap((_) => commit('setLoading', { room: false })))
      .pipe(take(1))
      .toPromise(),
  loadMessages: async (
    { state, commit },
    data: { roomId: string; options?: { limit: number; skip: number } }
  ) =>
    getCollection('message')
      .pipe(tap((_) => commit('setLoading', { message: true })))
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
      .pipe(map((_) => toDictionary(state.rooms)[data.roomId].messages))
      .pipe(tap((_) => commit('setLoading', { message: false })))
      .pipe(take(1))
      .toPromise(),
  addOrUpdateMessage: async (
    { state, commit },
    message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'> & {
      id?: string;
    }
  ) =>
    getCollection('message')
      .pipe(tap((_) => commit('setLoading', { message: true })))
      .pipe(
        concatMap((methods) =>
          from(methods.upsertMessage(message)).pipe(
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
      .pipe(tap((_) => commit('setLoading', { message: false })))
      .pipe(take(1))
      .toPromise(),
  setMessagesToRead: async (
    { state, commit },
    { roomId, senderId }: { roomId: string; senderId: string }
  ) =>
    getCollection('message')
      .pipe(tap((_) => commit('setLoading', { message: true })))
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
              return of([]);
            })
          )
        )
      )
      .pipe(tap((_) => commit('setMessagesAsRead', roomId)))
      .pipe(tap((_) => commit('setLoading', { message: false })))
      .pipe(take(1))
      .toPromise(),
  sendMessage: async (
    { state, commit },
    data: {
      sender?: IDevice;
      receiver: IDevice;
      message: Omit<
        MessageDoc,
        'id' | 'updatedAt' | 'createdAt' | 'senderId' | 'status'
      > & { senderId?: string };
    }
  ) =>
    getCollection('message')
      .pipe(tap((_) => commit('setLoading', { sending: true })))
      .pipe(
        concatMap((collection) =>
          from(
            collection
              .upsertMessage({
                ...data.message,
                senderId: data.sender?.mac || 'unknown',
                status: 'pending',
              })
              .then(async (message) => {
                commit('modifyOrAddMessage', message);
                const sentResult = data.sender
                  ? sendMessage(data.sender, data.receiver, message)
                  : Promise.reject(new Error('Sender absent'));
                return sentResult
                  .then((_) => ({ ...message, status: 'sent' as const }))
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
      .pipe(tap((message) => commit('modifyOrAddMessage', message)))
      .pipe(tap((_) => commit('setLoading', { sending: false })))
      .pipe(take(1))
      .toPromise(),
};

export default actions;
