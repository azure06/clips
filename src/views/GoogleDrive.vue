<template>
  <div class="fill-height">
    <AppBar style="width: 100%" :translations="$translations" />
    <v-container class="container ma-0 pa-0 d-flex" fluid>
      <v-row v-if="loading" align="center" justify="center">
        <v-progress-circular
          indeterminate
          class="center"
          color="cyan darken-2"
        ></v-progress-circular>
      </v-row>
      <!-- Not sure why, but this does the trick max-height: 0px -->
      <v-row v-else align="start" class="ma-0 pa-0" style="max-height: 0px">
        <v-expansion-panels title="File">
          <v-expansion-panel
            v-for="([token, changes], index) in driveChanges"
            :key="token + index"
          >
            <v-expansion-panel-header
              class="subtitle-2 text-uppercase"
              color="surfaceVariant"
            >
              <div>
                <v-chip label link>
                  <v-icon left small>mdi-google</v-icon>
                  <span class="caption text-capitalize font-weight-medium">
                    Sync
                    <span class="caption text-lowercase font-weight-light">
                      token
                    </span>
                    {{ token }}
                  </span>
                </v-chip>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content color="surfaceVariant">
              <v-list
                subheader
                rounded
                width="100%"
                dense
                color="surfaceVariant"
              >
                <v-subheader inset>Files</v-subheader>
                <v-divider inset></v-divider>
                <v-list-item
                  v-for="(change, index) in changes"
                  :key="token + index"
                  @click="() => {}"
                >
                  <v-list-item-avatar>
                    <v-icon
                      dark
                      :class="[
                        change.removed ? 'red darken-2' : 'blue darken-2',
                      ]"
                      v-text="change.removed ? 'mdi-delete-circle' : 'mdi-file'"
                    ></v-icon>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-subtitle
                      v-text="
                        moment(change.time).format('MMMM DD, YYYY – hh:mm:ss')
                      "
                    ></v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-btn
                      v-if="!change.removed"
                      icon
                      @click="retrieveFile(change, 'sync')"
                    >
                      <v-icon color="grey lighten-1"
                        >mdi-swap-horizontal</v-icon
                      >
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn
                      v-if="!change.removed"
                      icon
                      @click="retrieveFile(change, 'downlaod')"
                    >
                      <v-icon color="grey lighten-1">mdi-download</v-icon>
                    </v-btn>
                    <v-btn v-else icon>
                      <v-icon color="grey lighten-1">mdi-information</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-divider inset></v-divider>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-row>

      <v-snackbar v-model="snackbar" color="pink">
        {{ errorMsg }}
        <v-btn text @click="snackbar = false">
          Close
        </v-btn>
      </v-snackbar>
    </v-container>
    <v-toolbar bottom color="surfaceVariant">
      <v-toolbar-items
        :class="`toolbar ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`"
      >
        <v-text-field
          :label="$translations.insertValidToken"
          v-model="inputToken"
          :class="$vuetify.breakpoint.smAndDown ? 'pa-2' : 'pa-3'"
          prepend-inner-icon="mdi-google"
          color="blue darken-2"
          background-color="background"
          autofocus
          clearable
          dense
          flat
          solo
          filled
        ></v-text-field>
      </v-toolbar-items>
      <v-btn depressed text @click="updatePageToken(inputToken)">{{
        $translations.confirm
      }}</v-btn>
      <v-spacer></v-spacer>
      <v-chip v-if="storedToken" label close link @click:close="resetPageToken">
        <v-icon left small>mdi-google</v-icon>
        <span class="caption font-weight-medium">
          Token:
          <span class="caption font-weight-light"> {{ storedToken }} </span>
        </span>
      </v-chip>

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
            <v-icon class="mx-2">mdi-share-variant</v-icon> Sync with Google
            Drive
          </v-card-title>

          <v-card-text>
            Insert a valid token from another device to retrieve your clipboard
            history. If you don't have one the newest token will be
            automatically used.
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <!-- Dialog -->
    <v-dialog v-model="fetching" hide-overlay persistent width="300">
      <v-card color="blue darken-2" dark>
        <v-card-text>
          Retrieving data...
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Clip, User } from '@/store/types';
import { Getter, Action } from 'vuex-class';
import { drive_v3 } from 'googleapis';
import moment from 'moment';
import { ExtendedVue } from '@/utils/basevue';
import * as storeService from '@/electron/services/electron-store';
import {
  changePageToken,
  listGoogleDriveFiles,
  retrieveFileFromDrive,
} from '@/utils/invocation';
import { HttpFailure, isSuccessHttp } from '@/utils/invocation-handler';
import AppBar from '@/components/AppBar.vue';

