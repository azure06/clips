import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';

export interface MessageDatabaseCollection {
  message: MessageCollection;
}

type PendingStatus = 'pending';
type ReadStatus = 'sent' | 'read';
type RejectedStatus = 'rejected';
export type MessageStatus = PendingStatus | ReadStatus | RejectedStatus;

export interface MessageDoc {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file';
  status: MessageStatus;
  ext?: string;
  updatedAt: number;
  createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type MessageDocMethods = {};

export type MessageCollectionMethods = {
  upsertMessage(
    this: MessageCollection,
    message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'>
  ): Promise<MessageDoc>;
  findMessages(
    this: MessageCollection,
    roomId: string,
    options?: { limit: number; skip: number }
  ): Promise<MessageDoc[]>;
  findMessagesByStatus(
    this: MessageCollection,
    roomId: string,
    senderId: string,
    status: MessageStatus
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
    senderId: {
      type: 'string',
    },
    status: {
      type: 'string',
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
  indexes: [
    'id',
    'roomId',
    'senderId',
    'status',
    'content',
    'updatedAt',
    'createdAt',
  ],
  required: [
    'id',
    'roomId',
    'senderId',
    'status',
    'content',
    'updatedAt',
    'createdAt',
  ],
};
