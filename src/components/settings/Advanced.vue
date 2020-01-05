<template>
  <div>
    <v-list subheader dense>
      <v-subheader>Search type</v-subheader>
      <v-list-item>
        <v-radio-group :value="settings.storage.search.type" :mandatory="true" dense>
          <v-radio
            color="blue darken-2"
            class="caption label"
            label="Accurate search (Fast)"
            @change="
              $emit('change-settings', {
                ...settings,
                storage: {
                  ...settings.storage,
                  search: { type: 'accurate' },
                },
              })
            "
            value="accurate"
          ></v-radio>
          <v-radio
            color="blue darken-2"
            class="caption label"
            label="Fuzzy search"
            value="fuzzy"
            @change="
              $emit('change-settings', {
                ...settings,
                storage: {
                  ...settings.storage,
                  search: { type: 'fuzzy' },
                },
              })
            "
          ></v-radio>
          <v-radio
            color="blue darken-2"
            class="caption label"
            label="Advanced Fuzzy search (Slow)"
            value="advanced-fuzzy"
            @change="
              $emit('change-settings', {
                ...settings,
                storage: {
                  ...settings.storage,
                  search: { type: 'advanced-fuzzy' },
                },
              })
            "
          ></v-radio>
        </v-radio-group>
      </v-list-item>
      <v-divider></v-divider>
      <v-subheader>Save following formats from clipboard</v-subheader>
      <v-list-item>
        <v-row>
          <v-col class="pb-10 pt-0 label">
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              label="Text"
              :input-value="settings.storage.formats.plainText"
              @change="
                $emit('change-settings', {
                  ...settings,
                  storage: {
                    ...settings.storage,
                    formats: {
                      ...settings.storage.formats,
                      plainText: !settings.storage.formats.plainText,
                    },
                  },
                })
              "
            ></v-checkbox>
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              label="Pictures"
              :input-value="settings.storage.formats.dataURI"
              @change="
                $emit('change-settings', {
                  ...settings,
                  storage: {
                    ...settings.storage,
                    formats: {
                      ...settings.storage.formats,
                      dataURI: !settings.storage.formats.dataURI,
                    },
                  },
                })
              "
            ></v-checkbox>
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              label="Rich Text"
              :input-value="settings.storage.formats.richText"
              @change="
                $emit('change-settings', {
                  ...settings,
                  storage: {
                    ...settings.storage,
                    formats: {
                      ...settings.storage.formats,
                      richText: !settings.storage.formats.richText,
                    },
                  },
                })
              "
            ></v-checkbox>
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              label="Html Text"
              :input-value="settings.storage.formats.htmlText"
              @change="
                $emit('change-settings', {
                  ...settings,
                  storage: {
                    ...settings.storage,
                    formats: {
                      ...settings.storage.formats,
                      htmlText: !settings.storage.formats.htmlText,
                    },
                  },
                })
              "
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-list-item>
      <v-divider></v-divider>
      <v-subheader>Automatic Cleanup</v-subheader>
      <v-subheader
        class="pt-2 pl-4"
        style="height: unset"
      >・Automatically remove unused items from DB</v-subheader>
      <v-subheader class="pl-4" style="height: unset">・Starred items will be ignored</v-subheader>
      <v-subheader class="pl-4" style="height: unset">・Helps to improve search performance</v-subheader>
      <v-subheader class="pl-4" style="height: unset">
        ・[Attention] This is based on your system Date/Time configuration. Changes in your
        configuration might give unexpected results.
      </v-subheader>
      <v-subheader class="pt-2 pb-2" style="height: unset">Remove unused items older then:</v-subheader>
      <v-list-item>
        <v-select
          :items="Object.values(cycle)"
          :value="schedule"
          @change="
            (event) =>
              $emit('change-settings', {
                ...settings,
                storage: { ...settings.storage, optimize: { every: toMillis(event) } },
              })
          "
          filled
          label="Cycle"
          dense
        ></v-select>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue, Mixins, Prop } from 'vue-property-decorator';
import { SettingsState } from '../../store/types';
import { of } from 'rxjs';

@Component
export default class General extends Vue {
  @Prop({ required: true })
  public settings!: SettingsState;

  public get hourInMillis() {
    return 3600000;
  }

  public get schedule() {
    const { every } = this.settings.storage.optimize;
    switch (every) {
      case 0:
        return this.cycle.never;
      case this.hourInMillis:
        return this.cycle.oneHour;
      case this.hourInMillis * 24:
        return this.cycle.twentyfourHours;
      case this.hourInMillis * 24 * 7:
        return this.cycle.sevenDays;
      case this.hourInMillis * 24 * 7 * 4:
        return this.cycle.fourWeeks;
      default:
        return this.cycle.never;
    }
  }

  public toMillis(item: string) {
    switch (item) {
      case this.cycle.never:
        return 0;
      case this.cycle.oneHour:
        return this.hourInMillis;
      case this.cycle.twentyfourHours:
        return this.hourInMillis * 24;
      case this.cycle.sevenDays:
        return this.hourInMillis * 24 * 7;
      case this.cycle.fourWeeks:
        return this.hourInMillis * 24 * 7 * 4;
      default:
        return this.cycle.never;
    }
  }

  public get cycle() {
    return {
      oneHour: '1 hour',
      twentyfourHours: '24 hours',
      sevenDays: '7 days',
      fourWeeks: '4 weeks',
      never: 'Never',
    };
  }
}
</script>

<style scoped lang="scss">
.label ::v-deep .v-label {
  font-size: 0.8rem;
}
</style>
