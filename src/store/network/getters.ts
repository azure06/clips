import { GetterTree } from 'vuex';
import { RootState, NetworkState } from '@/store/types';
import { toDictionary } from '@/utils';

const getters: GetterTree<NetworkState, RootState> = {
  serverStatus: (state: NetworkState) => state.status,
  loadingDevices: ({ loading: [devices] }: NetworkState) => devices,
  loadingRooms: ({ loading: [, rooms] }: NetworkState) => rooms,
  loadingMessages: ({ loading: [, , messages] }: NetworkState) => messages,
  thisUser: (state: NetworkState) => state.thisUser,
  users: (state: NetworkState) => state.users,
  userDictionary: (state: NetworkState) => toDictionary(state.users),
  roomDictionary: (state: NetworkState) => toDictionary(state.rooms),
  rooms: (state: NetworkState) => state.rooms,
  unreadMessagesByUser: (state: NetworkState) => {
    const unread = state.rooms.map((room) => ({
      id: room.userIds[0],
      size: room.messages.filter(
        (message) =>
          message.senderId === room.userIds[0] && message.status === 'sent'
      ).length,
    }));
    return toDictionary(unread);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unreadMessagesTotal: (state: NetworkState, getters: any) =>
    Object.values(getters.unreadMessagesByUser).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc, value) => (value as any).size + acc,
      0
    ),
};

export default getters;
