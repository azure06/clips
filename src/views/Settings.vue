<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    scrollable
  >
    <!--  Drawer -->
    <v-navigation-drawer
      mini-variant
      permanent
      app
      style="-webkit-app-region: drag"
      color="surfaceVariant"
    >
      <v-list dense nav>
        <v-list-item class="px-1">
          <v-list-item-avatar tile>
            <v-icon large>mdi-language-haskell</v-icon>
          </v-list-item-avatar>
        </v-list-item>

        <v-divider class="mb-1"></v-divider>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item
              v-on="on"
              class="px-3"
              link
              :to="{ name: 'general-settings' }"
              style="-webkit-app-region: no-drag"
            >
              <v-list-item-icon>
                <v-icon>mdi-console-line</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $translations.general }}</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item
              v-on="on"
              class="px-3"
              link
              :to="{ name: 'advanced-settings' }"
              style="-webkit-app-region: no-drag"
            >
              <v-list-item-icon>
                <v-badge v-if="!premium" color="cyan darken-2" overlap>
                  <template v-slot:badge>
                    <v-icon x-small>mdi-lock</v-icon>
                  </template>
                  <v-icon>mdi-view-grid-plus</v-icon>
                </v-badge>
                <v-icon v-else>mdi-view-grid-plus</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $translations.advanced }}</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-list-item
              v-on="on"
              class="px-3"
              link
              style="-webkit-app-region: no-drag"
              :to="{ name: 'language-settings' }"
            >
              <v-list-item-icon>
                <v-icon>mdi-web</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Group</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $translations.language }}</span>
        </v-tooltip>
      </v-list>

      <template v-slot:append>
        <v-list dense nav class="py-0">
          <transition name="fade">
            <v-list-item v-if="false" class="my-1 px-3" link>
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
              <v-list-item
                v-on="on"
                class="my-1 px-3"
                link
                :to="{ name: 'about' }"
                style="-webkit-app-region: no-drag"
              >
                <v-list-item-icon>
                  <v-icon>mdi-information</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>title</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <span>{{ $translations.about }}</span>
          </v-tooltip>
        </v-list>
      </template>
    </v-navigation-drawer>

    <div class="ma-0 pa-0 container">
      <!-- Toolbar -->
      <v-toolbar flat color="surfaceVariant">
        <v-btn icon @click="onClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-toolbar-title>{{ $translations.settings }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-divider></v-divider>

      <!-- Rooter -->
      <div :class="`content ${$vuetify.breakpoint.smAndDown ? 'small' : ''}`">
        <router-view
          :settings="settings"
          :translations="$translations"
          :premium="premium"
          :licenseKey="licenseKey"
          :fetching="fetching"
          @change-settings="
            (payload) => changeSettings({ vuetify: $vuetify, payload })
          "
          @change-shortcut="
            (payload) => changeShortcut({ vuetify: $vuetify, payload })
          "
          @change-startup="
            (payload) => changeStartup({ vuetify: $vuetify, payload })
          "
          @action="openDialog"
          @change-licensekey="(value) => (licenseKey = value)"
          @activate-premium="activatePremium"
        />
      </div>

      <!-- Dialog -->
      <v-dialog v-model="dialog_" hide-overlay persistent width="300">
        <v-card color="blue darken-2" dark>
          <v-card-text>
            {{ $translations.mightTakeSeveralMinutes }}
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Dialog -->
      <v-snackbar
        color="error"
        v-model="errorDialog"
        hide-overlay
        persistent
        width="300"
      >
        Invalid license key
      </v-snackbar>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { ExtendedVue } from '@/utils/base-vue';
import { Component, Vue, Mixins } from 'vue-property-decorator';
import { Clip, SettingsState } from '@/store/types';
import { Getter, Mutation, Action } from 'vuex-class';
import { activatePremium } from '@/firebase';
import moment from 'moment';

@Component
export default class Settings extends ExtendedVue {
  @Mutation('changeSettings', { namespace: 'settings' })
  public changeSettings!: (args: {
    vuetify: any;
    payload: SettingsState;
  }) => void;
  @Mutation('restoreSettings', { namespace: 'settings' })
  public restoreSettings!: () => void;
  @Mutation('setPremium', { namespace: 'clips' })
  public setPremium!: (arg: boolean) => void;
  @Action('changeShortcut', { namespace: 'settings' })
  public changeShortcut!: (args: {
    vuetify: any;
    payload: any;
  }) => Promise<void>;
  @Action('changeStartup', { namespace: 'settings' })
  public changeStartup!: (args: {
    vuetify: any;
    payload: boolean;
  }) => Promise<void>;
  @Action('restoreFactoryDefault', { namespace: 'clips' })
  public restoreFactoryDefault!: () => Promise<boolean>;
  @Getter('premium', { namespace: 'clips' })
  public premium!: () => boolean;
  public dialog = false;
  public dialog_ = false;
  public action?: 'clear-data' | 'factory-default';
  public licenseKey = '';
  public fetching = false;
  public errorDialog = false;

  public onClose() {
    this.dialog = false;
    this.$nextTick(() => this.$router.push({ name: 'home' }));
  }

  public async activatePremium(licenseKey: string) {
    if (licenseKey.trim() === '') return;
    this.fetching = true;
    const premium = await activatePremium(licenseKey)
      .then((response) => response.text())
      .then((body) => JSON.parse(body))
      .then(({ valid }) => valid)
      .catch((_) => false);
    this.fetching = false;
    this.errorDialog = !premium;
    this.setPremium(premium);
  }

  public async openDialog(action: 'clear-data' | 'factory-default') {
    this.dialog_ = true;
    const response = confirm('Are you sure you want to continue?');
    const _ = response
      ? await this.restoreFactoryDefault()
          .catch((_) => _)
          .then((_) => {
            if (action === 'factory-default') {
              this.restoreSettings();
              location.reload();
            }
          })
      : await Promise.resolve();
    this.dialog_ = false;
  }

  public mounted() {
    this.dialog = true;
  }
}
</script>

<style scoped lang="scss">
$drawer-width: 64px;

.container {
  max-width: 100%;
  position: relative;
  left: $drawer-width;
  width: calc(100% - 64px);
}

.content {
  height: calc(100vh - 65px);
  overflow: auto;
}
.content.small {
  height: calc(100vh - 57px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.v-navigation-drawer {
  width: $drawer-width !important;
}
</style>
