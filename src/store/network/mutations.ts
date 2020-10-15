import { MutationTree } from 'vuex';
import { NetworkState, IDevice } from '@/store/types';
import Vue from 'vue';
import { RoomDoc } from '@/rxdb/room/model';
import { MessageDoc } from '@/rxdb/message/model';
import { toDictionary } from '@/utils/object';
import { UserDoc } from '@/rxdb/user/model';

const mutations: MutationTree<NetworkState> = {
  setFetching(state, fetching) {
    Vue.set(state, 'fetching', fetching);
  },
  addUser(state, user: UserDoc) {
    console.warn('User: ', user);
    const users = state.users.filter((user_) => user_.id !== user.id);
    Vue.set(state, 'users', [user, ...users]);
  },
  setThisUser(state, user: UserDoc) {
    Vue.set(state, 'thisUser', user);
  },
  mergeRooms(state, rooms: RoomDoc[]) {
    const stateRoomDict = toDictionary(state.rooms);
    const rooms_ = rooms.map((room) => ({
      ...room,
      messages: stateRoomDict[room.id] || [],
    }));
    Vue.set(state, 'rooms', rooms_);
  },
  addMessages(state, args: { roomId: string; messages: MessageDoc[] }) {
    const roomDictionary = toDictionary(state.rooms);
    const roomCopy = {
      ...roomDictionary[args.roomId],
      messages: [...args.messages, ...roomDictionary[args.roomId].messages],
    };
    const rooms = Object.values({ ...roomDictionary, [roomCopy.id]: roomCopy });
    Vue.set(state, 'rooms', rooms);
  },
};

export default mutations;
