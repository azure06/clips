import uuidv4 from 'uuid/v4';
import { RxDBService } from '../rxdb/rxdb.service';
import clipsHelpers, {
  ClipDocType,
  ClipsCollectionType
} from './clipboard.models';

export class ClipsRxDbService extends RxDBService<
  ClipsCollectionType,
  ClipDocType
> {
  constructor() {
    super(clipsHelpers.schema);
  }

  public async findClips({
    limit,
    skip,
    field,
    clip,
    sort
  }: {
    limit?: number;
    skip?: number;
    field?: 'id' | 'plainText' | 'type' | 'category';
    clip?: Partial<ClipDocType>;
    sort?:
      | 'plainText'
      | 'type'
      | 'category'
      | 'updatedAt'
      | 'createdAt'
      | '-plainText'
      | '-type'
      | '-category'
      | '-updatedAt'
      | '-createdAt';
  }) {
    let q = (await this.collection).find();
    q = field && clip && clip[field] ? q.where(field).equals(clip[field]) : q;
    q = sort ? q.sort(sort) : q;
    q = skip ? q.skip(skip) : q;
    q = limit ? q.limit(limit) : q;

    return (await q.exec()).map(_clip => clipsHelpers.normalize(_clip));
  }

  public async findWithRegex(
    query: { [P in keyof Partial<ClipDocType>]: { $regex: RegExp } }
  ) {
    return (await (await this.collection).find(query).exec()).map(clip =>
      clipsHelpers.normalize(clip)
    );
  }

  // @ts-ignore
  public async insertClip(clip: Omit<ClipDocType, 'id'> & { id?: string }) {
    return this.upsertClip({ ...clip, id: uuidv4() });
  }
  public async upsertClip(clip: ClipDocType) {
    return (await this.collection).upsert(clipsHelpers.normalize(clip));
  }
  public async removeClip({ id }: { id: string }) {
    const query = (await this.collection)
      .find()
      .where('id')
      .equals(id);
    return (await query.remove()).map(clip => clipsHelpers.normalize(clip));
  }

  public async removeAllClips() {
    return (await (await this.collection).find().remove()).map(clip =>
      clipsHelpers.normalize(clip)
    );
  }
}
