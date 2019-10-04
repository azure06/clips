import { Injectable } from '@angular/core';
import RxDB, { RxCollection, RxDatabase } from 'rxdb';
import { Clip, QuillCard } from '../../models/models';

@Injectable()
export class RxDBService {
  private dbName = 'infiniti';
  private storageAdapter = 'idb'; // indexedDb
  private db: RxDatabase<{
    [key: string]: RxCollection<
      any,
      {},
      {
        [key: string]: any;
      }
    >;
  }>;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await RxDB.create({
      name: this.dbName, // <- name
      adapter: this.storageAdapter, // <- storage-adapter
      multiInstance: true, // <- multiInstance (optional, default: true)
      queryChangeDetection: true // <- queryChangeDetection (optional, default: false)
    });
  }
  private async createSchema() {
    this.db.collection({
      name: 'clips schema',
      schema: {
        version: 0,
        type: 'object',
        properties: {
          id: {
            type: 'string',
            primary: true,
            final: true
          },
          plainText: {
            type: 'string',
            index: true
          },
          category: {
            type: 'string',
            index: true
          },
          type: {
            type: 'string',
            index: true
          },
          formats: {
            type: 'array',
            maxItems: 5,
            uniqueItems: true,
            items: {
              type: 'string'
            }
          },
          updatedAt: {
            index: true,
            type: 'string'
          },
          createdAt: {
            index: true,
            type: 'string'
          }
        },
        compoundIndexes: [
          ['', ''] // <- this will create a compound-index for these two fields
        ],
        required: ['color']
      }
    });
  }
}
