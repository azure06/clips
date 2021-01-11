// eslint-disable-next-line object-curly-newline
import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';

export interface ClipsDatabaseCollection {
  clips: ClipsCollection;
}

export interface ClipDoc {
  id: string;
  plainText: string;
  htmlText: string;
  richText: string;
  dataURI: string;
  category: string;
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
  readonly category: 'starred' | string;
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

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClipsDocMethods = {};

export type ClipsCollectionMethods = {
  dumpCollection(this: ClipsCollection): Promise<ClipDoc[]>;
  countAllDocuments(this: ClipsCollection): Promise<number>;
  findClips(
    this: ClipsCollection,
    { limit, skip, regex, filters, sort }: Partial<ClipSearchConditions>
  ): Promise<ClipDoc[]>;
  findClipsLte(this: ClipsCollection, lte: number): Promise<ClipDoc[]>;
  insertClip(
    this: ClipsCollection,
    clip: Omit<ClipDoc, 'id'> & { id?: string }
  ): Promise<ClipDoc>;
  modifyClip(this: ClipsCollection, clip: ClipDoc): Promise<ClipDoc>;
  removeClips(this: ClipsCollection, clipsIds: string[]): Promise<ClipDoc[]>;
  removeAllClips(this: ClipsCollection): Promise<ClipDoc[]>;
  restore(this: ClipsCollection): Promise<unknown>;
};

export type ClipsCollection = RxCollection<
  ClipDoc,
  ClipsDocMethods,
  ClipsCollectionMethods
>;

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
    },
    type: {
      type: 'string',
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
      type: 'number',
    },
    createdAt: {
      type: 'number',
    },
  },
  indexes: [
    'plainText',
    'category', // <- this will create a simple index for the `firstName` field
    'type',
    'updatedAt',
    'createdAt',
    ['category', 'updatedAt'],
    ['type', 'updatedAt'], // <- this will create a compound-index for these two fields
  ],
  required: ['id', 'category', 'type', 'formats', 'updatedAt', 'createdAt'],
};
