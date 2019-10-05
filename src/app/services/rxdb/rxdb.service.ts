import RxDB, { RxCollection, RxDatabase, RxDocument, RxJsonSchema } from 'rxdb';

export class RxDBService<CollectionType, DocType> {
  private dbName = 'infiniti';
  private storageAdapter = 'idb'; // indexedDb
  private _collection: Promise<CollectionType>;

  /**
   *  Initialize Infiniti Database
   */
  constructor(schema: RxJsonSchema<DocType>) {
    RxDB.plugin(require('pouchdb-adapter-idb'));
    // @ts-ignore
    this._collection = RxDB.create({
      name: this.dbName, // <- name
      adapter: this.storageAdapter, // <- storage-adapter
      multiInstance: true, // <- multiInstance (optional, default: true)
      queryChangeDetection: true // <- queryChangeDetection (optional, default: false)
    }).then(db =>
      db.collection({
        name: this.dbName,
        schema
      })
    );
  }

  protected get collection() {
    return this._collection;
  }
}
