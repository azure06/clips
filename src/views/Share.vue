<template>
  <div>
    <div v-if="selectedRoom">
      <Room :room="roomDictionary[selectedRoom]" />
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
        <v-list subheader color="primary" width="100%">
          <v-subheader>Users</v-subheader>
          <v-list-item
            v-for="user in users"
            :key="user.id"
            @click="onUserClick(user)"
          >
            <v-list-item-avatar>
              <v-icon :class="user.color" dark v-text="'mdi-account'"></v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="user.username"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click.stop="selectedUser = user.id">
                <v-icon color="grey lighten-1">mdi-information</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-container>

      <!-- Dialogue -->
      <v-dialog
        v-if="selectedUser"
        :value="!!selectedUser"
        @input="selectedUser = ''"
        hide-overlay
        width="360"
      >
        <v-list three-line subheader color="surface" width="100%">
          <v-subheader class="overline">User Info</v-subheader>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon dark v-text="'mdi-account'"></v-icon>
            </v-list-item-avatar>
            <v-list-item-content class="px-2">
              <v-list-item-title
                class="pb-1 subtitle-2"
                v-text="userDictionary[selectedUser].username"
              ></v-list-item-title>
              <v-list-item-subtitle
                class="caption"
                v-text="`IP address: ${userDictionary[selectedUser].device.ip}`"
              >
              </v-list-item-subtitle>
              <v-list-item-subtitle
                class="caption"
                v-text="
                  `MAC address: ${userDictionary[selectedUser].device.mac}`
                "
              >
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-dialog>

      <!-- Toolbar -->
      <v-toolbar bottom color="primary">
        <v-toolbar-items
          :class="`toolbar ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`"
        >
        </v-toolbar-items>
        <v-card
          color="primary"
          class="ma-0 ml-6 pa-0"
          tile
          flat
          dark
          :height="$vuetify.breakpoint.smAndDown ? 56 : 64"
        >
          <v-card-text v-if="fetching" class="ma-0 pa-3" @click="() => {}">
            <div class="overline text-center">SEARCHING</div>
            <v-progress-linear
              stream
              buffer-value="0"
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
        <v-spacer></v-spacer>
        <v-btn
          class="overline"
          color="primary"
          depressed
          :loading="fetching"
          :disabled="fetching"
          @click="findUsers"
        >
          <v-icon left>
            mdi-account-search
          </v-icon>
          Find
          <template v-slot:loader>
            <span class="custom-loader">
              <v-icon dark>mdi-cached</v-icon>
            </span>
          </template>
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

@Component({ components: { Room } })
export default class Share extends ExtendedVue {
  @Getter('fetching', { namespace: 'network' })
  public fetching!: Boolean;

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

  @Action('findUsers', { namespace: 'network' })
  public findUsers!: () => Promise<void>;
  @Action('retrieveRooms', { namespace: 'network' })
  public retrieveRooms!: () => Promise<RoomType[]>;
  @Action('retrieveMessages', { namespace: 'network' })
  public retrieveMessages!: (roomId: string) => Promise<MessageDoc[]>;
  @Action('addRoom', { namespace: 'network' })
  public addRoom!: (
    args: Omit<RoomDoc, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<RoomType>;

  public selectedUser: string = '';
  public selectedRoom: string = '';

  public async created() {
    if (this.users.length === 0) this.findUsers();
  }

  public mounted() {
    console.warn(this.userDictionary);
  }

  public async onUserClick(user: UserDoc) {
    const room = await ((room_: RoomType | undefined): Promise<RoomType> => {
      return room_
        ? Promise.resolve(room_)
        : this.addRoom({
            roomName: user.username,
            userIds: [user.device.mac],
          });
    })(toDictionary(await this.retrieveRooms())[user.device.mac]);
    console.warn(room);
    this.selectedRoom = room.id;
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

@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
