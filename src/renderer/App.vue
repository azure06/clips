<template>
  <v-app style="overflow-y: hidden">
    <AppBar />
    <NavDrawer v-if="isDefaultDrawer" style="-webkit-app-region: drag" />
    <NavDrawerConfig v-else style="-webkit-app-region: drag" />
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
          <v-btn text @click="resolve('close')"> Close </v-btn>
          <v-btn text @click="resolve('once')"> Once </v-btn>
          <v-btn text @click="resolve('always')"> Always </v-btn>
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
          <v-btn text @click="inAppStatusDialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import AppBar from '@/renderer/components/AppBar.vue';
import { ExtendedVue } from '@/renderer/utils/basevue';
import { UserDoc } from '../rxdb/user/model';
import { UserUpsert } from '@/renderer/store/network/actions';
import { Component } from 'vue-property-decorator';
import NavDrawer from '@/renderer/components/NavDrawer.vue';
import NavDrawerConfig from '@/renderer/components/NavDrawerConfig.vue';
import * as subscriptions from '@/renderer/subscriptions/index';
import { ipcRenderer } from 'electron';
import { Action, Getter, Mutation } from 'vuex-class';
import {
  concatMap,
  debounceTime,
  delay,
  expand,
  filter,
  map,
  mapTo,
  switchMap,
  tap,
} from 'rxjs/operators';
import { handleTransaction } from '@/renderer/utils/in-app-transaction';
import {
  Advanced,
  Appearance,
  Clip,
  Development,
  Drive,
  General,
  InAppStatus,
  Room,
  User,
} from '@/renderer/store/types';
import { from, interval, of } from 'rxjs';
import {
  imagePathToDataURI,
  listGoogleDriveFiles,
} from '@/renderer/invokers/index';
import { isAuthenticated } from '../utils/common';

import { Framework } from 'vuetify';
import {
  MessageDoc,
  parseContent,
  stringifyContent,
} from '../rxdb/message/model';
import { Format } from '../rxdb/clips/model';
import { IDevice } from '../electron/services/socket.io/types';
import {
  always,
  empty,
  whenDevelopment,
  whenMacOS,
  whenShareAvailable,
} from '../utils/environment';
import { isSuccess, isSuccessHttp } from '@/utils/result';
import router from '@/renderer/router';
import { initAnalytics } from './utils/analytics-vue';

