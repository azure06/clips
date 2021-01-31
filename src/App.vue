<template>
  <v-app style="overflow-y: hidden;">
    <NavDrawer :style="dragActive ? '-webkit-app-region: drag' : ''" />
    <!-- Router View -->
    <v-main
      class="mvleft"
      :style="`background: ${$vuetify.theme.currentTheme.background}`"
    >
      <router-view />
    </v-main>
    <!-- Snackbar -->
    <!-- FIXME -1 in version >= 2.3 -->
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card color="surfaceVariant">
        <v-card-title class="subtitle-2">{{ dialogText }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="resolve('close')">
            Close
          </v-btn>
          <v-btn text @click="resolve('once')">
            Once
          </v-btn>
          <v-btn text @click="resolve('always')">
            Always
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- In App Purchase -->
    <v-dialog v-model="inAppStatusDialog" persistent max-width="290">
      <v-card color="surfaceVariant">
        <v-card-title class="subtitle-2">{{
          inAppStatusDialogText
        }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="inAppStatusDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { UserDoc } from './rxdb/user/model';
import { UserUpsert } from './store/network/actions';
import { Component, Vue } from 'vue-property-decorator';
import NavDrawer from '@/components/NavDrawer.vue';
import { onAuthorize, onTransactionsUpdated } from '@/utils/subscription';
import { ipcRenderer } from 'electron';
import { Action, Getter, Mutation } from 'vuex-class';
import {
  concatMap,
  debounceTime,
  delay,
  expand,
  mapTo,
  switchMap,
  tap,
} from 'rxjs/operators';
import { handleTransaction } from './utils/in-app-transaction';
import { Drive, InAppStatus } from './store/types';
import { from, of } from 'rxjs';
import { listGoogleDriveFiles } from './utils/invocation';
import { isSuccessHttp } from './utils/invocation-handler';
import { isAuthenticated } from './utils/common';

@Component<App>({
  components: { NavDrawer },
  subscriptions() {
    return {
      transactions: onTransactionsUpdated.pipe(
        tap((transactions) =>
          handleTransaction((transaction) => {
            switch (transaction.transactionState) {
              case 'purchased':
                this.setPremium(true);
                break;
              case 'failed':
                this.inAppStatusDialog = true;
                this.inAppStatusDialogText = transaction.errorMessage;
                break;
            }
            this.setInAppStatus(transaction.transactionState);
          }, transactions)
        ),
        tap((value) => console.info('transaction:', value))
      ),
      syncWithDrive: this.$watchAsObservable(() => this.drive.syncThreshold, {
        immediate: true,
      }).pipe(
        // Buffer
        debounceTime(5000),
        switchMap(({ newValue }) =>
          of(newValue).pipe(
            expand((millis) =>
              from(
                isAuthenticated()
                  ? listGoogleDriveFiles()
                  : Promise.resolve({ status: 403, message: 'Not authorize' })
              )
                .pipe(
                  concatMap((res) =>
                    isSuccessHttp(res) && res.data && this.drive.sync
                      ? this.retrieveFromDrive({
                          fileIds: Object.values(res.data)
                            .flat()
                            .filter(
                              (value) =>
                                !value.removed &&
                                !!value.fileId &&
                                value.file?.name === 'clips.json'
                            )
                            .map((value) => value.fileId) as string[],
                        })
                      : Promise.resolve()
                  )
                )
                .pipe(delay(millis))
                .pipe(mapTo(millis))
            )
          )
        )
      ),
    };
  },
})
export default class App extends Vue {
  @Getter('drive', { namespace: 'configuration' })
  public drive!: Drive;
  @Action('retrieveFromDrive', { namespace: 'clips' })
  public retrieveFromDrive!: (args: {
    fileIds: string[];
    force?: boolean;
  }) => Promise<unknown>;
  @Action('upsertUser', { namespace: 'network' })
  public upsertUser!: (device: UserUpsert) => Promise<UserDoc>;
  @Mutation('setInAppStatus', { namespace: 'configuration' })
  public setInAppStatus!: (status: InAppStatus) => void;
  @Mutation('setPremium', { namespace: 'configuration' })
  public setPremium!: (status: boolean) => void;

  public dialog = false;
  public dialogText = 'Accept the invitation from';

  public inAppStatusDialog = false;
  public inAppStatusDialogText = 'Something went wrong';
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public resolve: (args: 'close' | 'once' | 'always') => void = () => {};

  get dragActive(): boolean {
    switch (this.$route.name) {
      case 'general-settings':
        return false;
      case 'advanced-settings':
        return false;
      case 'language-settings':
        return false;
      default:
        return true;
    }
  }

  public created(): void {
    // Authorize
    this.$subscribeTo(onAuthorize, async (device) => {
      const user = await this.upsertUser({ device });
      if (user.permission === 'always') {
        ipcRenderer.send(`authorize:${user.id}`, true);
      } else if (user.permission === 'once') {
        this.dialogText = `Accept the invitation from ${user.username}`;
        // If pending actions just close the previous dialog
        await this.resolve('close');
        this.dialog = true;
        const result = await new Promise<'close' | 'once' | 'always'>(
          (resolve) => {
            this.resolve = resolve;
          }
        );
        switch (result) {
          case 'close':
            ipcRenderer.send(`authorize:${user.id}`, false);
            await this.upsertUser({
              ...user,
              device: { ...user.device, username: user.username },
            });
            break;
          case 'once':
            ipcRenderer.send(`authorize:${user.id}`, true);
            await this.upsertUser({
              ...user,
              device: { ...user.device, username: user.username },
            });
            break;
          case 'always':
            ipcRenderer.send(`authorize:${user.id}`, true);
            await this.upsertUser({
              ...user,
              device: { ...user.device, username: user.username },
              permission: 'always',
            });
            break;
        }
      }
      this.dialog = false;
    });
  }
}
</script>

<style scoped lang="scss">
$drawer-width: 64px;
.mvleft {
  padding-left: $drawer-width !important;
}
</style>
