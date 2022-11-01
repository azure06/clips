import {
  UserCollection,
  UserCollectionMethods,
  UserDoc,
  UserDocMethods,
  schema,
} from './model';

const userDocMethods: UserDocMethods = {};

const userCollectionsMethods: UserCollectionMethods = {
  async upsertUser(this: UserCollection, user): Promise<UserDoc> {
    return this.atomicUpsert({
      ...user,
      id: user.device.mac, // Mac address is always
      updatedAt: Date.now(),
      createdAt: user.createdAt || Date.now(),
    }).then((user) => user.toJSON());
  },
  async findUser(deviceId) {
    return this.find()
      .where('device.mac')
      .eq(deviceId)
      .exec()
      .then(([user]) => user?.toJSON());
  },
  async findUsers(this: UserCollection): Promise<UserDoc[]> {
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

export const user = {
  name: 'user',
  schema,
  methods: userDocMethods,
  statics: userCollectionsMethods,
  migrationStrategies: {
    // 1 means, this transforms data from version 0 to version 1
    1(oldDoc: unknown) {
      return oldDoc;
    },
  },
};
