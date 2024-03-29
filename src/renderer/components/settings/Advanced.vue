<template>
  <v-card color="surfaceVariant" tile flat :height="`calc(100vh - 30px)`">
    <v-list v-if="!premium" subheader dense color="surfaceVariant">
      <v-progress-linear
        v-if="fetching"
        indeterminate
        color="cyan darken-2"
      ></v-progress-linear>
      <v-subheader class="font-weight-bold">Premium features</v-subheader>
      <v-card flat class="px-0" color="transparent">
        <v-row v-if="isMas" justify="center">
          <v-card
            color="blue darken-3"
            class="ma-2"
            min-width="200"
            width="300"
            dark
            elevation="12"
            max-height="calc(100vh - 125px)"
          >
            <v-card-title class="subtitle-2 font-weight-bold">
              Free
            </v-card-title>
            <v-card-subtitle class="overline">
              Clips Community Edition
            </v-card-subtitle>
            <div style="max-height: calc(100vh - 240px); overflow-y: scroll">
              <v-card color="blue darken-4" flat tile>
                <h4 class="text-center display-3 py-6 font-weight-medium">
                  {{ product ? product.formattedPrice.charAt(0) + 0 : 0 }}
                </h4>
              </v-card>
              <v-card-text>
                <div class="pa-1">
                  <v-icon color="blue"> mdi-check </v-icon> Search
                </div>
                <div class="pa-1">
                  <v-icon color="blue"> </v-icon>
                </div>
                <v-divider class="my-2"> </v-divider>
                <div class="pa-1">
                  <v-icon color="blue"> mdi-check </v-icon> Labels
                </div>
                <v-divider class="my-2"> </v-divider>
                <div class="pa-1">
                  <v-icon color="blue"> mdi-check </v-icon> Google Drive Backup
                </div>
              </v-card-text>
            </div>
          </v-card>
          <v-card
            class="ma-2 card"
            min-width="200"
            width="300"
            elevation="12"
            dark
            max-height="calc(100vh - 130px)"
          >
            <v-card-title class="subtitle-2 font-weight-bold">
              Premium
            </v-card-title>
            <v-card-subtitle class="overline">
              Clips Premium Edition
            </v-card-subtitle>
            <div style="max-height: calc(100vh - 300px); overflow-y: scroll">
              <v-card color="grey darken-4" flat tile>
                <h4 class="text-center display-3 py-6 font-weight-medium">
                  {{ product ? product.formattedPrice : undefined }}
                </h4>
              </v-card>
              <v-card-text>
                <div>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Search
                  </div>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Advanced Search
                  </div>
                  <v-divider class="my-2"> </v-divider>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Labels
                  </div>
                  <v-divider class="my-2"> </v-divider>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Google Drive
                    Backup
                  </div>
                  <v-divider class="my-2"> </v-divider>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Save RTF and HTML
                    Text
                  </div>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Google Drive Auto
                    Sync
                  </div>
                  <div class="pa-1">
                    <v-icon color="blue"> mdi-check </v-icon> Autmatic History
                    Cleanup
                  </div>
                </div>
              </v-card-text>
            </div>
            <v-card-actions class="d-flex justify-center">
              <v-btn
                text
                class="ma-2"
                @click="purchase"
                :disabled="purchaseDisabled"
              >
                Purchase
              </v-btn>
            </v-card-actions>
            <p
              @click="restoreCompletedTransaction"
              style="position: relative; bottom: 10px; cursor: pointer"
              class="text-center caption text-decoration-underline"
            >
              Already purchased?
            </p>
          </v-card>
        </v-row>
        <div v-else>
          <v-subheader>
            <div>
              Please provide your purchase email address. An OTP verification
              code will be sent to your email address. Copy the OTP code from
              the email into the corresponding dialog. Then, click the “Submit”
              button. You can find more information at
              <a @click.prevent="openLink('https://infiniticlips.com')">
                inifniticlips.com
              </a>
            </div>
          </v-subheader>
          <v-text-field
            prepend-inner-icon="mdi-email-outline"
            label="Insert your email address"
            outlined
            @change="(value) => $emit('change-email', value)"
            dense
            style="margin: 15px 15px 0 0"
            color="blue darken-2"
          >
          </v-text-field>
          <v-card-actions>
            <v-spacer />
            <v-btn
              style="margin: 0 15px 0 0"
              color="blue darken-2"
              dark
              depressed
              @click="$emit('activate-premium', email)"
            >
              Activate
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-list>
    <v-list v-else subheader dense color="surfaceVariant">
      <v-subheader>{{ translations.searchType }}</v-subheader>
      <v-list-item>
        <v-radio-group :value="advanced.searchMode" :mandatory="true" dense>
          <v-radio
            color="blue darken-2"
            class="caption label"
            :label="translations.accurateSearch"
            @change="
              $emit('set-advanced', {
                ...advanced,
                searchMode: 'accurate',
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
              $emit('set-advanced', {
                ...advanced,
                searchMode: 'fuzzy',
              })
            "
          ></v-radio>
          <v-radio
            color="blue darken-2"
            class="caption label"
            :label="translations.advancedFuzzySearch"
            value="advanced-fuzzy"
            @change="
              $emit('set-advanced', {
                ...advanced,
                searchMode: 'advanced-fuzzy',
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
              :input-value="advanced.formats.plainText"
              @change="
                $emit('set-advanced', {
                  ...advanced,
                  formats: {
                    ...advanced.formats,
                    plainText: !advanced.formats.plainText,
                  },
                })
              "
            ></v-checkbox>
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              :label="translations.pictures"
              :input-value="advanced.formats.dataURI"
              @change="
                $emit('set-advanced', {
                  ...advanced,
                  formats: {
                    ...advanced.formats,
                    dataURI: !advanced.formats.dataURI,
                  },
                })
              "
            ></v-checkbox>
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              :label="translations.richText"
              :input-value="advanced.formats.richText"
              @change="
                $emit('set-advanced', {
                  ...advanced,
                  formats: {
                    ...advanced.formats,
                    richText: !advanced.formats.richText,
                  },
                })
              "
            ></v-checkbox>
            <v-checkbox
              color="blue darken-2"
              dense
              hide-details
              :label="translations.htmlText"
              :input-value="advanced.formats.htmlText"
              @change="
                $emit('set-advanced', {
                  ...advanced,
                  formats: {
                    ...advanced.formats,
                    htmlText: !advanced.formats.htmlText,
                  },
                })
              "
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-list-item>
      <v-divider></v-divider>

      <!-- Editor -->
      <v-subheader>{{ translations.executeCommandOn }}</v-subheader>
      <v-list-item>
        <v-row
          v-for="(command, index) in commands"
          :key="`clips-command-${index}`"
        >
          <!-- Trigger -->
          <!-- <v-col class="label">
            <v-select
              :items="['None', 'Copy Event']"
              :value="command[0]"
              @change="
                (event) =>
                  $emit('set-advanced', {
                    ...advanced,
                    commands: advanced.commands.map((command, i) => {
                      return index === i
                        ? (() => {
                            const [z, a, b, c, d] = command;
                            switch (event) {
                              case 'None':
                                return ['none', a, b, c, d];
                              case 'Copy Event':
                                return ['copy-event', a, b, c, d];
                            }
                          })()
                        : value;
                    }),
                  })
              "
              filled
              label="Trigger"
              dense
              background-color="background"
              item-color="blue"
            ></v-select>
          </v-col> -->
          <!--  Command: open/ start/ code -->
          <v-col class="label">
            <v-combobox
              :items="isWindows ? ['start', 'code'] : ['open', 'code']"
              :value="command[1]"
              @change="
                (event) =>
                  $emit('set-advanced', {
                    ...advanced,
                    commands: advanced.commands.map((command, i) => {
                      return index === i
                        ? (() => {
                            const [z, _, b, c, d] = command;
                            return [z, event, b, c, d];
                          })()
                        : value;
                    }),
                  })
              "
              filled
              label="Command"
              dense
              background-color="background"
              item-color="blue"
            ></v-combobox>
          </v-col>
          <v-col class="label">
            <!-- ['File Location', 'Value'] -->
            <v-select
              :items="['File Location']"
              :value="command[2]"
              @change="
                (event) =>
                  $emit('set-advanced', {
                    ...advanced,
                    commands: advanced.commands.map((command, i) => {
                      return index === i
                        ? (() => {
                            const [z, a, _, c, d] = command;
                            switch (event) {
                              case 'File Location':
                                return [z, a, 'file-location', c, d];
                              case 'Value':
                                return [z, a, 'value', c, d];
                            }
                          })()
                        : value;
                    }),
                  })
              "
              filled
              label="Args"
              dense
              background-color="background"
              item-color="blue"
            ></v-select>
          </v-col>
          <v-col class="label">
            <v-select
              :items="[
                'All',
                'Text',
                'JSON',
                'HTML',
                'Rich Text Format',
                'Picture',
              ]"
              :value="command[3]"
              @change="
                (event) =>
                  $emit('set-advanced', {
                    ...advanced,
                    commands: advanced.commands.map((command, i) => {
                      return index === i
                        ? (() => {
                            const [z, a, b, _, d] = command;
                            switch (event) {
                              case 'All':
                                return [z, a, b, 'all', d];
                              case 'Text':
                                return [z, a, b, 'text', d];
                              case 'JSON':
                                return [z, a, b, 'json', d];
                              case 'HTML':
                                return [z, a, b, 'html', d];
                              case 'Rich Text Format':
                                return [z, a, b, 'rtf', d];
                              case 'Picture':
                                return [z, a, b, 'picture', d];
                            }
                          })()
                        : value;
                    }),
                  })
              "
              filled
              label="Type"
              dense
              background-color="background"
              item-color="blue"
            ></v-select>
          </v-col>
          <!-- Commented Out Result of Open with Editor -->
          <!-- <v-col class="label">
            <v-select
              :items="['None', 'Add New Entry', 'Replace Entry', 'Pop-up']"
              :value="command[4]"
              @change="
                (event) =>
                  $emit('set-advanced', {
                    ...advanced,
                    commands: advanced.commands.map((command, i) => {
                      return index === i
                        ? (() => {
                            const [z, a, b, c, _] = command;
                            switch (event) {
                              case 'None':
                                return [z, a, b, c, 'none'];
                              case 'Add New Entry':
                                return [z, a, b, c, 'new-entry'];
                              case 'Replace Entry':
                                return [z, a, b, c, 'replace-entry'];
                              case 'Pop-up':
                                return [z, a, b, c, 'popup'];
                            }
                          })()
                        : value;
                    }),
                  })
              "
              filled
              label="Result"
              dense
              background-color="background"
              item-color="blue"
            ></v-select>
          </v-col> -->
        </v-row>
      </v-list-item>
      <v-divider></v-divider>
      <v-subheader>{{ translations.googleDrive }}</v-subheader>
      <v-list-item>
        <v-list-item-action>
          <v-switch
            :input-value="drive.sync"
            @change="
              $emit('set-drive', {
                ...drive,
                sync: !drive.sync,
              })
            "
            dense
            color="blue darken-2"
          ></v-switch>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ translations.driveSync }}</v-list-item-title>
          <v-list-item-subtitle>{{
            translations.syncDeviceWithDrive
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="pt-2">
        <v-list-item-content>
          <v-list-item-title>{{ translations.threshold }}</v-list-item-title>
          <v-list-item-subtitle>
            {{
              replacer(translations.syncEvery, {
                threshold: scheduleSync,
              })
            }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-slider
        :value="scheduleSync"
        :disabled="!drive.sync"
        class="pl-10 pr-10"
        style="-webkit-app-region: no-drag"
        step="1"
        min="1"
        max="48"
        hide-details
        thumb-label
        color="blue darken-2"
        @input="
          (value) => {
            $emit('set-drive', {
              ...drive,
              syncThreshold: value * hourInMillis,
            });
          }
        "
      ></v-slider>
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
              $emit('set-advanced', {
                ...advanced,
                optimize: toMillis(event),
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
  </v-card>
</template>

<script lang="ts">
import { Product, shell } from 'electron';
import { Component, Prop, Vue } from 'vue-property-decorator';

import * as paymentsInvokers from '@/renderer/invokers/payments';
import { Translation } from '@/renderer/utils/translations/types';
import { replace } from '@/utils/common';
import { always, whenMas, whenWindows } from '@/utils/environment';
import { Result__ } from '@/utils/result';

import {
  Advanced as AdvancedSetting,
  Drive,
  InAppStatus,
} from '../../store/types';

type Cycle = {
  oneHour: string;
  twentyfourHours: string;
  sevenDays: string;
  fourWeeks: string;
  never: string;
};

@Component
export default class Advanced extends Vue {
  @Prop({ required: true })
  public advanced!: AdvancedSetting;
  @Prop({ required: true })
  public drive!: Drive;
  @Prop({ required: true })
  public products!: Product[];
  @Prop({ required: true })
  public inAppStatus!: InAppStatus;
  @Prop({ required: true })
  public translations!: Translation;
  @Prop({ required: true })
  public premium!: boolean;
  @Prop({ required: true })
  public fetching!: boolean;
  @Prop({ required: true })
  public email!: string;

  public get replacer(): typeof replace {
    return replace;
  }

  public get hourInMillis(): number {
    return 3600000;
  }

  public get product(): Product | undefined {
    return this.products.length > 0 ? this.products[0] : undefined;
  }

  public get purchaseDisabled(): boolean {
    return (
      this.inAppStatus === 'pre-purchasing' ||
      this.inAppStatus === 'purchasing' ||
      this.inAppStatus === 'purchased' ||
      this.inAppStatus === 'deferred' ||
      this.inAppStatus === 'restored'
    );
  }

  get isMas(): boolean {
    return whenMas(always(true), always(false));
  }

  get isWindows(): boolean {
    return whenWindows(always(true), always(false));
  }

  public openLink(link: string): void {
    shell.openExternal(link);
  }

  public get commands() {
    return this.advanced.commands.map((command) => [
      (() => {
        switch (command[0]) {
          case 'none':
            return 'None' as const;
          case 'copy-event':
            return 'Copy Event' as const;
        }
      })(),
      command[1],
      (() => {
        switch (command[2]) {
          case 'file-location':
            return 'File Location' as const;
          case 'value':
            return 'Value' as const;
        }
      })(),
      (() => {
        switch (command[3]) {
          case 'all':
            return 'All' as const;
          case 'text':
            return 'Text' as const;
          case 'json':
            return 'JSON' as const;
          case 'html':
            return 'HTML' as const;
          case 'rtf':
            return 'Rich Text Format' as const;
          case 'picture':
            return 'Picture' as const;
        }
      })(),
      (() => {
        switch (command[4]) {
          case 'none':
            return 'None' as const;
          case 'new-entry':
            return 'Add New Entry' as const;
          case 'replace-entry':
            return 'Replace Entry' as const;
          case 'popup':
            return 'Pop-up' as const;
        }
      })(),
    ]);
  }

  public get scheduleSync(): number {
    const { syncThreshold } = this.drive;
    return syncThreshold / this.hourInMillis;
  }

  public get schedule(): string {
    const { optimize } = this.advanced;
    switch (optimize) {
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

  public toMillis(item: string): number {
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
        return 0;
    }
  }

  public get cycle(): Cycle {
    return {
      oneHour: this.translations.oneHour,
      twentyfourHours: this.translations.twentyFourHours,
      sevenDays: this.translations.sevenDays,
      fourWeeks: this.translations.fourWeeks,
      never: this.translations.never,
    };
  }

  public restoreCompletedTransaction(): Promise<Result__<void>> {
    return paymentsInvokers.restoreCompletedTransactions();
  }

  public async purchase(): Promise<void> {
    if (this.product && (await paymentsInvokers.canMakePayments())) {
      this.$emit('set-in-app-status', 'pre-purchasing');
      paymentsInvokers.purchaseProduct(this.product);
    } else console.error('Something went wrong');
  }
}
</script>

<style scoped lang="scss">
.label ::v-deep .v-label {
  font-size: 0.8rem;
}
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: scale(1.05);
}
</style>
