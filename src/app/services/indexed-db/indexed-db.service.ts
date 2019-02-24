import { Injectable } from '@angular/core';
import { Clip } from '../../models/models';

@Injectable()
export class IndexedDBService {
  private dbName = 'cloud-clips';
  get idb() {
    return window.indexedDB;
  }

  constructor() {
    this.makeRequest({ upgradeHandler: this.onUpgradeNeeded });
  }

  private makeRequest({
    successHandler,
    errorHandler,
    upgradeHandler
  }: {
    successHandler?: (event: IDBDatabase) => Promise<any>;
    errorHandler?: (event: Event) => any;
    upgradeHandler?: (event: IDBVersionChangeEvent) => any;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = this.idb.open(this.dbName, 1);

      request.onsuccess = async () => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onerror = dbError => reject(dbError);

        const result = successHandler
          ? await successHandler(db)
          : Promise.resolve('Success');

        resolve(result);
      };

      request.onerror =
        errorHandler ||
        (event => reject('Why didn t you allow my web app to use IndexedDB?!'));

      request.onupgradeneeded = upgradeHandler;
    });
  }

  public addClip(clip: Clip): Promise<any> {
    const successHandler = (db: IDBDatabase) => {
      return new Promise((resolve, _reject) => {
        const transaction = db.transaction(['clips'], 'readwrite');
        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = () => console.log('transaction complete');
        transaction.onerror = _reject;

        const clipStore = transaction.objectStore('clips');
        const clipStoreRequest = clipStore.add(clip);

        clipStoreRequest.onsuccess = resolve;
      });
    };
    return this.makeRequest({ successHandler });
  }

  public getClips(): Promise<Clip[]> {
    const successHandler = (db: IDBDatabase) => {
      return new Promise((resolve, _reject) => {
        const objectStore = db
          .transaction(['clips'], 'readwrite')
          .objectStore('clips')
          .index('updatedAt');

        const request = objectStore.getAll();

        request.onerror = _reject;
        request.onsuccess = event => {
          console.error((event.target as IDBRequest).result);
          resolve((event.target as IDBRequest).result || []);

          // // Get the old value that we want to update
          // var data = event.target.result;
          // // update the value(s) in the object that you want to change
          // data.age = 42;
          // // Put this updated object back into the database.
          // var requestUpdate = objectStore.put(data);
          // requestUpdate.onerror = function(event) {
          //   // Do something with the error
          // };
          // requestUpdate.onsuccess = function(event) {
          //   // Success - the data is updated!
          // };
        };
      });
    };
    return this.makeRequest({ successHandler });
  }

  private onUpgradeNeeded(event: IDBVersionChangeEvent) {
    const data = [];
    const db = (event.target as IDBOpenDBRequest).result;
    const objectStore = db.createObjectStore('clips', {
      keyPath: 'id'
    });

    objectStore.createIndex('plainText', 'plainText', { unique: true });
    objectStore.createIndex('htmlText', 'htmlText', { unique: false });
    objectStore.createIndex('dataURI', 'dataURI', { unique: false });
    objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    objectStore.createIndex('createdAt', 'createdAt', { unique: false });

    objectStore.transaction.oncomplete = event => {
      // Store values in the newly created objectStore.
      const clipsObjectStore = db
        .transaction('clips', 'readwrite')
        .objectStore('clips');
      data.forEach(clip => {
        clipsObjectStore.add(clip);
      });
    };
  }
}
