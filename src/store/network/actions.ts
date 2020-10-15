import { ActionTree } from 'vuex';
import { RootState, NetworkState } from '@/store/types';
import { from, iif, of } from 'rxjs';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
import { ipcRenderer } from 'electron';
import { discoverDevices } from '@/electron/services/socket.io/utils/network';
import ioClient from 'socket.io-client';
import * as Sentry from '@sentry/electron';
import { getCollection } from '@/rxdb';
import { RoomDoc } from '@/rxdb/room/model';
import { user } from '../user';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomColor() {
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
  findUsers: async ({ state, commit }) =>
    new Promise((resolve) =>
      from(Promise.resolve())
        .pipe(tap(() => commit('setFetching', true)))
        .pipe(
          concatMap(() =>
            from(ipcRenderer.invoke('my-ip') as Promise<string>).pipe(
              catchError((error) => {
                Sentry.captureException(error);
                return of<undefined>();
              })
            )
          )
        )
        .pipe(
          concatMap((ip) =>
            iif(
              () => ip !== undefined,
              discoverDevices(ip!)
                .pipe(
                  map((device) => ({
                    ip: ip!,
                    device,
                  }))
                )
                .pipe(
                  catchError((error) => {
                    Sentry.captureException(error);
                    return of<undefined>();
                  })
                ),
              of()
            )
          )
        )
        .pipe(
          concatMap((args) =>
            from(
              (async () => {
                if (args) {
                  const collection = await getCollection('user')
                    .pipe(take(1))
                    .toPromise();
                  const user = await collection.findUser(args.device.mac);
                  const newUser = !user
                    ? await collection.addUser({
                        username: args.device.username,
                        device: args.device,
                        color: randomColor(),
                      })
                    : await collection.updateUser({
                        ...user,
                        device: args.device,
                      });
                  commit(
                    args.ip === args.device.ip ? 'setThisUser' : 'addUser',
                    newUser
                  );
                  return newUser;
                }
              })()
            ).pipe(
              catchError((error) => {
                Sentry.captureException(error);
                return of(undefined);
              })
            )
          )
        )
        .subscribe({
          complete: () => {
            commit('setFetching', false);
            resolve();
          },
        })
    ),
  addRoom: async ({ state, commit }, room: RoomDoc) =>
    getCollection('room')
      .pipe(
        concatMap((methods) =>
          from(methods.addRoom(room)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of(room);
            })
          )
        )
      )
      .pipe(tap((room) => commit('mergeRooms', [room])))
      .pipe(take(1))
      .toPromise(),
  retrieveRooms: async ({ state, commit }) =>
    getCollection('room')
      // .pipe(tap((_) => commit('setLoadingStatus', true)))
      .pipe(
        concatMap((methods) =>
          from(methods.retrieveRooms()).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((rooms) => commit('mergeRooms', rooms)))
      // .pipe(tap((clips) => commit('loadClips', { clips })))
      // .pipe(tap((_) => commit('setLoadingStatus', false)))
      .pipe(take(1))
      .toPromise(),
  retrieveMessages: async ({ state, commit }, roomId: string) =>
    getCollection('message')
      .pipe(
        concatMap((methods) =>
          from(methods.retrieveMessages(roomId)).pipe(
            catchError((error) => {
              Sentry.captureException(error);
              return of([]);
            })
          )
        )
      )
      .pipe(tap((messages) => commit('addMessages', { roomId, messages })))
      .pipe(take(1))
      .toPromise(),
};

export default actions;
