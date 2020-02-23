// eslint-disable-next-line object-curly-newline
import { RxCollection, RxDatabase, RxDocument, RxJsonSchema } from 'rxdb';

export type ClipsDatabase = RxDatabase<ClipsDatabaseCollection>;

export interface ClipsDatabaseCollection {
  clips: ClipsCollection;
}

export interface ClipDoc {
  id: string;
  plainText: string;
  htmlText: string;
  richText: string;
  dataURI: string;
  category: 'none' | 'starred';
  type: 'text' | 'image';
  formats: string[];
  updatedAt: number;
  createdAt: number;
}

export interface ClipSearchConditions {
  regex: ClipRegExp;
  limit: number;
  skip: number;
  filters: Partial<SearchFilters>;
  sort:
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
}

export interface SearchFilters {
  readonly id: string;
  readonly plainText: string;
  readonly htmlText: string;
  readonly richText: string;
  readonly dataURI: string;
  readonly category: 'none' | 'starred';
  readonly type: 'text' | 'image';
  readonly formats: string[];
  readonly updatedAt: number;
  readonly createdAt: number;
}

export type ClipRegExp =
  | { readonly id: { $regex: RegExp } }
  | { readonly plainText: { $regex: RegExp } }
  | { readonly htmlText: { $regex: RegExp } }
  | { readonly richText: { $regex: RegExp } }
  | { readonly dataURI: { $regex: RegExp } }
  | { readonly category: { $regex: RegExp } }
  | { readonly type: { $regex: RegExp } }
  | { readonly formats: { $regex: RegExp } }
  | { readonly updatedAt: { $regex: RegExp } }
  | { readonly createdAt: { $regex: RegExp } };

export type ClipsDocMethods = {};

export type ClipsCollectionMethods = {
  countAllDocuments(this: ClipsCollection): Promise<number>;
  findClips(
    this: ClipsCollection,
    { limit, skip, regex, filters, sort }: Partial<ClipSearchConditions>
  ): Promise<ClipDoc[]>;
  findClipsLte(this: ClipsCollection, lte: number): Promise<ClipDoc[]>;
  insertClip(this: ClipsCollection, clip: Omit<ClipDoc, 'id'> & { id?: string }): Promise<ClipDoc>;
  modifyClip(this: ClipsCollection, clip: ClipDoc): Promise<ClipDoc>;
  removeClips(this: ClipsCollection, clipsIds: string[]): Promise<ClipDoc[]>;
  removeAllClips(this: ClipsCollection): Promise<ClipDoc[]>;
  restore(this: ClipsCollection): Promise<boolean>;
};

export type ClipsCollection = RxCollection<ClipDoc, ClipsDocMethods, ClipsCollectionMethods>;

export type ClipDocument = RxDocument<ClipDoc, ClipsDocMethods>;

export const schema: RxJsonSchema<ClipDoc> = {
  title: 'clips',
  description: 'Clipboard history collection',
  version: 0,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
      final: true,
    },
    plainText: {
      type: 'string',
      index: true,
    },
    richText: {
      type: 'string',
    },
    htmlText: {
      type: 'string',
    },
    dataURI: {
      type: 'string',
    },
    category: {
      type: 'string',
      index: true,
    },
    type: {
      type: 'string',
      index: true,
    },
    formats: {
      type: 'array',
      maxItems: 5,
      uniqueItems: true,
      items: {
        type: 'string',
      },
    },
    updatedAt: {
      index: true,
      type: 'number',
    },
    createdAt: {
      index: true,
      type: 'number',
    },
  },
  compoundIndexes: [
    ['category', 'updatedAt'],
    ['type', 'updatedAt'], // <- this will create a compound-index for these two fields
  ],
  required: ['id', 'category', 'type', 'formats', 'updatedAt', 'createdAt'],
};
