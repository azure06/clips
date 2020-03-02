<template>
  <div>
    <v-list subheader dense>
      <v-subheader>{{ translations.general }}</v-subheader>
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
          <v-list-item-title>{{ translations.notification }}</v-list-item-title>
          <v-list-item-subtitle>{{ translations.notifyMeAboutUpdates }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense>
      <v-subheader>{{ translations.displayPosition }}</v-subheader>
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
            :label="translations.cursor"
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
            :label="translations.maintain"
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
          <v-list-item-title>{{ translations.darkTheme }}</v-list-item-title>
          <v-list-item-subtitle>{{ translations.switchToDarkTheme }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense>
      <v-subheader>{{ translations.googleDrive }}</v-subheader>
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
          <v-list-item-title>{{ translations.driveSync }}</v-list-item-title>
          <v-list-item-subtitle>{{ translations.syncDevicesWithDrive }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="pt-2">
        <v-list-item-content>
          <v-list-item-title>{{ translations.threshold }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ replacer(translations.syncEvery, settings.drive) }}
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
      <v-subheader>{{ translations.system }}</v-subheader>
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
          <v-list-item-title>{{ translations.runAtStartup }}</v-list-item-title>
          <v-list-item-subtitle>{{ translations.startOnSystemStartup }}</v-list-item-subtitle>
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
          <v-list-item-title>{{ translations.hideOnBlur }}</v-list-item-title>
          <v-list-item-subtitle>{{ translations.appHiddenOnBlur }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>

    <v-list subheader dense two-line>
      <v-subheader>{{ translations.privacyAndSecurity }}</v-subheader>
      <v-list-item link @click="$emit('action', 'clear-data')">
        <v-list-item-action>
          <v-icon>mdi-delete-sweep</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.clearData }} </v-list-item-title>
          <v-list-item-subtitle>{{ translations.clearClipboardHistory }} </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item link @click="$emit('action', 'factory-default')">
        <v-list-item-action>
          <v-icon>mdi-cellphone-erase</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.restoreFactoryDefault }}</v-list-item-title>
          <v-list-item-subtitle>{{ translations.allDataWillBeRestored }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { BaseVue } from '@/utils/base-vue';
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { SettingsState } from '../../store/types';
import { replace } from '@/utils/string';

@Component
export default class General extends Vue {
  @Prop({ required: true })
  public settings!: SettingsState;
  @Prop({ required: true })
  public translations!: any;

  public get replacer() {
    return replace;
  }
}
</script>

<style scoped lang="scss">
.label ::v-deep .v-label {
  font-size: 0.8rem;
}
</style>
