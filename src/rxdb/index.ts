import { ClipsCollection, ClipsDatabaseCollection } from './clips/model';
import { clips } from './clips/collection';
import { room } from './room/collection';
import { message } from './message/collection';
import { user } from './user/collection';
import { RoomCollection, RoomDatabaseCollection } from './room/model';
import { MessageCollection, MessageDatabaseCollection } from './message/model';
import { UserCollection, UserDatabaseCollection } from './user/model';
import {
  RxDatabase,
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
} from 'rxdb';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { Observable, from } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { app } from 'electron';

type RxCollections = ClipsDatabaseCollection &
  RoomDatabaseCollection &
  MessageDatabaseCollection &
  UserDatabaseCollection;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RxDBAdapter = ReturnType<typeof initPlugins> extends Promise<
  infer U
>
  ? U
  : never;
export type RxDBAdapterNm = 'idb' | 'leveldb';

const nodeDBPath = async () => {
  const { fs, path } = await import('@/electron/utils/node');
  const dir = path.join(app.getPath('userData'), 'leveldown');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return `${dir}/leveldown`;
};

// const removeDir = async (db: 'leveldown' | 'IndexedDB') => {
//   const { fs, path } = await import('@/helpers/node');
//   const dir = path.join(app.getPath('userData'), db);
//   if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });
// };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function initPlugins(adapter: RxDBAdapterNm) {
  addRxPlugin(
    adapter === 'idb'
      ? await (async () =>
          (
            await import('@/renderer/utils/renderer')
          ).adapter)()
      : await (async () => (await import('@/electron/utils/node')).adapter)()
  );
  addRxPlugin(RxDBValidatePlugin);
  addRxPlugin(RxDBQueryBuilderPlugin);
  addRxPlugin(RxDBMigrationPlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBJsonDumpPlugin);
  return adapter === 'idb'
    ? 'idb'
    : (await import('@/electron/utils/node')).leveldown;
}

async function createRxDB(adapter: RxDBAdapter) {
  /**
   * create database and collections
   */
  const clipsRxDB: RxDatabase<RxCollections> =
    await createRxDatabase<RxCollections>({
      name: adapter === 'idb' ? 'clips' : await nodeDBPath(), // <- name
      adapter, // <- storage-adapter
      ignoreDuplicate: true,
      multiInstance: false, // <- multiInstance (optional, default: true)
    });

  await clipsRxDB.addCollections({
    clips,
    room,
    message,
    user,
  });

  return clipsRxDB;
}

export const createClipsRxDB = (
  adapter: Observable<RxDBAdapter>
): Observable<RxDatabase<RxCollections>> =>
  from(adapter).pipe(concatMap((adapt) => createRxDB(adapt)));

export const removeClipsRxDB = (
  adapter: Observable<RxDBAdapter>
): Observable<{ ok: boolean }> =>
  adapter.pipe(
    concatMap(async (adapt) =>
      removeRxDatabase(adapt === 'idb' ? 'clips' : await nodeDBPath(), adapt)
    )
  );

export function getCollection<T extends 'clips' | 'room' | 'message' | 'user'>(
  clipsRxDB: Observable<RxDatabase<RxCollections>>,
  collection: T
): T extends 'clips'
  ? Observable<RxDatabase<ClipsCollection>>
  : T extends 'user'
  ? Observable<RxDatabase<UserCollection>>
  : T extends 'room'
  ? Observable<RxDatabase<RoomCollection>>
  : Observable<RxDatabase<MessageCollection>>;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCollection<T extends 'clips' | 'room' | 'message' | 'user'>(
  clipsRxDB: Observable<RxDatabase<RxCollections>>,
  collection: T
) {
  switch (collection) {
    case 'clips':
      return clipsRxDB.pipe(map((rxDB) => rxDB.clips));
    case 'user':
      return clipsRxDB.pipe(map((rxDB) => rxDB.user));
    case 'room':
      return clipsRxDB.pipe(map((rxDB) => rxDB.room));
    case 'message':
      return clipsRxDB.pipe(map((rxDB) => rxDB.message));
  }
}
