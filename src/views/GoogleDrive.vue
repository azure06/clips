<template>
  <div>
    <v-container
      :class="`container ${$vuetify.breakpoint.smAndDown ? 'small' : ''}  fill-height ma-0 pa-0`"
      fluid
    >
      <v-row v-if="loading" align="center" justify="center">
        <v-progress-circular
          indeterminate
          class="center"
          color="cyan darken-2"
        ></v-progress-circular>
      </v-row>
      <v-row v-if="!loading" align="start" justify="center" class="ma-0 pa-0 fill-height">
        <v-expansion-panels title="File">
          <v-expansion-panel v-for="([token, changes], index) in driveChanges" :key="token + index">
            <v-expansion-panel-header class="subtitle-2 text-uppercase">
              <div>
                <v-chip label link>
                  <v-icon left small>mdi-google</v-icon>
                  <span class="caption text-lowercase font-weight-medium">
                    sync with
                    <span class="caption text-capitalize font-weight-light"> Token </span>
                    {{ token }}
                  </span>
                </v-chip>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list subheader rounded width="100%" dense>
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
                      :class="[change.removed ? 'red darken-2' : 'blue darken-2']"
                      v-text="change.removed ? 'mdi-delete-circle' : 'mdi-file'"
                    ></v-icon>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-subtitle
                      v-text="moment(change.time).format('MMMM DD, YYYY – hh:mm:ss')"
                    ></v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-btn icon>
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
    <v-toolbar bottom>
      <v-toolbar-items :class="`toolbar ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`">
        <v-text-field
          class="pa-2"
          label="Insert a valid Token..."
          prepend-inner-icon="mdi-google"
          autofocus
          clearable
          dense
          flat
          solo
          filled
        ></v-text-field> </v-toolbar-items
    ></v-toolbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';
import Observable, { fromEvent, Subject, merge } from 'rxjs';
import { Clip, User } from '@/store/types';
import { Getter, Mutation, Action } from 'vuex-class';
import { ipcRenderer } from 'electron';
import { drive_v3 } from 'googleapis';
import moment from 'moment';
import { GaxiosResponse, GaxiosError } from 'gaxios';

type SchemaChange = { [token: string]: drive_v3.Schema$Change[] };
type AurthError = {
  code: number;
  config: any;
  errors: any[];
  response: any;
};
type GaxiosErrorEx = { error: GaxiosError | AurthError | any };

@Component
export default class GoogleDrive extends Vue {
  @Action('signOut', { namespace: 'user' })
  public signOut!: () => Promise<void>;
  @Getter('user', { namespace: 'user' })
  public user!: () => Promise<User>;
  public driveChanges: Array<[string, drive_v3.Schema$Change[]]> = [];
  public loading: boolean = true;
  public snackbar = false;
  public errorMsg = '';

  public get moment() {
    return moment;
  }

  public isGaxiosError(response: GaxiosErrorEx | SchemaChange): response is GaxiosErrorEx {
    return 'error' in response;
  }

  public async mounted() {
    const response: SchemaChange | GaxiosErrorEx = await ipcRenderer.invoke('list-files');
    this.loading = false;
    this.driveChanges = !this.isGaxiosError(response)
      ? (Object.entries(response)
          .reverse()
          .map(([token, changes]) => [
            token,
            changes.sort(
              (a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime()
            ),
          ])
          .filter(([_, changes]) => changes.length > 0) as [string, drive_v3.Schema$Change[]][])
      : [];

    if (this.isGaxiosError(response)) {
      if (response.error.code == 401 || response.error.code == 400) {
        this.errorMsg = 'Invalid credentials';
        this.snackbar = true;
        await this.signOut();
      } else {
        this.errorMsg = 'Something went wrong.';
        this.snackbar = true;
      }
    }
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
  height: calc(100vh - 57px);
}
</style>
