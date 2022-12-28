<template>
  <div class="ma-0 pa-0">
    <!-- Rooter -->
    <div class="content">
      <router-view
        :translations="$translations"
        :general="general"
        :advanced="advanced"
        :drive="drive"
        :appearance="appearance"
        :premium="premium"
        :in-app-status="inAppStatus"
        :email="email"
        :fetching="fetching"
        :products="products"
        @set-general="setGeneral"
        @set-drive="setDrive"
        @set-appearance="
          (payload) => setAppearance({ ...payload, vuetify: $vuetify })
        "
        @set-advanced="setAdvanced"
        @set-shortcut="setShortcut"
        @set-startup="setStartup"
        @set-skip-taskbar="setSkipTaskbar"
        @set-in-app-status="setInAppStatus"
        @action="openDialog"
        @change-email="(value) => (email = value)"
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

    <!-- OTP Dialog -->
    <v-dialog
      v-model="dialogOTP"
      persistent
      max-width="420"
      style="z-index: 10000"
    >
      <v-card>
        <v-card-title class="headline">
          Insert the OTP verification Code
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="otpCode"
            prepend-inner-icon="mdi-numeric"
            label="OTP CODE"
            outlined
            dense
            style="margin: 15px 0"
            color="blue darken-2"
        /></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="dialogOTP = false">
            Close
          </v-btn>
          <v-btn
            color="primary darken-1"
            :disabled="activateOTP"
            text
            @click="activateOTP = true"
          >
            Activate
          </v-btn>
        </v-card-actions>
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
</template>

<script lang="ts">
import { Product } from 'electron';
import { Component } from 'vue-property-decorator';
import { Action, Mutation } from 'vuex-class';

import * as paymentsInvokers from '@/renderer/invokers/payments';
import { InAppStatus } from '@/renderer/store/types';
import { ExtendedVue } from '@/renderer/utils/basevue';
import {
  activatePremium,
  createActivationCode,
} from '@/renderer/utils/firebase';
import { always, whenMacOS } from '@/utils/environment';
import { Result__, isSuccess } from '@/utils/result';

@Component
export default class Settings extends ExtendedVue {
  @Mutation('restoreSettings', { namespace: 'configuration' })
  public restoreSettings!: () => void;
  @Mutation('setGeneral', { namespace: 'configuration' })
  public setGeneral!: (arg: unknown) => void;
  @Mutation('setAdvanced', { namespace: 'configuration' })
  public setAdvanced!: (arg: unknown) => void;
  @Mutation('setDrive', { namespace: 'configuration' })
  public setDrive!: (arg: unknown) => void;
  @Mutation('setAppearance', { namespace: 'configuration' })
  public setAppearance!: (arg: unknown) => void;
  @Mutation('setPremium', { namespace: 'configuration' })
  public setPremium!: (arg: boolean) => void;
  @Mutation('setInAppStatus', { namespace: 'configuration' })
  public setInAppStatus!: (payload: InAppStatus) => void;
  @Action('setShortcut', { namespace: 'configuration' })
  public setShortcut!: (payload: unknown) => Promise<void>;
  @Action('setStartup', { namespace: 'configuration' })
  public setStartup!: (payload: boolean) => Promise<void>;
  @Action('setSkipTaskbar', { namespace: 'configuration' })
  public setSkipTaskbar!: (payload: boolean) => Promise<void>;
  @Action('relaunchApp', { namespace: 'configuration' })
  public relaunchApp!: () => Promise<Result__<void>>;
  @Action('restoreFactoryDefault', { namespace: 'clips' })
  public restoreFactoryDefault!: () => Promise<Result__<void>>;
  public dialog = false;
  public dialog_ = false;
  public dialogOTP = false;
  public activateOTP = false;
  public otpCode = '';
  public action?: 'clear-data' | 'factory-default';
  public email = '';
  public fetching = false;
  public errorDialog = false;
  public products: Product[] = [];

  public async created(): Promise<void> {
    whenMacOS(async () => {
      const response = await paymentsInvokers.getProducts();
      this.products = isSuccess(response) ? response.data : [];
    }, always(Promise.resolve()));
  }

  public get isMacOS(): boolean {
    return whenMacOS(always(true), always(false));
  }

  public onClose(): void {
    this.dialog = false;
    this.$nextTick(() => this.$router.push({ name: 'home' }));
  }

  public async activatePremium(email: string): Promise<void> {
    if (email.trim() === '') return;
    this.fetching = true;
    await Promise.all([
      createActivationCode(email.trim()),
      Promise.resolve((this.dialogOTP = true)).then(
        () =>
          new Promise<void | Response>((resolve, reject) => {
            const timeout = setInterval(() => {
              if (!this.dialogOTP) {
                clearInterval(timeout);
                resolve();
              } else if (this.activateOTP) {
                clearInterval(timeout);
                this.otpCode === ''
                  ? reject()
                  : resolve(activatePremium(this.otpCode));
              }
            }, 1000);
          })
      ),
    ])
      .then(([, response]) => {
        return response
          ? response
              .text()
              .then((body) => JSON.parse(body))
              .then(({ valid }) => {
                this.errorDialog = !valid;
                this.setPremium(valid);
              })
          : Promise.resolve();
      })
      .catch((error) => console.error(error));

    this.fetching = false;
    this.dialogOTP = false;
    this.otpCode = '';
  }

  public async openDialog(
    action: 'clear-data' | 'factory-default'
  ): Promise<void> {
    this.dialog_ = true;
    const response = confirm(this.$translations.youWantToContinue);
    response
      ? await this.restoreFactoryDefault().then(async (res) => {
          if (isSuccess(res) && action === 'factory-default') {
            await this.restoreSettings();
            await this.relaunchApp();
          }
        })
      : await Promise.resolve();
    this.dialog_ = false;
  }

  public mounted(): void {
    this.dialog = true;
  }
}
</script>

<style scoped lang="scss">
.content {
  width: 100%;
  height: calc(100vh - 30px);
  overflow: auto;
}
</style>
