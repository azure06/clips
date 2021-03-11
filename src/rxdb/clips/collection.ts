import * as utils from './utils';
import {
  ClipDoc,
  ClipsCollectionMethods,
  ClipsDocMethods,
  ClipSearchConditions,
  schema,
} from './model';
import { uuid } from 'uuidv4';

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
    return result.map((item) => item.toJSON());
  },
  /** Find items older then *Date* and not starred  */
  async findClipsLte(lte) {
    const query = this.find()
      .where('updatedAt')
      .lte(lte)
      .where('category')
      .eq('none');

    const result = await query.exec();
    return result.map((clip) => clip.toJSON());
  },
  async insertClip(clip) {
    return this.atomicUpsert({ ...clip, id: uuid() }).then((clip_) =>
      clip_.toJSON()
    );
  },
  async modifyClip(clip) {
    return this.atomicUpsert({ ...clip, updatedAt: Date.now() }).then((clip) =>
      clip.toJSON()
    );
  },
  async removeClips(ids: string[]) {
    return this.find()
      .where('id')
      .in(ids)
      .remove()
      .then((removedClips) => removedClips.map((clip) => clip.toJSON()));
  },
  async removeAllClips() {
    return this.find()
      .remove()
      .then((removedClips) => removedClips.map((clip) => clip.toJSON()));
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
};
