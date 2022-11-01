// eslint-disable-next-line object-curly-newline
import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';

export interface RoomDatabaseCollection {
  room: RoomCollection;
}

export interface RoomDoc {
  id: string;
  roomName: string;
  userIds: string[]; // This is going to be the mac-address
  updatedAt: number;
  createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type RoomDocMethods = {};

export type RoomCollectionMethods = {
  addRoom(
    this: RoomCollection,
    room: Omit<RoomDoc, 'id' | 'updatedAt' | 'createdAt'>
  ): Promise<RoomDoc>;
  findRooms(this: RoomCollection): Promise<RoomDoc[]>;
  findRoomsByUserIds(
    this: RoomCollection,
    userIds: string[]
  ): Promise<RoomDoc[]>;
  removeRooms(this: RoomCollection, roomIds: string[]): Promise<RoomDoc[]>;
};

export type RoomCollection = RxCollection<
  RoomDoc,
  RoomDocMethods,
  RoomCollectionMethods
>;

export type RoomDocument = RxDocument<RoomDoc, RoomDocMethods>;

export const schema: RxJsonSchema<RoomDoc> = {
  title: 'room',
  description: 'Room collection',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      final: true,
    },
    userIds: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
      },
    },
    roomName: {
      type: 'string',
    },
    updatedAt: {
      type: 'number',
    },
    createdAt: {
      type: 'number',
    },
  },
  indexes: ['id', 'userIds.[]', 'roomName', 'updatedAt', 'createdAt'],
  required: ['id', 'userIds', 'roomName', 'updatedAt', 'createdAt'],
};
