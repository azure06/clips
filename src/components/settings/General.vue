<template>
  <div>
    <v-list subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.general }}</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="general.notifications"
            @change="
              $emit('set-general', {
                ...general,
                notifications: !general.notifications,
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.notification }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.notifyMeAboutUpdates
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.positioningMode }}</v-subheader>
      <v-list-item>
        <v-radio-group
          :value="general.positioningMode.type"
          :mandatory="true"
          dense
        >
          <v-radio
            @change="
              $emit('set-general', {
                ...general,
                positioningMode: { ...general.positioningMode, type: 'cursor' },
              })
            "
            color="blue darken-2"
            class="caption label"
            :label="translations.cursor"
            value="cursor"
          ></v-radio>
          <v-radio
            @change="
              $emit('set-general', {
                ...general,
                positioningMode: {
                  ...general.positioningMode,
                  type: 'maintain',
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
    <v-list v-if="isWindows" subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.taskbar }}</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="general.skipTaskbar"
            @change="$emit('set-skip-taskbar', !general.skipTaskbar)"
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.hide }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.hideFromTaskbar
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.theme }}</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="appearance.theme === 'dark'"
            @change="
              $emit('set-appearance', {
                ...appearance,
                theme: appearance.theme === 'dark' ? 'light' : 'dark',
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.darkTheme }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.switchToDarkTheme
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.googleDrive }}</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="drive.backup"
            @change="
              $emit('set-drive', {
                ...drive,
                backup: !drive.backup,
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.driveBackup }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.backupDeviceWithDrive
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="pt-2">
        <v-list-item-content>
          <v-list-item-title>{{ translations.threshold }}</v-list-item-title>
          <v-list-item-subtitle>
            {{
              replacer(translations.backupEvery, {
                threshold: drive.backupThreshold,
              })
            }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-slider
        :value="drive.backupThreshold"
        :disabled="!drive.backup"
        class="pl-10 pr-10"
        style="-webkit-app-region: no-drag"
        step="10"
        min="50"
        max="200"
        hide-details
        thumb-label
        color="blue darken-2"
        @input="
          (value) => {
            $emit('set-drive', {
              ...drive,
              backupThreshold: value,
            });
          }
        "
      ></v-slider>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.system }}</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="general.startup"
            @change="(value) => $emit('set-startup', value)"
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.runAtStartup }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.startOnSystemStartup
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="general.blur"
            @change="
              $emit('set-general', {
                ...general,
                blur: !general.blur,
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.hideOnBlur }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.appHiddenOnBlur
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>

    <v-list subheader dense two-line color="surfaceVariant">
      <v-subheader>{{ translations.privacyAndSecurity }}</v-subheader>
      <v-list-item link @click="$emit('action', 'clear-data')">
        <v-list-item-action>
          <v-icon>mdi-delete-sweep</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.clearData }} </v-list-item-title>
          <v-list-item-subtitle
            >{{ translations.clearClipboardHistory }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item link @click="$emit('action', 'factory-default')">
        <v-list-item-action>
          <v-icon>mdi-cellphone-erase</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{
            translations.restoreFactoryDefault
          }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.allDataWillBeRestored
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import {
  Appearance,
  Drive,
  General as GeneralSettings,
} from '../../store/types';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { replace } from '@/utils/common';
import { isWindows } from '@/utils/environment';

@Component
export default class General extends Vue {
  @Prop({ required: true })
  public general!: GeneralSettings;
  @Prop({ required: true })
  public drive!: Drive;
  @Prop({ required: true })
  public appearance!: Appearance;
  @Prop({ required: true })
  public translations!: unknown;

  public get replacer(): typeof replace {
    return replace;
  }

  public get isWindows(): boolean {
    return isWindows;
  }
}
</script>

<style scoped lang="scss">
.label ::v-deep .v-label {
  font-size: 0.8rem;
}
</style>
