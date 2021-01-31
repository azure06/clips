import Vue from 'vue';
import VueRx from 'vue-rx';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import * as subscriptions from './utils/subscription';
import { environment } from './environment';
import { Clip, Room, General, Advanced, Drive } from './store/types';
import './firebase';
import { initAnalytics } from './analytics-vue';
import {
  MessageDoc,
  parseContent,
  stringifyContent,
} from './rxdb/message/model';
import { IDevice } from './electron/services/socket.io/types';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { interval, from } from 'rxjs';
import Sentry from '@/sentry-vue';
import { mapActions, mapMutations, mapGetters } from 'vuex';
import { Format } from './rxdb/clips/model';
import { imagePathToDataURI } from './utils/invocation';
import { isSuccess } from './utils/invocation-handler';
import { isMas } from './utils/environment';

Vue.config.productionTip = false;
Sentry.init(environment.sentry);

Vue.use(VueRx);
Vue.use(VueDOMPurifyHTML, {
  default: {
    FORBID_TAGS: ['a'],
  },
});

initAnalytics(router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vm = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
  computed: {
    ...mapGetters('configuration', {
      user: 'user',
      general: 'general',
      appearance: 'appearance',
      drive: 'drive',
      advanced: 'advanced',
    }),
    oneHour() {
      return 1000 * 60 * 60;
    },
  },
  methods: {
    ...mapActions('clips', {
      addClip: 'addClip',
      removeClipsLte: 'removeClipsLte',
      uploadToDrive: 'uploadToDrive',
    }),
    ...mapMutations('configuration', {
      loadConfig: 'loadConfig',
      setGeneral: 'setGeneral',
    }),
    ...mapActions('network', {
      loadRooms: 'loadRooms',
      findRoomFromUserOrCreate: 'findRoomFromUserOrCreate',
      addOrUpdateMessage: 'addOrUpdateMessage',
      findMessage: 'findMessage',
      upsertUser: 'upsertUser',
      handleServer: 'handleServer',
    }),
    filterClip(clip: Clip): Clip {
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
    },
  },
  created() {
    this.loadConfig({ vuetify: this.$vuetify });

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
            const result = await imagePathToDataURI(clip.dataURI);
            if (backup && isSuccess(result))
              this.uploadToDrive({
                clip: {
                  ...clip,
                  dataURI: clip.dataURI ? result.data : clip.dataURI,
                } as Clip,
                threshold: backupThreshold,
              });
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

    this.$subscribeTo(subscriptions.onNavigate, (location) =>
      this.$router.push(location)
    );

    const findRoomFromUserOrCreate = ((memoized: {
      [key: string]: Room | undefined;
    }) => (messageId: string) => async (args: {
      id: string;
      username: string;
    }) =>
      memoized[messageId] ??
      (async () => {
        const room: Room = await this.findRoomFromUserOrCreate(args);
        memoized[messageId] = room;
        return room;
      })())({});

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

    if (!isMas) this.handleServer('start');
  },
}).$mount('#app');
