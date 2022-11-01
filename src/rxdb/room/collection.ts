import { uuid } from 'uuidv4';

import {
  RoomCollectionMethods,
  RoomDoc,
  RoomDocMethods,
  schema,
} from './model';

const roomDocMethods: RoomDocMethods = {};

const roomCollectionsMethods: RoomCollectionMethods = {
  async addRoom(room) {
    return this.atomicUpsert({
      ...room,
      id: uuid(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }).then((room) => room.toMutableJSON());
  },
  async findRooms() {
    return this.find()
      .exec()
      .then((rooms) => rooms.map((room) => room.toMutableJSON()));
  },
  async findRoomsByUserIds(userIds: string[]): Promise<RoomDoc[]> {
    return this.find({ selector: { userIds: { $all: userIds } } })
      .exec()
      .then((rooms) => rooms.map((room) => room.toMutableJSON()));
  },
  async removeRooms(roomIds) {
    return this.find()
      .where('id')
      .in(roomIds)
      .remove()
      .then((removedRooms) => removedRooms.map((room) => room.toMutableJSON()));
  },
};

export const room = {
  name: 'room',
  schema,
  methods: roomDocMethods,
  statics: roomCollectionsMethods,
  migrationStrategies: {
    // 1 means, this transforms data from version 0 to version 1
    1(oldDoc: unknown) {
      return oldDoc;
    },
  },
};
