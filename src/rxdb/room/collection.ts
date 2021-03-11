import {
  RoomCollectionMethods,
  RoomDoc,
  RoomDocMethods,
  schema,
} from './model';
import { uuid } from 'uuidv4';

const roomDocMethods: RoomDocMethods = {};

const roomCollectionsMethods: RoomCollectionMethods = {
  async addRoom(room) {
    return this.atomicUpsert({
      ...room,
      id: uuid(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }).then((room) => room.toJSON());
  },
  async findRooms() {
    return this.find()
      .exec()
      .then((rooms) => rooms.map((room) => room.toJSON()));
  },
  async findRoomsByUserIds(userIds: string[]): Promise<RoomDoc[]> {
    return this.find({ selector: { userIds: { $all: userIds } } })
      .exec()
      .then((rooms) => rooms.map((room) => room.toJSON()));
  },
  async removeRooms(roomIds) {
    return this.find()
      .where('id')
      .in(roomIds)
      .remove()
      .then((removedRooms) => removedRooms.map((room) => room.toJSON()));
  },
};

export const room = {
  name: 'room',
  schema,
  methods: roomDocMethods,
  statics: roomCollectionsMethods,
};
