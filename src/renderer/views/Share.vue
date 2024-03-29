<template>
  <div>
    <div v-if="roomStream">
      <router-view
        :room="roomStream"
        :draft="draftStream"
        :loadingMessages="loadingMessages"
        :unreadCount="unreadMessagesByUser[roomStream.userIds[0]].size"
        @close="$router.back()"
        @keydown="(room, event) => onKeyDown(room, draftStream, event)"
        @change-message="
          (room, draft) => onDraftChange.next({ roomId: room.id, draft })
        "
        @resend-message="onResendMessage"
        @send-message="onSendMessage"
        @send-file="onSendFile"
        @load-messages="(roomId, options) => loadMessages({ roomId, options })"
        @message-read="setMessagesToRead"
      />
    </div>
    <div v-else>
      <!-- Container -->
      <v-container :class="`container fill-height ma-0 pa-0 align-start`" fluid>
        <v-list subheader color="surfaceVariant" width="100%">
          <v-subheader>Users</v-subheader>
          <v-list-item
            v-for="user in users"
            :key="user.id"
            @click="openRoom(user)"
          >
            <v-list-item-avatar>
              <v-icon :class="user.color" dark v-text="'mdi-account'"></v-icon>
            </v-list-item-avatar>
            <v-badge
              v-if="
                unreadMessagesByUser[user.id] &&
                unreadMessagesByUser[user.id].size > 0
              "
              :content="unreadMessagesByUser[user.id].size || 0"
              overlap
              offset-x="25"
              offset-y="-5"
            >
            </v-badge>
            <v-list-item-content>
              <v-list-item-title v-text="user.username"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click.stop="onUserSelect.next(user.id)">
                <v-icon color="grey lighten-1">mdi-information</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-container>

      <!-- Dialogue -->
      <v-dialog
        v-if="userStream"
        :value="!!userStream"
        @input="onUserSelect.next()"
        hide-overlay
        width="360"
      >
        <v-list three-line subheader color="surface" width="100%">
          <v-subheader class="overline">User Info</v-subheader>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon v-text="'mdi-account'"></v-icon>
            </v-list-item-avatar>
            <v-list-item-content class="px-2">
              <v-list-item-title
                class="pb-1 subtitle-2"
                v-text="userStream.username"
              ></v-list-item-title>
              <v-list-item-subtitle
                class="caption"
                v-text="`IP address: ${userStream.device.ip}`"
              >
              </v-list-item-subtitle>
              <v-list-item-subtitle
                class="caption"
                v-text="`Port: ${userStream.device.port}`"
              >
              </v-list-item-subtitle>
              <v-list-item-subtitle
                class="caption"
                v-text="`MAC address: ${userStream.device.mac}`"
              >
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-dialog>

      <!-- Dialog -->
      <v-dialog
        :value="loadingRooms || loadingMessages"
        persistent
        width="360"
        dark
      >
        <v-card color="blue darken-2">
          <v-card-text>
            Loading...
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Toolbar -->
      <v-toolbar bottom color="surfaceVariant" dense>
        <v-toolbar-items> </v-toolbar-items>

        <!-- Scanning... -->
        <v-card
          class="ma-0 ml-4 pa-0 flash"
          color="surfaceVariant"
          tile
          flat
          :height="49"
        >
          <v-card-text
            v-if="loadingDevices"
            class="ma-0 pa-2"
            @click="() => {}"
          >
            <div class="overline text-center" style="user-select: none">
              SCANNING...
            </div>
          </v-card-text>
        </v-card>

        <v-spacer></v-spacer>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              class="overline"
              depressed
              :loading="loadingDevices"
              :disabled="loadingDevices || serverStatus === 'closed'"
              @click="discoverUsers"
              color="surfaceVariant"
            >
              <v-icon left> mdi-account-search </v-icon>
              {{ $translations.find }}
              <template v-slot:loader>
                <span class="custom-loader">
                  <v-icon>mdi-cached</v-icon>
                </span>
              </template>
            </v-btn>
          </template>
          <span>{{ $translations.discoverNewDevice }}</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              class="ml-1"
              depressed
              color="surfaceVariant"
              @click="
                handleServer(serverStatus === 'started' ? 'close' : 'start')
              "
            >
              <v-icon left>
                {{
                  serverStatus === 'started'
                    ? 'mdi-server-network-off'
                    : 'mdi-server-network'
                }}
              </v-icon>
              {{ serverStatus === 'started' ? 'off' : 'on' }}
            </v-btn>
          </template>
          <span>{{ $translations.turnOnOffTheServer }}</span>
        </v-tooltip>

        <!-- Help Dialog-->
        <v-dialog v-model="showDialog" max-width="420">
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="ml-2 pa-1"
              v-bind="attrs"
              v-on="on"
              size="18px"
              @click="showDialog = !showDialog"
            >
              mdi-help-circle
            </v-icon>
          </template>
          <v-card>
            <v-card-title class="subtitle-1 overline">
              <v-icon class="mx-2">mdi-share-variant</v-icon>
              {{ $translations.shareLocally }}
              (βeta)
            </v-card-title>

            <v-card-text>
              {{ $translations.shareExplanation }}
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </div>
  </div>
