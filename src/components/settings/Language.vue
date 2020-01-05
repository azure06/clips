<template>
  <v-list width="100%" height="100%">
    <v-subheader>Wakeup on</v-subheader>
    <v-row>
      <v-col cols="12" style="display: flex;">
        <v-text-field
          prepend-inner-icon="mdi-keyboard-settings"
          class="ml-4 mr-8"
          style="max-width: 50px;"
          flat
          solot
          filled
          disabled
          dense
        ></v-text-field>
        <v-text-field
          style="max-width: 40px;"
          class="mr-2"
          flat
          solo
          filled
          disabled
          dense
          value="⌘"
          label="⌘"
        ></v-text-field>
        <v-text-field
          style="max-width: 60px;"
          class="mr-2"
          flat
          solo
          value="shift"
          filled
          label="shift"
          disabled
          dense
        ></v-text-field>
        <v-select
          style="max-width: 100px;"
          flat
          solo
          :items="keys"
          :value="settings.system.shortcut[2]"
          @change="
            (value) =>
              $emit('change-shortcut', [
                settings.system.shortcut[0],
                settings.system.shortcut[1],
                value,
              ])
          "
          filled
          label="key"
          dense
        ></v-select>
      </v-col>
    </v-row>
    <v-subheader>Language</v-subheader>
    <v-row>
      <v-col cols="12" style="display: flex;">
        <v-text-field
          prepend-inner-icon="mdi-web"
          class="ml-4 mr-8"
          style="max-width: 50px;"
          flat
          solo
          filled
          disabled
          dense
        ></v-text-field>
        <v-select
          flat
          solo
          :items="languages"
          :value="settings.system.language"
          @change="
            (value) =>
              $emit('change-settings', {
                ...settings,
                system: { ...settings.system, language: value },
              })
          "
          filled
          style="max-width: 220px;"
          label="Language"
          dense
        ></v-select>
      </v-col>
    </v-row>
  </v-list>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { language } from '@/utils/language';
import { SettingsState } from '@/store/types';

@Component
export default class Shortcuts extends Vue {
  @Prop({ required: true })
  public settings!: SettingsState;
  public keys = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  get languages() {
    return Object.values(language);
  }
}
</script>
