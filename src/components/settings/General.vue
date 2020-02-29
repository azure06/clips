<template>
  <div>
    <v-list subheader dense>
      <v-subheader>General</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="settings.system.notifications"
            @change="
              $emit('change-settings', {
                ...settings,
                system: { ...settings.system, notifications: !settings.system.notifications },
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Notifications</v-list-item-title>
          <v-list-item-subtitle>Notify me about updates</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense>
      <v-subheader>Display position</v-subheader>
      <v-list-item>
        <v-radio-group :value="settings.system.display.type" :mandatory="true" dense>
          <v-radio
            @change="
              $emit('change-settings', {
                ...settings,
                system: {
                  ...settings.system,
                  display: { ...settings.system.display, type: 'cursor' },
                },
              })
            "
            color="blue darken-2"
            class="caption label"
            label="Cursor"
            value="cursor"
          ></v-radio>
          <v-radio
            @change="
              $emit('change-settings', {
                ...settings,
                system: {
                  ...settings.system,
                  display: { ...settings.system.display, type: 'maintain' },
                },
              })
            "
            color="blue darken-2"
            class="caption label"
            label="Maintain"
            value="maintain"
          ></v-radio>
        </v-radio-group>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense>
      <v-subheader>Theme</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="settings.appearance.theme.dark"
            @change="
              $emit('change-settings', {
                ...settings,
                appearance: {
                  ...settings.appearance,
                  theme: { dark: !settings.appearance.theme.dark },
                },
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Dark theme</v-list-item-title>
          <v-list-item-subtitle>Switch to dark theme color</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense>
      <v-subheader>Drive</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="settings.drive.sync"
            @change="
              $emit('change-settings', {
                ...settings,
                drive: {
                  ...settings.drive,
                  sync: !settings.drive.sync,
                },
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Drive sync</v-list-item-title>
          <v-list-item-subtitle>Sync your devices with google drive</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="pt-2">
        <v-list-item-content>
          <v-list-item-title>Threshold</v-list-item-title>
          <v-list-item-subtitle>
            Sync start after {{ settings.drive.threshold }} items have been added to clipboard
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-slider
        :value="settings.drive.threshold"
        :disabled="!settings.drive.sync"
        class="pl-10 pr-10"
        style="-webkit-app-region: no-drag"
        step="10"
        min="50"
        max="200"
        hide-details
        thumb-label
        @input="
          (value) => {
            $emit('change-settings', {
              ...settings,
              drive: {
                ...settings.drive,
                threshold: value,
              },
            });
          }
        "
      ></v-slider>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense>
      <v-subheader>System</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="settings.system.startup"
            @change="(value) => $emit('change-startup', value)"
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Run at startup</v-list-item-title>
          <v-list-item-subtitle>Start the app on stystem startup</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="settings.system.blur"
            @change="
              $emit('change-settings', {
                ...settings,
                system: { ...settings.system, blur: !settings.system.blur },
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Hide on blur</v-list-item-title>
          <v-list-item-subtitle>The app will be hidden on blur event</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>

    <v-list subheader dense two-line>
      <v-subheader>Privacy and security</v-subheader>
      <v-list-item link @click="$emit('action', 'clear-data')">
        <v-list-item-action>
          <v-icon>mdi-delete-sweep</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Clear data</v-list-item-title>
          <v-list-item-subtitle>Clear entire clipboard history</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="$emit('action', 'factory-default')">
        <v-list-item-action>
          <v-icon>mdi-cellphone-erase</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Restore to factory default</v-list-item-title>
          <v-list-item-subtitle
            >All your data and settings will be restored to factory default
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { SettingsState } from '../../store/types';

@Component
export default class General extends Vue {
  @Prop({ required: true })
  public settings!: SettingsState;
}
</script>

<style scoped lang="scss">
.label ::v-deep .v-label {
  font-size: 0.8rem;
}
</style>
