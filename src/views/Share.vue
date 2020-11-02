<template>
  <div>
    <div v-if="roomStream">
      <router-view
        :room="roomStream"
        :draft="draftStream"
        :loadingMessages="loading.message"
        :sendingMessage="loading.sending"
        :unreadCount="unreadMessagesByUser[roomStream.userIds[0]].size"
        @close="$router.back()"
        @keydown="(room, event) => onKeyDown(room, draftStream, event)"
        @change-message="
          (room, draft) => onDraftChange.next({ roomId: room.id, draft })
        "
        @resend-message="onResendMessage"
        @send-message="onSendMessage"
        @load-messages="(roomId, options) => loadMessages({ roomId, options })"
        @message-read="setMessagesToRead"
      />
    </div>
    <div v-else>
      <!-- Container -->
      <v-container
        :class="
          `container ${
            $vuetify.breakpoint.smAndDown ? 'small' : ''
          }  fill-height ma-0 pa-0 align-start`
        "
        fluid
      >
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
                v-text="`MAC address: ${userStream.device.mac}`"
              >
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-dialog>

      <!-- Dialog -->
      <v-dialog
        :value="loading.room || loading.message"
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
      <v-toolbar bottom color="surfaceVariant">
        <v-toolbar-items
          :class="`toolbar ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`"
        >
        </v-toolbar-items>

        <!-- Scanning... -->
        <v-card
          class="ma-0 ml-4 pa-0 flash"
          color="surfaceVariant"
          tile
          flat
          :height="$vuetify.breakpoint.smAndDown ? 56 : 64"
        >
          <v-card-text v-if="loading.user" class="ma-0 pa-3" @click="() => {}">
            <div class="overline text-center" style="user-select: none">
              SCANNING...
            </div>
          </v-card-text>
        </v-card>

        <v-spacer></v-spacer>
        <v-btn
          class="overline"
          depressed
          :loading="loading.user"
          :disabled="loading.user || serverStatusStream === 'off'"
          @click="discoverUsers"
          color="surfaceVariant"
        >
          <v-icon left>
            mdi-account-search
          </v-icon>
          Find
          <template v-slot:loader>
            <span class="custom-loader">
              <v-icon>mdi-cached</v-icon>
            </span>
          </template>
        </v-btn>

        <v-btn
          class="ml-2"
          depressed
          color="surfaceVariant"
          @click="
            changeServerStatus.next(serverStatusStream === 'on' ? 'off' : 'on')
          "
        >
          <v-icon left>
            mdi-server-network
          </v-icon>
          {{ serverStatusStream === 'on' ? 'off' : 'on' }}
        </v-btn>
      </v-toolbar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import { Getter, Mutation, Action } from 'vuex-class';