</template>

<script lang="ts">
import { Subject, combineLatest, from } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  map,
  scan,
  share,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';
import { Component } from 'vue-property-decorator';
import { Dictionary } from 'vue-router/types/router';
import { Action, Getter } from 'vuex-class';

import { IDevice } from '@/electron/services/socket.io/types';
import Room from '@/renderer/components/Room.vue';
import { Room as RoomType } from '@/renderer/store/types';
import { ExtendedVue } from '@/renderer/utils/basevue';
import { MessageDoc } from '@/rxdb/message/model';
import { UserDoc } from '@/rxdb/user/model';

@Component<Share>({
  components: { Room },
  subscriptions() {
    const roomIdStream = this.$watchAsObservable(() => this.$route.params, {
      immediate: true,
    }).pipe(
      map(({ newValue }) => newValue.roomId),
      distinctUntilChanged(),
      concatMap((roomId) =>
        roomId
          ? from(
              (async () => {
                // Load messages from start before the user enter in the room
                await this.loadMessages({
                  roomId,
                  options: { skip: 0, limit: 15 },
                });
                // Initialize draft
                this.onDraftChange.next({ roomId, draft: '' });
                return roomId;
              })()
            )
          : Promise.resolve('')
      ),
      share()
    );
    return {
      roomIdStream,
      userStream: this.onUserSelect.asObservable().pipe(
        map((userId) => (userId ? this.userDictionary[userId] : undefined)),
        share()
      ),
      roomStream: combineLatest([
        roomIdStream,
        this.$watchAsObservable(() => this.roomDictionary, {
          immediate: true,
        }),
      ]).pipe(
        map(([roomId, { newValue }]) => newValue[roomId as string]),
        share()
      ),
      // This reppresent the draft from the current open room
      draftStream: this.onDraftChange.asObservable().pipe(
        scan(
          (acc: Dictionary<string | undefined>, value) => ({
            ...acc,
            [value.roomId]: value.draft,
          }),
          {}
        ),
        withLatestFrom(roomIdStream),
        map(([draft, roomId]) => (roomId ? draft[roomId] : '')),
        startWith(''),
        share()
      ),
    } as const;
  },
})
export default class Share extends ExtendedVue {
  @Getter('serverStatus', { namespace: 'network' })
  public serverStatus!: 'started' | 'closed';
  @Getter('loadingDevices', { namespace: 'network' })
  public loadingDevices!: boolean;
  @Getter('loadingRooms', { namespace: 'network' })
  public loadingRooms!: boolean;
  @Getter('loadingMessages', { namespace: 'network' })
  public loadingMessages!: boolean;

  @Getter('unreadMessagesByUser', { namespace: 'network' })
  public unreadMessagesByUser!: number;
  @Getter('unreadMessagesTotal', { namespace: 'network' })
  public unreadMessagesTotal!: number;

  @Getter('thisUser', { namespace: 'network' })
  public thisUser?: UserDoc;

  @Getter('users', { namespace: 'network' })
  public users!: UserDoc[];
  @Getter('userDictionary', { namespace: 'network' })
  public userDictionary!: Dictionary<UserDoc>;

  @Getter('rooms', { namespace: 'network' })
  public rooms!: RoomType[];
  @Getter('roomDictionary', { namespace: 'network' })
  public roomDictionary!: Dictionary<RoomType>;

