<template>
  <div>
    <v-list v-if="!premium" subheader dense color="surfaceVariant">
      <v-progress-linear
        v-if="fetching"
        indeterminate
        color="cyan darken-2"
      ></v-progress-linear>
      <v-subheader class="font-weight-bold">Premium features</v-subheader>
      <v-card flat class="px-6" color="transparent">
        <v-form>
          <v-subheader>
            Please provide a license key. If you don't have a license key you
            can find more information at inifniticlips.com
          </v-subheader>

          <v-text-field
            prepend-inner-icon="mdi-numeric"
            label="Insert your code"
            outlined
            @change="(value) => $emit('change-licensekey', value)"
            dense
            color="blue darken-2"
          >
          </v-text-field>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-2"
              dark
              depressed
              @click="$emit('activate-premium', licenseKey)"
            >
              Activate
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-list>
    <v-list v-else subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.searchType }}</v-subheader>
      <v-list-item>
        <v-radio-group
          :value="settings.storage.search.type"
          :mandatory="true"
          dense
        >
          <v-radio
            color="blue darken-2"
            class="caption label"
            :label="translations.accurateSearch"
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
            value="fuzzy"
            :label="translations.fuzzySearch"
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
            :label="translations.advancedFuzzySearch"
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
      <v-subheader>{{ translations.saveFollowingFormats }}</v-subheader>
      <v-list-item>
        <v-row>
          <v-col class="pb-10 pt-0 label">
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              :label="translations.text"
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
              :label="translations.pictures"
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
              :label="translations.richText"
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
              :label="translations.htmlText"
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
      <v-subheader>{{ translations.automaticCleanup }}</v-subheader>
      <v-subheader class="pt-2 pl-4" style="height: unset">{{
        translations.cleanupDesc1
      }}</v-subheader>
      <v-subheader class="pl-4" style="height: unset">{{
        translations.cleanupDesc2
      }}</v-subheader>
      <v-subheader class="pl-4" style="height: unset">{{
        translations.cleanupDesc3
      }}</v-subheader>
      <v-subheader class="pl-4" style="height: unset">
        {{ translations.cleanupDesc4 }}
      </v-subheader>
      <v-subheader class="pt-2 pb-2" style="height: unset">{{
        translations.removeUnusedItemsOlderThen
      }}</v-subheader>
      <v-list-item>
        <v-select
          :items="Object.values(cycle)"
          :value="schedule"
          @change="
            (event) =>
              $emit('change-settings', {
                ...settings,
                storage: {
                  ...settings.storage,
                  optimize: { every: toMillis(event) },
                },
              })
          "
          filled
          label="Cycle"
          dense
          background-color="background"
          item-color="blue"
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
import { shell } from 'electron';

@Component
export default class General extends Vue {
  @Prop({ required: true })
  public settings!: SettingsState;
  @Prop({ required: true })
  public translations!: any;
  @Prop({ required: true })
  public premium!: boolean;
  @Prop({ required: true })
  public fetching!: boolean;
  @Prop({ required: true })
  public licenseKey!: string;

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
      oneHour: this.translations.oneHour,
      twentyfourHours: this.translations.twentyFourHours,
      sevenDays: this.translations.sevenDays,
      fourWeeks: this.translations.fourWeeks,
      never: this.translations.never,
    };
  }
}
</script>

<style scoped lang="scss">
.label ::v-deep .v-label {
  font-size: 0.8rem;
}
</style>
