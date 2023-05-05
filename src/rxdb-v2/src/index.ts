import {
  RxDatabase,
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
} from 'rxdb';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import { Observable, from } from 'rxjs';

import { concatMap, map } from 'rxjs/operators';
import { clips } from './internal/clips/collection';
import {
  ClipsCollection,
  ClipsDatabaseCollection,
} from './internal/clips/model';
import { message } from './internal/message/collection';
import {
  MessageCollection,
  MessageDatabaseCollection,
} from './internal/message/model';
import { room } from './internal/room/collection';
import { RoomCollection, RoomDatabaseCollection } from './internal/room/model';
import { user } from './internal/user/collection';
import { UserCollection, UserDatabaseCollection } from './internal/user/model';
import { RxDBAdapter } from './utils';

type RxCollections = ClipsDatabaseCollection &
  RoomDatabaseCollection &
  MessageDatabaseCollection &
  UserDatabaseCollection;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initPlugins(rxDbAdapter: RxDBAdapter): RxDBAdapter {
  const [, plugin] = rxDbAdapter;
  addRxPlugin(plugin);
  addRxPlugin(RxDBValidatePlugin);
  addRxPlugin(RxDBQueryBuilderPlugin);
  addRxPlugin(RxDBMigrationPlugin);
  addRxPlugin(RxDBUpdatePlugin);
  addRxPlugin(RxDBJsonDumpPlugin);
  return rxDbAdapter;
}

async function createRxDB([, , adapter, path]: RxDBAdapter) {
  const clipsRxDB: RxDatabase<RxCollections> =
    await createRxDatabase<RxCollections>({
      name: path, // <- name
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
    concatMap(async ([, , adapt, path]) => removeRxDatabase(path, adapt))
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
