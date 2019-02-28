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

  public getClips(options?: {
    lowerBound?: number;
    upperBound?: number;
    direction?: IDBCursorDirection;
  }): Promise<Clip[]> {
    const successHandler = (db: IDBDatabase) => {
      const { lowerBound, upperBound, direction } = options;
      return new Promise((resolve, _reject) => {
        const objectStore = db
          .transaction(['clips'], 'readwrite')
          .objectStore('clips')
          .index('updatedAt');

        const clips: Clip[] = [];
        const request = objectStore.openCursor(null, direction || 'prev');

        request.onerror = _reject;
        request.onsuccess = ((index = 0) => event => {
          const cursor = (event.target as IDBRequest)
            .result as IDBCursorWithValue;

          if (cursor) {
            if (
              (lowerBound === undefined || index >= lowerBound) &&
              (upperBound === undefined || index < upperBound)
            ) {
              clips.push(cursor.value);
            }
            index++;
            cursor.continue();
          } else {
            resolve(clips);
          }
        })();
      });
    };
    return this.makeRequest({ successHandler });
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

  public modifyClip(clip: Clip): Promise<Clip[]> {
    const successHandler = (db: IDBDatabase) => {
      return new Promise((resolve, _reject) => {
        const objectStore = db
          .transaction(['clips'], 'readwrite')
          .objectStore('clips');

        const updateRequest = objectStore.put(clip);
        updateRequest.onerror = _reject;
        updateRequest.onsuccess = event =>
          console.log('update transaction complete');
      });
    };
    return this.makeRequest({ successHandler });
  }

  public removeClip(clip: Clip): Promise<Clip[]> {
    const successHandler = (db: IDBDatabase) => {
      return new Promise((resolve, _reject) => {
        const objectStore = db
          .transaction(['clips'], 'readwrite')
          .objectStore('clips');

        const removeRequest = objectStore.delete(clip.id);
        removeRequest.onerror = _reject;
        removeRequest.onsuccess = event =>
          console.log('delete transaction complete');
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
    objectStore.createIndex('starred', 'starred', { unique: false });
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
