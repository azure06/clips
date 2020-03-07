<template>
  <v-navigation-drawer v-model="drawer" mini-variant app permanent>
    <v-list dense nav class="py-0">
      <v-list-item two-line>
        <v-list-item-avatar>
          <v-icon v-if="!user" large>mdi-language-haskell</v-icon>
          <img v-else :src="user.photoLink" />
        </v-list-item-avatar>
      </v-list-item>

      <v-divider></v-divider>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-on="on"
            class="mt-1 pa-1"
            link
            :to="{ name: 'home' }"
            style="-webkit-app-region: no-drag"
          >
            <v-list-item-icon>
              <v-icon>mdi-laptop-mac</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Home</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $translations.home }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-show="user"
            v-on="on"
            class="mt-1 pa-1"
            link
            :to="{ name: 'google-drive' }"
            style="-webkit-app-region: no-drag"
          >
            <v-list-item-icon>
              <v-icon>mdi-folder-google-drive</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Google Drive Sync</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $translations.driveFolder }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-list-item
            v-on="on"
            class="mt-1 pa-1"
            link
            :to="{ name: 'account' }"
            style="-webkit-app-region: no-drag"
          >
            <v-list-item-icon>
              <v-icon>mdi-account-circle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Account</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $translations.account }}</span>
      </v-tooltip>

      <v-list-item
        v-if="false"
        class="mt-1 pa-1"
        link
        :to="{ name: 'about' }"
        style="-webkit-app-region: no-drag"
      >
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
        <v-list-item v-if="loading" class="pa-1 mb-1" link>
          <v-progress-circular
            indeterminate
            color="cyan darken-2"
            :width="3"
            :size="25"
          ></v-progress-circular>
        </v-list-item>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item
              v-on="on"
              class="pa-1 mb-1"
              link
              :to="{ name: 'settings' }"
              style="-webkit-app-region: no-drag"
            >
              <v-list-item-icon>
                <v-icon>mdi-settings</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>title</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $translations.settings }}</span>
        </v-tooltip>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
// @ is an alias to /src
import { BaseVue } from '@/utils/base-vue';
import { Component, Vue, Mixins } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { User } from '@/store/types';

@Component
export default class NavDrawer extends BaseVue {
  @Getter('loading', { namespace: 'clips' })
  public loading!: boolean;
  @Getter('user', { namespace: 'user' })
  public user!: any;
  public drawer = true;
}
</script>

<style scoped lang="scss"></style>
