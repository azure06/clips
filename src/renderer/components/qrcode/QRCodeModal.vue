<template>
  <div class="text-center">
    <v-dialog
      :value="qrCodeModalObs[0] === 'open'"
      width="auto"
      @input="(value) => $emit('input', ['close'])"
    >
      <!-- <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props"> Open Dialog </v-btn>
      </template> -->

      <v-card color="surfaceVariant">
        <v-card-title>Scan QR Code</v-card-title>
        <v-card-text>
          <div class="pa-2">
            <div class="d-flex justify-center">
              <div
                class="pa-2"
                style="background-color: rgba(255, 255, 255, 0.95)"
              >
                <qr-code
                  v-if="qrCodeModalObs[0] === 'open'"
                  :size="qrCodeModalObs[1]"
                  :text="qrCodeModalObs[2]"
                  color="#263030"
                ></qr-code>
              </div>
            </div>
            <!-- <v-slider
              v-if="qrCodeModalObs[0] === 'open'"
              :value="qrCodeModalObs[1]"
              @change="
                (value) =>
                  $emit('input', [qrCodeModalObs[0], value, qrCodeModalObs[2]])
              "
              class="pl-10 pr-10"
              step="50"
              min="50"
              max="1000"
              hide-details
              thumb-label
              color="blue-grey darken-1"
            ></v-slider> -->
            <div class="d-flex flex-column align-center caption">
              <!-- <div class="font-weight-light" style="font-size: 0.7rem">
                QR Code size
              </div> -->
              <div class="pt-4 d-flex flex-column align-center">
                <div>
                  Please utilize any available mobile application to scan the QR
                  code.
                </div>
                <div>
                  ・<strong>QR Code</strong> is a registered trademark of
                  <strong>Denso Wave </strong>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { concatMap, delay, map, of, startWith } from 'rxjs';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component<QRCodeModal>({
  subscriptions() {
    return {
      qrCodeModalObs: this.$watchAsObservable(() => this.qrcodeModal).pipe(
        map(({ newValue }) => newValue),
        concatMap((value) => of(value).pipe(startWith(['closed']))),
        delay(100),
        startWith(['closed'])
      ),
    };
  },
})
export default class QRCodeModal extends Vue {
  @Prop({ required: true, default: ['closed'] })
  public qrcodeModal!: ['closed'] | ['open', number, string];
}
</script>