@Component({ components: { AppBar } })
export default class GoogleDrive extends ExtendedVue {
  @Action('signOut', { namespace: 'configuration' })
  public signOut!: () => Promise<void>;
  @Action('createBackup', { namespace: 'clips' })
  public createBackup!: (clip: Clip[]) => Promise<void>;
  @Action('addClip', { namespace: 'clips' })
  public addClip!: (clip: Clip) => Promise<void>;
  @Getter('user', { namespace: 'configuration' })
  public processing!: boolean;
  public user!: () => Promise<User>;
  public driveChanges: Array<[string, drive_v3.Schema$Change[]]> = [];
  public snackbar = false;
  public errorMsg = '';
  public loading = false;
  public fetching = false;
  public inputToken = '';
  public storedToken = '';
  public showDialog = false;

  public get moment(): typeof moment {
    return moment;
  }

  public async resetPageToken(): Promise<void> {
    const response = await changePageToken();
    if (isSuccessHttp(response) && response.data.startPageToken) {
      storeService.setPageToken(response.data.startPageToken);
      this.retrieveData();
    }
  }

  public async updatePageToken(token: string): Promise<void> {
    if (token && Number.isInteger(+token)) {
      this.retrieveData(token);
    } else {
      this.errorMsg = this.$translations.tokenShouldBeNumeric;
      this.snackbar = true;
    }
  }

  public async retrieveFile(
    change: drive_v3.Schema$Change,
    action: 'download' | 'sync' = 'sync'
  ): Promise<void> {
    // FIXME move to action?
    this.fetching = true;
    retrieveFileFromDrive(change.fileId)
      .then((response) =>
        !isSuccessHttp(response)
          ? this.errorHandler(response)
          : action === 'sync'
          ? (Promise.all(response.data.map(this.addClip)) as unknown)
          : this.createBackup(response.data)
      )
      .finally(() => (this.fetching = false));
  }

  public async retrieveData(token?: string): Promise<void> {
    this.loading = true;
    if (token) {
      const response = await changePageToken(token);
      if (isSuccessHttp(response) && response.data.startPageToken)
        storeService.setPageToken(response.data.startPageToken);
    }
    this.storedToken = storeService.getPageToken('');
    const response = await listGoogleDriveFiles();
    this.loading = false;
    if (isSuccessHttp(response)) {
      this.driveChanges = Object.entries(response.data)
        .reverse()
        .map(([token, changes]) => [
          token,
          changes
            .filter((change) => change.file?.name === 'clips.json')
            .sort(
              (a, b) =>
                new Date(b.time || '').getTime() -
                new Date(a.time || '').getTime()
            ),
        ])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, changes]) => changes.length > 0) as Array<
        [string, drive_v3.Schema$Change[]]
      >;
    } else {
      this.errorHandler(response);
    }
  }

  public errorHandler(response: HttpFailure): void {
    this.errorMsg = (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch (response.status) {
        case 401:
          return this.$translations.invalidCredentials;
        case 402:
          return this.$translations.invalidCredentials;
        default:
          return response.message;
      }
    })();
    this.snackbar = true;
  }

  public async mounted(): Promise<void> {
    this.retrieveData();
  }
}
</script>

<style scoped lang="scss">
.container {
  height: calc(100% - 106px);
  overflow: auto;
  overflow-x: hidden;
  background-image: url('./../assets/icons/clip.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 30%;
}
</style>
