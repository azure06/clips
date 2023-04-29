// eslint-disable-next-line object-curly-newline
import findLocalDevices from 'local-devices';
import { RxCollection, RxDocument, RxJsonSchema } from 'rxdb';

export interface UserDatabaseCollection {
  user: UserCollection;
}

export interface UserDoc {
  id: string;
  username: string;
  color: string;
  device: findLocalDevices.IDevice & { port: number };
  permission: 'always' | 'once';
  updatedAt: number;
  createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type UserDocMethods = {};

export type UserCollectionMethods = {
  upsertUser(
    this: UserCollection,
    user: Omit<UserDoc, 'id' | 'updatedAt' | 'createdAt'> & {
      id?: string;
      updatedAt?: number;
      createdAt?: number;
    }
  ): Promise<UserDoc>;
  findUser(
    this: UserCollection,
    deviceId: string
  ): Promise<UserDoc | undefined>;
  findUsers(this: UserCollection): Promise<UserDoc[]>;
  removeUsers(this: UserCollection, userIds: string[]): Promise<UserDoc[]>;
};

export type UserCollection = RxCollection<
  UserDoc,
  UserDocMethods,
  UserCollectionMethods
>;

export type UserDocument = RxDocument<UserDoc, UserDocMethods>;

export const schema: RxJsonSchema<UserDoc> = {
  title: 'user',
  description: 'User collection',
  version: 0,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
      final: true,
    },
    username: {
      type: 'string',
    },
    permission: {
      type: 'string',
      default: 'once',
    },
    color: {
      type: 'string',
    },
    device: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        ip: {
          type: 'string',
        },
        mac: {
          type: 'string',
        },
        port: {
          type: 'number',
        },
      },
    },
    updatedAt: {
      type: 'number',
    },
    createdAt: {
      type: 'number',
    },
  },
  indexes: ['id', 'device.mac', 'username', 'updatedAt', 'createdAt'],
  required: ['id', 'device', 'color', 'username', 'updatedAt', 'createdAt'],
};