@Component<App>({
  components: { NavDrawer, NavDrawerConfig, AppBar },
  subscriptions() {
    return {
      transactions: subscriptions.onTransactionsUpdated.pipe(
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
        )
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
export default class App extends ExtendedVue {
  @Getter('user', { namespace: 'configuration' })
  public user!: User;
  @Getter('general', { namespace: 'configuration' })
  public general!: General;
  @Getter('appearance', { namespace: 'configuration' })
  public appearance!: Appearance;
  @Getter('advanced', { namespace: 'configuration' })
  public advanced!: Advanced;
  @Getter('drive', { namespace: 'configuration' })
  public drive!: Drive;
  @Getter('development', { namespace: 'configuration' })
  public development!: Development;

  @Action('addClip', { namespace: 'clips' })
  public addClip!: (clip: Clip) => Promise<Clip>;
  @Action('removeClipsLte', { namespace: 'clips' })
  public removeClipsLte!: (updatedAt: number) => Promise<Clip[]>;
  @Action('retrieveFromDrive', { namespace: 'clips' })
  public retrieveFromDrive!: (args: {
    fileIds: string[];
    force?: boolean;
  }) => Promise<unknown>;
  @Action('uploadToDrive', { namespace: 'clips' })
  public uploadToDrive!: (args?: {
    clip: Clip;
    threshold?: number;
  }) => Promise<Clip[]>;

  @Action('loadRooms', { namespace: 'network' })
  public loadRooms!: () => Promise<Room[]>;
  @Action('findRoomFromUserOrCreate', { namespace: 'network' })
  public findRoomFromUserOrCreate!: (
    user: Pick<UserDoc, 'id' | 'username'>
  ) => Promise<Room>;
  @Action('addOrUpdateMessage', { namespace: 'network' })
  public addOrUpdateMessage!: (args: {
    message: Omit<MessageDoc, 'id' | 'updatedAt' | 'createdAt'> & {
      id?: string;
    };
    skipUpsert?: boolean;
  }) => Promise<MessageDoc | undefined>;
  @Action('findMessage', { namespace: 'network' })
  public findMessage!: (args: {
    roomId: string;
    messageId: string;
  }) => Promise<MessageDoc | undefined>;
  @Action('upsertUser', { namespace: 'network' })
  public upsertUser!: (device: UserUpsert) => Promise<UserDoc>;
  @Action('handleServer', { namespace: 'network' })
  public handleServer!: (action: 'start' | 'close') => Promise<boolean>;

  @Mutation('loadConfig', { namespace: 'configuration' })
  public loadConfig!: ({ vuetify }: { vuetify: Framework }) => void;
  @Mutation('setGeneral', { namespace: 'configuration' })
  public setGeneral!: (general: General) => void;
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

  get oneHour(): number {
    return 1000 * 60 * 60;
  }

  get isDefaultDrawer(): boolean {
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

  public filterClip(clip: Clip): Clip {
    return Object.entries((this.advanced as Advanced).formats).reduce(
      (acc, entry) => {
        const [clipFormat, present] = entry as [
          'plainText' | 'richText' | 'htmlText' | 'dataURI',
          boolean
        ];
        const filterFormat = (
          clipFormat: 'plainText' | 'richText' | 'htmlText' | 'dataURI',
          present: boolean,
          formats: Format[]
        ) => {
          return present
            ? formats
            : formats.filter((format) => {
                switch (format) {
                  case 'text/plain':
                    return !(clipFormat === 'plainText');
                  case 'text/rtf':
                    return !(clipFormat === 'richText');
                  case 'text/html':
                    return !(clipFormat === 'htmlText');
                  case 'image/jpg':
                    return !(clipFormat === 'dataURI');
                  case 'image/png':
                    return !(clipFormat === 'dataURI');
                  case 'vscode-editor-data':
                    return false;
                }
              });
        };
        acc[clipFormat] = present ? acc[clipFormat] : '';
        acc.formats = filterFormat(clipFormat, present, acc.formats);
        return acc;
      },
      clip
    );
  }

  public created(): void {
    // Load Configuration
    this.loadConfig({ vuetify: this.$vuetify });

    initAnalytics(router);
    // Init analytics
    whenDevelopment(empty, () => {
      if (this.development.analytics) initAnalytics(router);
    });
    // Modify Scrollbal
    whenMacOS(empty, () => {
      const style = document.createElement('style');
      style.id = 'scrollbar';
      style.innerText =
        `::-webkit-scrollbar { background-color: #fff; width: 16px; } ::-webkit-scrollbar-track { background-color: #fff; } ::-webkit-scrollbar-thumb { background-color: #babac0; border-radius: 16px; border: 4px solid #fff; } ::-webkit-scrollbar-button { display:none; }`.replace(
          /[\n\r]+/g,
          ''
        );
      document.getElementsByTagName('head')[0].appendChild(style);
    });

    /**
     * Get clipboard data from background.ts
     * Add to drive once
     *
     */
    this.$subscribeTo(
      subscriptions.clipboardChange
        .pipe(map((clip) => this.filterClip(clip)))
        .pipe(
          filter(
            (clip) =>
              !!clip.dataURI ||
              !!clip.plainText ||
              !!clip.htmlText ||
              !!clip.richText
          )
        )
        .pipe(
          tap(async (clip) => {
            const { backup, backupThreshold } = this.drive as Drive;
            if (backup) {
              setTimeout(async () => {
                const result = await imagePathToDataURI(clip.dataURI);
                this.uploadToDrive({
                  clip: {
                    ...clip,
                    dataURI:
                      clip.dataURI && isSuccess(result)
                        ? result.data
                        : clip.dataURI,
                  } as Clip,
                  threshold: backupThreshold,
                });
              }, 0);
            }
          })
        ),
      (clip) => this.addClip(clip)
    );

    /**
     * Optimize storage
     */
    this.$subscribeTo(
      interval(this.oneHour)
        .pipe(filter(() => (this.advanced as Advanced).optimize > 0))
        .pipe(
          concatMap(() =>
            from(
              this.removeClipsLte(
                Date.now() - (this.advanced as Advanced).optimize
              )
            )
          )
        ),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );

    /**
     * On bounds change
     */
    this.$subscribeTo(
      subscriptions.onBoundsChange,
      ({ height, width, x, y }) => {
        const general: General = this.general;
        this.setGeneral({
          ...general,
          positioningMode:
            general.positioningMode.type === 'cursor'
              ? {
                  type: 'cursor',
                  height,
                  width,
                }
              : {
                  type: 'maintain',
                  height,
                  width,
                  position: { x, y },
                },
        } as General);
      }
    );

    /** Rooter */

    this.$subscribeTo(subscriptions.onNavigate, (location) =>
      this.$router.push(location)
    );

    /** Network */

    const findRoomFromUserOrCreate = (
      (memoized: { [key: string]: Room | undefined }) =>
      (messageId: string) =>
      async (args: { id: string; username: string }) =>
        memoized[messageId] ??
        (async () => {
          const room: Room = await this.findRoomFromUserOrCreate(args);
          memoized[messageId] = room;
          return room;
        })()
    )({});

    // onMessage received (onAuthorize is in App.vue)
    this.$subscribeTo(
      subscriptions.onMessage,
      async ({ sender, message }: { sender: IDevice; message: MessageDoc }) => {
        //  Find user or create if necessary
        const room: Room = await findRoomFromUserOrCreate(message.id)({
          id: sender.mac,
          username: sender.username,
          // Update the roomId inside the message (Currently is the sender roomId)
        });
        await this.addOrUpdateMessage({
          skipUpsert: message.status === 'pending', // Avoid to update database while receiving chunk of data (will not update when you re sending to yourself)
          message: {
            ...message,
            roomId: room.id,
          } as MessageDoc,
        });
        // Notify user
        (() => {
          if (message.status !== 'sent') return;
          const notification = new Notification(sender.username, {
            timestamp: Date.now(),
            body: `– ${message.content}`,
          });
          notification.onclick = () => {
            if (this.$route.params.roomId !== room.id) {
              this.$router.push({ name: 'room', params: { roomId: room.id } });
            }
          };
          console.info('Message Received! 🎉😼', message);
        })();
      }
    );

    this.$subscribeTo(
      subscriptions.onProgress.pipe(
        concatMap(async (data) => {
          const room = await findRoomFromUserOrCreate(data.messageId)({
            id: data.receiverId,
            username: 'always present so fix later',
          });
          const message = (await this.findMessage({
            roomId: room.id,
            messageId: data.messageId,
          })) as MessageDoc;
          // Update the roomId inside the message (Currently is the sender roomId)
          return this.addOrUpdateMessage({
            skipUpsert: data.status === 'next',
            message: {
              ...message,
              content: (() => {
                switch (data.status) {
                  case 'next':
                    return stringifyContent({
                      path: parseContent(message.content).path,
                      progress: data.progress,
                    });
                  default:
                    return message.content;
                }
              })(),
              status: (() => {
                switch (data.status) {
                  case 'next':
                    return 'pending';
                  case 'complete':
                    return 'sent';
                  case 'error':
                    return 'rejected';
                }
              })(),
            } as MessageDoc,
          });
        })
      ),
      async (data) => {
        console.info('OnProgress', data);
      }
    );

    // Authorize
    this.$subscribeTo(subscriptions.onAuthorize, async (device) => {
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

    whenShareAvailable(
      () => this.handleServer('start'),
      always(Promise.resolve(false))
    );
  }
}
</script>

<style scoped lang="scss">
$drawer-width: 64px;
.mvleft {
  padding-left: $drawer-width !important;
}
</style>
