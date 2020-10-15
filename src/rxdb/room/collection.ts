import { uuid } from 'uuidv4';
import {
  RoomCollection,
  RoomCollectionMethods,
  RoomDoc,
  RoomDocMethods,
  schema,
} from './model';

const roomDocMethods: RoomDocMethods = {};

const roomCollectionsMethods: RoomCollectionMethods = {
  async addRoom(this: RoomCollection, room): Promise<RoomDoc> {
    return this.atomicUpsert({
      id: uuid(),
      ...room,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }).then((room) => room.toJSON());
  },
  async retrieveRooms(this: RoomCollection): Promise<RoomDoc[]> {
    return this.find()
      .exec()
      .then((rooms) => rooms.map((room) => room.toJSON()));
  },
  async removeRooms(
    this: RoomCollection,
    roomIds: string[]
  ): Promise<RoomDoc[]> {
    return this.find()
      .where('id')
      .in(roomIds)
      .remove()
      .then((removedRooms) => removedRooms.map((room) => room.toJSON()));
  },
};

export const collection = {
  name: 'room',
  schema,
  methods: roomDocMethods,
  statics: roomCollectionsMethods,
};
