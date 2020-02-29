import RxDB from 'rxdb';
import uuidv4 from 'uuid/v4';
import {
  ClipDoc,
  ClipsCollection,
  ClipSearchConditions,
  ClipsDatabaseCollection,
  ClipsDatabase,
  ClipsDocMethods,
  ClipsCollectionMethods,
  schema,
} from './clips.models';
import { utils } from './clips.utils';

RxDB.plugin(require('pouchdb-adapter-idb'));

export async function createDB() {
  /**
   * create database and collections
   */
  const clipsDB: ClipsDatabase = await RxDB.create<ClipsDatabaseCollection>({
    name: 'clips', // <- name
    adapter: 'idb', // <- storage-adapter
    multiInstance: true, // <- multiInstance (optional, default: true)
    queryChangeDetection: true, // <- queryChangeDetection (optional, default: false)
  });

  const clipsDocMethods: ClipsDocMethods = {
    scream(this: ClipDoc, what: string) {
      return `${this.category} screams: ${what.toUpperCase()}`;
    },
  };

  const clipsCollectionsMethods: ClipsCollectionMethods = {
    async dumpCollection() {
      return (await this.dump()).docs;
    },
    async countAllDocuments() {
      const allDocs = await this.find().exec();
      return allDocs.length;
    },
    async findClips({ limit, skip, regex, filters, sort }: Partial<ClipSearchConditions>) {
      let query = this.find(regex);
      const { formats, ...rest } = filters || {};
      query = utils.query.applyFilter(query, Object.entries(rest));
      query = sort ? query.sort(sort) : query;
      query = skip ? query.skip(skip) : query;
      query = limit ? query.limit(limit) : query;

      const result = await query.exec();
      return result.map((item) => utils.clip.normalize(item));
    },
    /** Find items older then *Date* and not starred  */
    async findClipsLte(lte) {
      let query = this.find()
        .where('updatedAt')
        .lte(lte)
        .where('category')
        .ne('starred');

      const result = await query.exec();
      return result.map((item) => utils.clip.normalize(item));
    },
    async insertClip(clip) {
      return this.atomicUpsert(utils.clip.normalize({ ...clip, id: uuidv4() })).then(
        utils.clip.normalize
      );
    },
    async modifyClip(clip) {
      return this.atomicUpsert(utils.clip.normalize({ ...clip, updatedAt: Date.now() })).then(
        utils.clip.normalize
      );
    },
    async removeClips(ids: string[]) {
      const query = this.find()
        .where('id')
        .in(ids);
      const removedClips = await query.remove();
      return removedClips.map((clip) => utils.clip.normalize(clip));
    },
    async removeAllClips() {
      return (await this.find().remove()).map((clip) => utils.clip.normalize(clip));
    },
    async restore() {
      await this.remove();
      return clipsDB.destroy();
    },
  };

  await clipsDB.collection({
    name: 'clips',
    schema,
    methods: clipsDocMethods,
    statics: clipsCollectionsMethods,
  });

  return clipsDB;
}
