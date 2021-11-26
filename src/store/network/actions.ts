import { ActionTree } from 'vuex';
import { RootState, NetworkState } from '@/store/types';
import { EMPTY, from, lastValueFrom, of, range } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  mapTo,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  discoverDevices,
  sendMessage,
} from '@/electron/services/socket.io/client';
 import * as Sentry from '@/sentry';
import { MessageDoc, stringifyContent } from '@/rxdb/message/model';
import { UserDoc } from '@/rxdb/user/model';
import { IDevice } from '@/electron/services/socket.io/types';
import { toDictionary } from '@/utils/common';
import { getMyDevice, handleIoServer, sendFile } from '@/utils/invocation';
import { isSuccess } from '@/utils/handler';
import { methods } from '../clips/actions';

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
  handleServer: async ({ commit, dispatch }, action: 'start' | 'close') => {
    const obs = from(handleIoServer(action)).pipe(
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
    );
    return lastValueFrom(obs);
  },
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
    methods('findUser', userId).then((res) =>
      isSuccess(res) ? res.data : undefined
    ),
  upsertUser: async (
    { commit },
    user: Partial<Omit<UserDoc, 'device'>> & { device: IDevice }
  ) =>
    lastValueFrom(
      from(methods('upsertUser', user))
        .pipe(map((res) => (isSuccess(res) ? res.data : undefined)))
        .pipe(
          tap((user) => {
            if (user) commit('addOrUpdateUser', user);
          })
        )
    ),
  findRoomFromUserOrCreate: async (
    { state, commit },
    user: Pick<UserDoc, 'id' | 'username'>
  ) =>
    lastValueFrom(
      from(methods('findRoomFromUserOrCreate', user)).pipe(
        map((res) =>
          // Once committed using 'mergeRooms', the room should contain the messages
          isSuccess(res)
            ? (() => {
                commit('mergeRooms', [res.data]);
                return state.rooms.find((room_) => room_.id === res.data.id);
              })()
            : undefined
        )
      )
    ),
  loadRooms: async ({ state, commit }) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setLoadingRooms', true)))
        .pipe(concatMap(() => methods('findRooms')))
        .pipe(map((res) => (isSuccess(res) ? res.data : [])))
        .pipe(tap((rooms) => commit('mergeRooms', rooms)))
        .pipe(map(() => state.rooms)) // At this point should contain message property
        .pipe(tap(() => commit('setLoadingRooms', false)))
    ),
  loadMessages: async (
    { state, commit },
    data: { roomId: string; options?: { limit: number; skip: number } }
  ) =>
    lastValueFrom(
      range(1, 1)
        .pipe(tap(() => commit('setLoadingMessages', true)))
        .pipe(concatMap(() => methods('loadMessages', data)))
        .pipe(map((res) => (isSuccess(res) ? res.data : [])))
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
    ),
  findMessage: async (_, { roomId, messageId }) =>
    lastValueFrom(
      range(1, 1)
        .pipe(concatMap(() => methods('findMessage', roomId, messageId)))
        .pipe(map((res) => (isSuccess(res) ? res.data : undefined)))
    ),
  addOrUpdateMessage: async (
    { commit },
    args: {
      message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'> & {
        id?: string;
      };
      skipUpsert?: boolean;
    }
  ) =>
    lastValueFrom(
      from(
        args.skipUpsert
          ? Promise.resolve({ status: 'success', data: args.message })
          : methods('upsertMessage', args.message)
      ).pipe(
        tap((res) => {
          if (res.status === 'success') commit('addOrUpdateMessage', res.data);
        })
      )
    ),
  setMessagesToRead: async (
    { commit },
    { roomId, senderId }: { roomId: string; senderId: string }
  ) =>
    lastValueFrom(
      from(methods('setMessageToRead', roomId, senderId)).pipe(
        tap((res) => {
          if (isSuccess(res))
            res.data.forEach((message) =>
              commit('addOrUpdateMessage', message)
            );
        })
      )
    ),
  sendMessage: async (
    { commit },
    args: {
      message: Pick<MessageDoc, 'roomId' | 'content'> & {
        id?: string;
      };
      sender?: IDevice;
      receiver: IDevice;
    }
  ) => {
    const message = {
      ...args.message,
      type: 'text' as const,
      senderId: args.sender?.mac || 'unknown',
      status: 'pending' as const,
    };
    const obs = from(methods('upsertMessage', message))
      .pipe(
        map((res) => {
          if (isSuccess(res)) {
            return res.data;
          } else {
            throw new Error('Something wen wrong');
          }
        })
      )
      .pipe(tap((message) => commit('addOrUpdateMessage', message)))
      .pipe(
        concatMap((message) =>
          args.sender
            ? sendMessage(args.sender, args.receiver, message)
            : Promise.reject(new Error('Sender absent'))
        )
      )
      .pipe(map((message) => ({ ...message, status: 'sent' as const })))
      .pipe(
        catchError((error) => {
          Sentry.captureException(error);
          return of({
            ...message,
            status: 'rejected' as const,
          });
        })
      )
      .pipe(concatMap((message) => methods('upsertMessage', message)))
      .pipe(
        tap((res) =>
          isSuccess(res) ? commit('addOrUpdateMessage', res.data) : undefined
        )
      );
    return lastValueFrom(obs);
  },
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
  ) => {
    const obs = from(
      methods('upsertMessage', {
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
        ext: ((arg: RegExpExecArray | null) => (arg ? arg[0] : undefined))(
          /(?:\.([^.]+))?$/.exec(args.message.path)
        ),
        status: 'pending',
      })
    ).pipe(
      concatMap((res) => {
        return args.sender && isSuccess(res)
          ? (() => {
              commit('addOrUpdateMessage', res.data);
              return sendFile(args.sender, args.receiver, res.data);
            })()
          : Promise.reject(
              !args.sender
                ? 'Sender absent'
                : 'Something went wrong during sendFile'
            );
      })
    );
    return lastValueFrom(obs);
  },
};

export default actions;
