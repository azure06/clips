<template>
  <v-navigation-drawer v-model="drawer" mini-variant app permanent>
    <v-list dense nav class="py-0">
      <v-list-item two-line>
        <v-list-item-avatar color="#CEF2EF">
          <span v-if="!user" class="headline subtitle-2" style="color: #1B9488;">F</span>
          <img v-else :src="user.photoLink" />
        </v-list-item-avatar>
      </v-list-item>

      <v-divider></v-divider>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on" class="mt-1 pa-1" link :to="{ name: 'home' }">
            <v-list-item-icon>
              <v-icon>mdi-laptop-mac</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Home</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Home</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-show="user"
            v-on="on"
            class="mt-1 pa-1"
            link
            :to="{ name: 'google-drive' }"
          >
            <v-list-item-icon>
              <v-icon>mdi-folder-google-drive</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Google Drive Sync</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Drive folder</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on" class="mt-1 pa-1" link :to="{ name: 'account' }">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Account</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Account</span>
      </v-tooltip>

      <v-list-item class="mt-1 pa-1" link :to="{ name: 'about' }">
        <v-list-item-icon>
          <v-icon>mdi-account-group-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Group</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <v-list dense nav class="py-0">
        <transition v-if="loading" name="fade">
          <v-list-item class="pa-1 mb-1" link>
            <v-progress-circular
              indeterminate
              color="cyan darken-2"
              :width="3"
              :size="25"
            ></v-progress-circular>
          </v-list-item>
        </transition>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item v-on="on" class="pa-1 mb-1" link :to="{ name: 'settings' }">
              <v-list-item-icon>
                <v-icon>mdi-settings</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>title</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>Settings</span>
        </v-tooltip>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { User } from '@/store/types';

@Component
export default class NavDrawer extends Vue {
  @Getter('loading', { namespace: 'clips' })
  public loading!: boolean;
  @Getter('user', { namespace: 'user' })
  public user!: any;
  public drawer = true;
}
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
