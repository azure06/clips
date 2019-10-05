import { RxCollection, RxDatabase, RxDocument, RxJsonSchema } from 'rxdb';

export type ClipsDatabase = RxDatabase<ClipsDatabaseCollection>;

export interface ClipsDatabaseCollection {
  clips: ClipDocType;
}

export interface ClipDocType {
  id: string;
  plainText?: string;
  htmlText?: string;
  richText?: string;
  dataURI?: string;
  category: 'none' | 'starred';
  type: 'text' | 'image';
  formats: string[];
  updatedAt: number;
  createdAt: number;
}

export interface ClipDocMethods {}

interface ClipsCollectionMethods {}

export type ClipsCollectionType = RxCollection<
  ClipDocType,
  ClipDocMethods,
  ClipsCollectionMethods
>;

export type ClipDocument = RxDocument<ClipDocType, ClipDocMethods>;

export const schema: RxJsonSchema<ClipDocType> = {
  title: 'infiniti clips',
  description: 'Infiniti clipboard history collection',
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
    richText: {
      type: 'string'
    },
    htmlText: {
      type: 'string'
    },
    dataURI: {
      type: 'string'
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
      type: 'number'
    },
    createdAt: {
      index: true,
      type: 'number'
    }
  },
  compoundIndexes: [
    ['category', 'updatedAt'],
    ['type', 'updatedAt'] // <- this will create a compound-index for these two fields
  ],
  required: ['id', 'category', 'type', 'formats', 'updatedAt', 'createdAt']
};

/**
 * Remove all the unnecessary properties inside the clip object
 *
 * @return a normalized clip
 */
const normalize = ({
  id,
  plainText,
  richText,
  htmlText,
  dataURI,
  category,
  type,
  formats,
  updatedAt,
  createdAt
}: ClipDocType) => {
  return {
    id,
    plainText,
    richText,
    htmlText,
    dataURI,
    category,
    type,
    formats,
    updatedAt,
    createdAt
  };
};

export default {
  normalize,
  schema
};
