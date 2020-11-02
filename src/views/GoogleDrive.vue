<template>
  <div>
    <v-container
      :class="
        `container ${
          $vuetify.breakpoint.smAndDown ? 'small' : ''
        }  fill-height ma-0 pa-0`
      "
      fluid
    >
      <v-row v-if="loading" align="center" justify="center">
        <v-progress-circular
          indeterminate
          class="center"
          color="cyan darken-2"
        ></v-progress-circular>
      </v-row>
      <v-row
        v-if="!loading"
        align="start"
        justify="center"
        class="ma-0 pa-0 fill-height"
      >
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
                      @click="retrieveFile(change)"
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
    </v-toolbar>

    <!-- Dialog -->
    <v-dialog v-model="fetching" hide-overlay persistent width="300">
      <v-card color="blue darken-2" dark>
        <v-card-text>
          Downloading...
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
import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import moment from 'moment';
import { GaxiosError } from 'gaxios';
import { ExtendedVue } from '@/utils/base-vue';
import { storeService } from '@/electron/services/electron-store';

type SchemaChange = { [token: string]: drive_v3.Schema$Change[] };
type AurthError = {
  code: number;
  config: unknown;
  errors: unknown[];
  response: unknown;
};
type GaxiosErrorEx = { error: GaxiosError | AurthError | unknown };

@Component
export default class GoogleDrive extends ExtendedVue {
  @Action('signOut', { namespace: 'user' })
  public signOut!: () => Promise<void>;
  @Action('downloadJson', { namespace: 'clips' })
  public downloadJson!: (clip: Clip[]) => Promise<void>;
  @Getter('user', { namespace: 'user' })
  public processing!: boolean;
  public user!: () => Promise<User>;
  public driveChanges: Array<[string, drive_v3.Schema$Change[]]> = [];
  public snackbar = false;
  public errorMsg = '';
  public loading = false;
  public fetching = false;
  public inputToken = '';
  public storedToken = '';

  public get moment(): typeof moment {
    return moment;
  }

  public isGaxiosError(
    response: GaxiosErrorEx | SchemaChange
  ): response is GaxiosErrorEx {
    return 'error' in response;
  }

  public async resetPageToken(): Promise<void> {
    const pageToken = await ipcRenderer.invoke('change-page-token');
    storeService.setPageToken(pageToken);
    this.retrieveData();
  }

  public async updatePageToken(token: string): Promise<void> {
    if (token && Number.isInteger(+token)) {
      this.retrieveData(token);
    } else {
      this.errorMsg = this.$translations.tokenShouldBeNumeric;
      this.snackbar = true;
    }
  }

  public async retrieveFile(change: drive_v3.Schema$Change): Promise<void> {
    // FIXME move to action?
    this.fetching = true;
    const response = await ipcRenderer.invoke('retrieve-file', change.fileId);
    this.fetching = false;
    if (this.isGaxiosError(response)) {
      this.errorHandler(response);
    } else {
      this.downloadJson(response);
    }
  }

  public async retrieveData(token?: string): Promise<void> {
    this.loading = true;
    if (token) {
      const newToken = await ipcRenderer.invoke('change-page-token', token);
      storeService.setPageToken(newToken);
    }
    this.storedToken = storeService.getPageToken('');
    const response: SchemaChange | GaxiosErrorEx = await ipcRenderer.invoke(
      'list-files'
    );
    this.loading = false;
    if (!this.isGaxiosError(response)) {
      this.driveChanges = Object.entries(response)
        .reverse()
        .map(([token, changes]) => [
          token,
          changes.sort(
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

  public errorHandler(gaxiosError: GaxiosErrorEx): void {
    this.errorMsg = (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((gaxiosError.error as any).code) {
        case 401:
          return this.$translations.invalidCredentials;
        case 402:
          return this.$translations.invalidCredentials;
        case 'ENOTFOUND':
          return this.$translations.networkError;
        default:
          return this.$translations.somethingWentWrong;
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
  height: calc(100vh - 65px);
  overflow: auto;
  background-image: url('./../assets/icons/clip.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 30%;
}
.container.small {
  height: calc(100vh - 56px);
}
</style>
