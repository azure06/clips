import { uuid } from 'uuidv4';
import {
  UserCollection,
  UserCollectionMethods,
  UserDoc,
  UserDocMethods,
  schema,
} from './model';

const userDocMethods: UserDocMethods = {};

const userCollectionsMethods: UserCollectionMethods = {
  async addUser(this: UserCollection, user): Promise<UserDoc> {
    return this.atomicUpsert({
      id: uuid(),
      ...user,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }).then((user) => user.toJSON());
  },
  async updateUser(this: UserCollection, user): Promise<UserDoc> {
    return this.atomicUpsert({
      ...user,
      updatedAt: Date.now(),
    }).then((user) => user.toJSON());
  },
  async findUser(deviceId) {
    return this.find()
      .where('device.mac')
      .eq(deviceId)
      .exec()
      .then(([user]) => user?.toJSON());
  },
  async retrieveUsers(this: UserCollection): Promise<UserDoc[]> {
    return this.find()
      .exec()
      .then((users) => users.map((user) => user.toJSON()));
  },
  async removeUsers(
    this: UserCollection,
    userIds: string[]
  ): Promise<UserDoc[]> {
    return this.find()
      .where('id')
      .in(userIds)
      .remove()
      .then((removedUsers) => removedUsers.map((user) => user.toJSON()));
  },
};

export const collection = {
  name: 'user',
  schema,
  methods: userDocMethods,
  statics: userCollectionsMethods,
};