  @Action('discoverUsers', { namespace: 'network' })
  public discoverUsers!: () => Promise<void>;
  @Action('findUser', { namespace: 'network' })
  public findUser!: (userId: string) => Promise<UserDoc | undefined>;

  @Action('loadRooms', { namespace: 'network' })
  public loadRooms!: () => Promise<RoomType[]>;
  @Action('loadMessages', { namespace: 'network' })
  public loadMessages!: (data: {
    roomId: string;
    options?: { limit: number; skip: number };
  }) => Promise<MessageDoc[]>;

  @Action('findRoomFromUserOrCreate', { namespace: 'network' })
  public findRoomFromUserOrCreate!: (user: UserDoc) => Promise<RoomType>;
  @Action('setMessagesToRead', { namespace: 'network' })
  public setMessagesToRead!: (
    roomId: string,
    senderId: string
  ) => Promise<MessageDoc[]>;
  @Action('sendMessage', { namespace: 'network' })
  public sendMessage!: (args: {
    message: Pick<MessageDoc, 'roomId' | 'content'> & {
      id?: string;
    };
    sender?: IDevice;
    receiver: IDevice;
  }) => Promise<MessageDoc>;
  @Action('sendFile', { namespace: 'network' })
  public sendFile!: (args: {
    message: {
      roomId: string;
      path: string;
      id?: string;
    };
    sender?: IDevice;
    receiver: IDevice;
  }) => Promise<MessageDoc>;
  @Action('handleServer', { namespace: 'network' })
  public handleServer!: (arg: 'start' | 'close') => Promise<boolean>;

  public onUserSelect = new Subject<string | undefined>();
  public onDraftChange = new Subject<{ roomId: string; draft: string }>();
  public showDialog = false;

  public async openRoom(user: UserDoc): Promise<void> {
    const room = await this.findRoomFromUserOrCreate(user);
    // Mode to room
    this.$router.push({
      name: 'room',
      params: { roomId: room.id },
    });
  }

  public onKeyDown(room: RoomType, draft: string, event: KeyboardEvent): void {
    if (event.code === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage(room, draft);
    }
  }

  public async onResendMessage(
    room: RoomType,
    message: MessageDoc
  ): Promise<void> {
    const receiver = await this.findUser(room.userIds[0]);
    if (!receiver) return; // TODO Handle receiver absent exception
    this.sendMessage({
      // Actually we don't need the username of the receiver
      message,
      receiver: { ...receiver.device, username: receiver.username },
      sender: this.thisUser
        ? {
            ...this.thisUser.device,
            username: this.thisUser.username,
          }
        : undefined,
    });
  }

  public async onSendMessage(room: RoomType, content: string): Promise<void> {
    const receiver = await this.findUser(room.userIds[0]);
    if (!receiver || content.trim() === '') return; // TODO Handle receiver absent exception
    this.onDraftChange.next({ roomId: room.id, draft: '' }); // Remove message
    this.sendMessage({
      // Actually we don't need the username of the receiver
      message: {
        roomId: room.id,
        content,
      },
      receiver: { ...receiver.device, username: receiver.username },
      sender: this.thisUser
        ? {
            ...this.thisUser.device,
            username: this.thisUser.username,
          }
        : undefined,
    });
  }

  public async onSendFile(room: RoomType, path: string): Promise<void> {
    const receiver = await this.findUser(room.userIds[0]);
    if (!receiver || path.trim() === '') return;
    this.sendFile({
      // Actually we don't need the username of the receiver
      message: {
        path,
        roomId: room.id,
      },
      receiver: { ...receiver.device, username: receiver.username },
      sender: this.thisUser
        ? {
            ...this.thisUser.device,
            username: this.thisUser.username,
          }
        : undefined,
    });
  }

  public async created(): Promise<void> {
    Promise.all([
      this.serverStatus === 'closed' ? Promise.resolve() : this.discoverUsers(),
      this.loadRooms(),
    ]);
  }
}
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - 78px); // 48 + 48 + 2
  overflow: auto;
}
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
.flash {
  animation: flash 2s infinite;
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes flash {
  50% {
    opacity: 0;
  }
}
</style>
