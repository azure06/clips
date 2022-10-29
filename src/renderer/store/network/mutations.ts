import { MutationTree } from 'vuex';
import { NetworkState } from '@/renderer/store/types';
import Vue from 'vue';
import { RoomDoc } from '@/rxdb/room/model';
import { MessageDoc } from '@/rxdb/message/model';
import { toDictionary } from '@/utils/common';
import { UserDoc } from '@/rxdb/user/model';

const mutations: MutationTree<NetworkState> = {
  setServerStatus(state, status: 'started' | 'closed') {
    Vue.set(state, 'status', status);
  },
  setLoadingDevices(state, devices: boolean) {
    const [, rooms, messages] = state.loading;
    Vue.set(state, 'loading', [devices, rooms, messages]);
  },
  setLoadingRooms(state, rooms: boolean) {
    const [devices, , messages] = state.loading;
    Vue.set(state, 'loading', [devices, rooms, messages]);
  },
  setLoadingMessages(state, messages: boolean) {
    const [devices, rooms] = state.loading;
    Vue.set(state, 'loading', [devices, rooms, messages]);
  },
  addOrUpdateUser(state, user: UserDoc) {
    const users = state.users.filter((user_) => user_.id !== user.id);
    Vue.set(state, 'users', [user, ...users]);
  },
  setThisUser(state, user: UserDoc) {
    Vue.set(state, 'thisUser', user);
  },
  mergeRooms(state, rooms: RoomDoc[]) {
    const roomDict = toDictionary(state.rooms);
    const mergedDict = { ...roomDict, ...toDictionary(rooms) };
    const rooms_ = Object.values(mergedDict).map((room) => ({
      ...mergedDict[room.id],
      messages: roomDict[room.id]?.messages || [],
    }));
    Vue.set(state, 'rooms', rooms_);
  },
  setMessages(state, data: { roomId: string; messages: MessageDoc[] }) {
    const roomDictionary = toDictionary(state.rooms);
    const room = roomDictionary[data.roomId];
    const roomCopy = {
      ...room,
      messages: data.messages.reverse(),
    };
    const rooms = Object.values({ ...roomDictionary, [roomCopy.id]: roomCopy });
    Vue.set(state, 'rooms', rooms);
  },
  addMessages(state, data: { roomId: string; messages: MessageDoc[] }) {
    const roomDictionary = toDictionary(state.rooms);
    const room = roomDictionary[data.roomId];
    const roomCopy = {
      ...room,
      messages: [...data.messages.reverse(), ...room.messages],
    };
    const rooms = Object.values({ ...roomDictionary, [roomCopy.id]: roomCopy });
    Vue.set(state, 'rooms', rooms);
  },
  addOrUpdateMessage(state, message: MessageDoc) {
    const roomDictionary = toDictionary(state.rooms);
    const messages = roomDictionary[message.roomId]?.messages || [];
    const index = messages.findIndex((message_) => message_.id === message.id);
    const roomCopy = {
      ...roomDictionary[message.roomId],
      messages:
        index === -1
          ? [...messages, message]
          : (() => {
              messages[index] = message;
              return messages;
            })(),
    };
    const rooms = Object.values({ ...roomDictionary, [roomCopy.id]: roomCopy });
    Vue.set(state, 'rooms', rooms);
  },
};

export default mutations;
