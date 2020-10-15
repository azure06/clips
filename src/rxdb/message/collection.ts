import { uuid } from 'uuidv4';
import {
  MessageDoc,
  MessageCollectionMethods,
  MessageDocMethods,
  schema,
  MessageCollection,
} from './model';

const messageDocMethods: MessageDocMethods = {
  scream(this: MessageDoc, what: string) {
    return `${this.content} screams: ${what.toUpperCase()}`;
  },
};

const messageCollectionsMethods: MessageCollectionMethods = {
  addMessage(message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'>) {
    return this.atomicUpsert({
      ...message,
      id: uuid(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }).then((clip_) => clip_.toJSON());
  },
  retrieveMessages(
    this: MessageCollection,
    roomId: string
  ): Promise<MessageDoc[]> {
    return this.find()
      .where('roomId')
      .eq(roomId)
      .exec()
      .then((messages) => messages.map((message) => message.toJSON()));
  },
  removeMessages(
    this: MessageCollection,
    messageIds: string[]
  ): Promise<MessageDoc[]> {
    return this.find()
      .where('id')
      .in(messageIds)
      .remove()
      .then((removedMessages) =>
        removedMessages.map((message) => message.toJSON())
      );
  },
};

export const collection = {
  name: 'message',
  schema,
  methods: messageDocMethods,
  statics: messageCollectionsMethods,
};
