import { uuid } from 'uuidv4';

import {
  ClipDoc,
  ClipSearchConditions,
  ClipsCollectionMethods,
  ClipsDocMethods,
  schema,
} from './model';
import * as utils from './utils';

const clipsDocMethods: ClipsDocMethods = {
  scream(this: ClipDoc, what: string) {
    return `${this.category} screams: ${what.toUpperCase()}`;
  },
};

const clipsCollectionsMethods: ClipsCollectionMethods = {
  async dumpCollection() {
    return (await this.find().exec()).map((v) => v.toMutableJSON());
  },
  async countAllDocuments() {
    const allDocs = await this.find().exec();
    return allDocs.length;
  },
  async findClips({
    limit,
    skip,
    regex,
    filters,
    sort,
  }: Partial<ClipSearchConditions>) {
    let query = this.find({ selector: { ...regex } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { formats, ...rest } = filters || {};
    query = utils.query.applyFilter(query, Object.entries(rest));
    query = sort ? query.sort(sort) : query;
    query = skip ? query.skip(skip) : query;
    query = limit ? query.limit(limit) : query;

    const result = await query.exec();
    return result.map((item) => item.toMutableJSON());
  },
  /** Find items older then *Date* and not starred  */
  async findClipsLte(lte) {
    const query = this.find()
      .where('updatedAt')
      .lte(lte)
      .where('category')
      .eq('none');

    const result = await query.exec();
    return result.map((clip) => clip.toMutableJSON());
  },
  async insertClip(clip) {
    return this.atomicUpsert({ ...clip, id: uuid() }).then((clip_) =>
      clip_.toMutableJSON()
    );
  },
  async modifyClip(clip) {
    return this.atomicUpsert({ ...clip, updatedAt: Date.now() }).then((clip) =>
      clip.toMutableJSON()
    );
  },
  async removeClips(ids: string[]) {
    return this.find()
      .where('id')
      .in(ids)
      .remove()
      .then((removedClips) => removedClips.map((clip) => clip.toMutableJSON()));
  },
  async removeAllClips() {
    return this.find()
      .remove()
      .then((removedClips) => removedClips.map((clip) => clip.toMutableJSON()));
  },
  async restore() {
    return this.remove();
  },
};

export const clips = {
  name: 'clips',
  schema,
  methods: clipsDocMethods,
  statics: clipsCollectionsMethods,
  migrationStrategies: {
    // 1 means, this transforms data from version 0 to version 1
    1(oldDoc: unknown) {
      return oldDoc;
    },
  },
};
