// eslint-disable-next-line object-curly-newline
import { RxCollection, RxDatabase, RxDocument, RxJsonSchema } from 'rxdb';

export interface MessageDatabaseCollection {
  message: MessageCollection;
}

export interface MessageDoc {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: 'text' | 'file';
  ext?: string;
  updatedAt: number;
  createdAt: number;
}

export type MessageDocMethods = {};

export type MessageCollectionMethods = {
  addMessage(this: MessageCollection, message: MessageDoc): Promise<MessageDoc>;
  retrieveMessages(
    this: MessageCollection,
    roomId: string
  ): Promise<MessageDoc[]>;
  removeMessages(
    this: MessageCollection,
    messageIds: string[]
  ): Promise<MessageDoc[]>;
};

export type MessageCollection = RxCollection<
  MessageDoc,
  MessageDocMethods,
  MessageCollectionMethods
>;

export type MessageDocument = RxDocument<MessageDoc, MessageDocMethods>;

export const schema: RxJsonSchema<MessageDoc> = {
  title: 'message',
  description: 'Message collection',
  version: 0,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
      final: true,
    },
    roomId: {
      type: 'string',
      uniqueItems: true,
    },
    userId: {
      type: 'string',
      uniqueItems: true,
    },
    content: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    ext: {
      type: 'string',
    },
    updatedAt: {
      type: 'number',
    },
    createdAt: {
      type: 'number',
    },
  },
  indexes: ['id', 'roomId', 'userId', 'content', 'updatedAt', 'createdAt'],
  required: ['id', 'roomId', 'userId', 'content', 'updatedAt', 'createdAt'],
};
