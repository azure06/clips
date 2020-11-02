import { ClipsCollection, ClipsDatabaseCollection } from './clips/model';
import * as clips from './clips/collection';
import * as room from './room/collection';
import * as message from './message/collection';
import * as user from './user/collection';
import { RoomCollection, RoomDatabaseCollection } from './room/model';
import { MessageCollection, MessageDatabaseCollection } from './message/model';
import { UserCollection, UserDatabaseCollection } from './user/model';
import {
  createRxDatabase,
  removeRxDatabase,
  addRxPlugin,
  RxDatabase,
} from 'rxdb';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// eslint-disable-next-line @typescript-eslint/no-var-requires
addRxPlugin(require('pouchdb-adapter-idb')); // addRxPlugin(require('pouchdb-adapter-indexeddb'));
addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBJsonDumpPlugin);

type RxCollections = ClipsDatabaseCollection &
  RoomDatabaseCollection &
  MessageDatabaseCollection &
  UserDatabaseCollection;

async function createRxDB() {
  /**
   * create database and collections
   */
  const clipsRxDB: RxDatabase<RxCollections> = await createRxDatabase<
    RxCollections
  >({
    name: 'clips', // <- name
    adapter: 'idb', // <- storage-adapter
    ignoreDuplicate: true,
    multiInstance: false, // <- multiInstance (optional, default: true)
  });

  await Promise.all([
    clipsRxDB.collection(clips.collection),
    clipsRxDB.collection(room.collection),
    clipsRxDB.collection(message.collection),
    clipsRxDB.collection(user.collection),
  ]);

  return clipsRxDB;
}

// Initialize instance
let clipsRxDB = from(createRxDB());

export const createClipsRxDB = (): Observable<RxDatabase<RxCollections>> =>
  (clipsRxDB = from(createRxDB()));

export const removeClipsRxDB = (): Observable<{ ok: boolean }> =>
  from(removeRxDatabase('clips', 'idb'));

export function getCollection<T extends 'clips' | 'room' | 'message' | 'user'>(
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
