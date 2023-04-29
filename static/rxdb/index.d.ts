import { RxDatabase } from 'rxdb';
import { Observable } from 'rxjs';
import { ClipsCollection, ClipsDatabaseCollection } from './clips/model';
import { MessageCollection, MessageDatabaseCollection } from './message/model';
import { RoomCollection, RoomDatabaseCollection } from './room/model';
import { UserCollection, UserDatabaseCollection } from './user/model';
export * as rxjs from 'rxjs';
export * as operators from 'rxjs/operators';
export * as leveldownUtils from './utils/leveldown';
export * as pouchDbUtils from './utils/pouchdb-adapter';
export * as clipsModel from './clips/model';
export * as messageModel from './message/model';
export * as roomModel from './room/model';
export * as userModel from './user/model';
declare type RxCollections = ClipsDatabaseCollection & RoomDatabaseCollection & MessageDatabaseCollection & UserDatabaseCollection;
export declare type RxDBAdapter = ReturnType<typeof initPlugins> extends Promise<infer U> ? U : never;
export declare type RxDBAdapterNm = 'idb' | ['leveldb', string];
export declare function initPlugins(adapter: RxDBAdapterNm): Promise<readonly ['idb'] | readonly [unknown, string]>;
export declare const createClipsRxDB: (adapter: Observable<RxDBAdapter>) => Observable<RxDatabase<RxCollections>>;
export declare const removeClipsRxDB: (adapter: Observable<RxDBAdapter>) => Observable<{
    ok: boolean;
}>;
export declare function getCollection<T extends 'clips' | 'room' | 'message' | 'user'>(clipsRxDB: Observable<RxDatabase<RxCollections>>, collection: T): T extends 'clips' ? Observable<RxDatabase<ClipsCollection>> : T extends 'user' ? Observable<RxDatabase<UserCollection>> : T extends 'room' ? Observable<RxDatabase<RoomCollection>> : Observable<RxDatabase<MessageCollection>>;
//# sourceMappingURL=index.d.ts.map