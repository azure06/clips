import { MutationTree } from 'vuex';
import { NetworkState } from '@/store/types';
import Vue from 'vue';
import { RoomDoc } from '@/rxdb/room/model';
import { MessageDoc } from '@/rxdb/message/model';
import { toDictionary } from '@/utils/object';
import { UserDoc } from '@/rxdb/user/model';

type Loading = Partial<{
  user: boolean;
  room: boolean;
  message: boolean;
}>;

const mutations: MutationTree<NetworkState> = {
  setServerStatus(state, status: 'started' | 'closed') {
    Vue.set(state, 'status', status);
  },
  setLoading(state, loading: Loading) {
    Vue.set(state, 'loading', { ...state.loading, ...loading });
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