import { ipcRenderer } from 'electron';
import { ExtendedVue } from '@/utils/base-vue';
import Room from '@/components/Room.vue';
import { Room as RoomType } from '@/store/types';
import { toDictionary } from '@/utils/object';
import { UserDoc } from '@/rxdb/user/model';
import { MessageDoc } from '@/rxdb/message/model';
import { RoomDoc } from '@/rxdb/room/model';
import { Dictionary } from 'vue-router/types/router';
import { IDevice } from '@/electron/services/socket.io/types';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  scan,
  share,
  startWith,
  tap,
  throttle,
  withLatestFrom,
} from 'rxjs/operators';
import { BehaviorSubject, combineLatest, from, merge, of, Subject } from 'rxjs';

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
                const messages = await this.loadMessages({
                  roomId,
                  options: { skip: 0, limit: 15 },
                });
                // Initialize draft
                this.onDraftChange.next({ roomId: roomId, draft: '' });
                return roomId;
              })()
            )
          : Promise.resolve('')
      ),
      tap((value) => console.log('idStream')),
      share()
    );
    return {
      roomIdStream,
      userStream: this.onUserSelect.asObservable().pipe(
        map((userId) => (userId ? this.userDictionary[userId] : undefined)),
        share()
      ),
      roomStream: combineLatest(
        roomIdStream,
        this.$watchAsObservable(() => this.roomDictionary, {
          immediate: true,
        })
      ).pipe(
        map(([roomId, { newValue }]) => newValue[roomId as string]),
        tap((value) => console.log('roomStream')),
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
        tap((value) => console.log('draftStream')),
        share()
      ),
      serverStatusStream: this.changeServerStatus
        .asObservable()
        .pipe(
          throttle((action) => {
            return from(
              action === 'on'
                ? this.initServer().then((result) => (result ? 'on' : 'off'))
                : this.closeServer().then((result) => (result ? 'off' : 'on'))
            ).pipe(
              catchError((error) => {
                return of(action);
              })
            );
          })
        )
        .pipe(
          tap((value) => console.warn("why I'm fired before throttle", value))
        )
        // Default should be ON in main.ts
        .pipe(startWith('on'))
        .pipe(share()),
    } as const;
  },
})
export default class Share extends ExtendedVue {
  @Getter('loading', { namespace: 'network' })
  public loading!: { user: boolean; room: boolean; message: boolean };

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
    roomId: String,
    senderId: string
  ) => Promise<MessageDoc[]>;
  @Action('sendMessage', { namespace: 'network' })
  public sendMessage!: (args: {
    sender?: IDevice;
    receiver: IDevice;
    message: Omit<
      MessageDoc,
      'id' | 'updatedAt' | 'createdAt' | 'senderId' | 'status'
    > & { senderId?: string };
  }) => Promise<MessageDoc>;
  @Action('initServer', { namespace: 'network' })
  public initServer!: () => Promise<boolean>;
  @Action('closeServer', { namespace: 'network' })
  public closeServer!: () => Promise<boolean>;

  public onUserSelect = new Subject<string | undefined>();
  public onDraftChange = new Subject<{ roomId: string; draft: string }>();
  public changeServerStatus = new Subject<'on' | 'off'>();

  public async openRoom(user: UserDoc) {
    const room = await this.findRoomFromUserOrCreate(user);
    // Mode to room
    this.$router.push({
      name: 'room',
      params: { roomId: room.id },
    });
  }

  public onKeyDown(room: RoomType, draft: string, event: KeyboardEvent) {
    if (event.code === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage(room, draft);
    }
  }

  public async onResendMessage(room: RoomType, message: MessageDoc) {
    const receiver = await this.findUser(room.userIds[0]);
    if (!receiver) return; // TODO Handle receiver absent exception
    this.sendMessage({
      // Actually we don't need the username of the receiver
      receiver: { ...receiver.device, username: receiver.username },
      sender: this.thisUser
        ? {
            ...this.thisUser.device,
            username: this.thisUser.username,
          }
        : undefined,
      message,
    });
  }

  public async onSendMessage(room: RoomType, message: string) {
    const receiver = await this.findUser(room.userIds[0]);
    if (!receiver || message.trim() === '') return; // TODO Handle receiver absent exception
    this.onDraftChange.next({ roomId: room.id, draft: '' }); // Remove message
    this.sendMessage({
      // Actually we don't need the username of the receiver
      receiver: { ...receiver.device, username: receiver.username },
      sender: this.thisUser
        ? {
            ...this.thisUser.device,
            username: this.thisUser.username,
          }
        : undefined,
      message: {
        roomId: room.id,
        senderId: this.thisUser?.id,
        content: message,
        type: 'text',
      },
    });
  }

  public async created() {
    Promise.all([
      (this as any).serverStatusStream === 'off'
        ? Promise.resolve([])
        : this.loadRooms(),
      this.discoverUsers(),
    ]);
  }
}
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - 65px);
  overflow: auto;
}
.container.small {
  height: calc(100vh - 56px);
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
