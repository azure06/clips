<template>
  <v-card
    color="surfaceVariant"
    tile
    flat
    height="calc(100vh - 30px)"
    style="overflow-x: hidden"
  >
    <v-list color="surfaceVariant">
      <v-subheader>{{ translations.wakeOn }}</v-subheader>
      <v-row>
        <v-col cols="12" style="display: flex;">
          <v-text-field
            prepend-inner-icon="mdi-keyboard-settings"
            class="ml-4 mr-8"
            style="max-width: 50px;"
            background-color="background"
            flat
            solot
            filled
            disabled
            dense
          ></v-text-field>
          <v-text-field
            :style="`max-width: ${isMacOS ? 40 : 60}px;`"
            class="mr-2"
            background-color="background"
            flat
            solo
            filled
            disabled
            dense
            :value="key1"
            :label="key1"
          ></v-text-field>
          <v-text-field
            style="max-width: 60px;"
            class="mr-2"
            background-color="background"
            flat
            solo
            filled
            :value="key2"
            :label="key2"
            disabled
            dense
          ></v-text-field>
          <v-select
            style="max-width: 100px;"
            background-color="background"
            flat
            solo
            :items="keys"
            :value="advanced.shortcut[2]"
            @change="
              (value) =>
                $emit('set-shortcut', [
                  advanced.shortcut[0],
                  advanced.shortcut[1],
                  value,
                ])
            "
            filled
            label="key"
            item-color="blue darken-2"
            dense
          ></v-select>
        </v-col>
      </v-row>
      <v-subheader>{{ translations.language }}</v-subheader>
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
            background-color="background"
          ></v-text-field>
          <v-select
            flat
            solo
            :items="languages"
            :value="advanced.language"
            @change="
              (value) => $emit('set-advanced', { ...advanced, language: value })
            "
            filled
            style="max-width: 220px;"
            label="Language"
            item-color="blue darken-2"
            background-color="background"
            dense
          ></v-select>
        </v-col>
      </v-row>
    </v-list>
  </v-card>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Prop } from 'vue-property-decorator';
import { language } from '@/utils/common';
import { Advanced } from '@/store/types';
import { always, whenMacOS } from '@/utils/environment';

@Component
export default class Shortcuts extends Vue {
  @Prop({ required: true })
  public translations!: unknown;
  @Prop({ required: true })
  public advanced!: Advanced;
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

  get isMacOS(): boolean {
    return whenMacOS(always(true), always(false));
  }

  get key1(): '⌘' | 'Ctrl' {
    return this.isMacOS ? '⌘' : 'Ctrl';
  }

  get key2(): 'shift' | 'Alt' {
    return this.isMacOS ? 'shift' : 'Alt';
  }

  get languages(): string[] {
    return Object.values(language);
  }
}
</script>
