import Vue from 'vue';
import VueRx from 'vue-rx';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import * as subscriptions from './subscriptions';
import { environment } from './environment';
import { Clip, Room, SettingsState } from './store/types';
import './firebase';
import { initAnalytics } from './analytics-vue';
import { MessageDoc } from './rxdb/message/model';
import { IDevice } from './electron/services/socket.io/types';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { interval, from } from 'rxjs';
import Sentry from '@/sentry-vue';
import { mapActions, mapMutations, mapGetters } from 'vuex';

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
    ...mapGetters('user', {
      user: 'user',
    }),
    ...mapGetters('settings', {
      settings: 'settings',
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
    ...mapActions('network', {
      loadRooms: 'loadRooms',
      findRoomFromUserOrCreate: 'findRoomFromUserOrCreate',
      addOrUpdateMessage: 'addOrUpdateMessage',
      upsertUser: 'upsertUser',
      handleServer: 'handleServer',
    }),
    ...mapMutations('user', {
      loadUser: 'loadUser',
    }),
    ...mapMutations('settings', {
      loadSettings: 'loadSettings',
      changeSettings: 'changeSettings',
    }),
    filterClip(clip: Clip): Clip {
      return Object.entries(this.settings.storage.formats).reduce(
        (acc, entry) => {
          const [key, value] = entry as [
            'plainText' | 'richText' | 'htmlText' | 'dataURI',
            boolean
          ];
          acc[key] = value ? clip[key] : '';
          return acc;
        },
        clip
      );
    },
  },
  created() {
    this.loadUser();
    this.loadSettings({ vuetify: this.$vuetify });

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
          tap((clip) => {
            if (this.settings.drive.sync)
              this.uploadToDrive({
                clip,
                threshold: this.settings.drive.threshold,
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
        .pipe(
          filter(() => !!this.user && this.settings.storage.optimize.every > 0)
        )
        .pipe(
          concatMap(() =>
            from(
              this.removeClipsLte(
                Date.now() - this.settings.storage.optimize.every
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
    this.$subscribeTo(subscriptions.onBoundsChange, ({ height, width, x, y }) =>
      this.changeSettings({
        vuetify: this.$vuetify,
        payload: {
          ...this.settings,
          system: {
            ...this.settings.system,
            display:
              this.settings.system.display.type === 'cursor'
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
          },
        } as SettingsState,
      })
    );

    this.$subscribeTo(subscriptions.onNavigate, (location) =>
      this.$router.push(location)
    );

    // onMessage received (onAuthorize is in App.vue)
    this.$subscribeTo(
      subscriptions.onMessage,
      async ({ message, sender }: { sender: IDevice; message: MessageDoc }) => {
        //  Find user or create if necessary
        const room = (await this.findRoomFromUserOrCreate({
          id: sender.mac,
          username: sender.username,
        })) as Room;

        // Update the roomId inside the message (Currently is the sender roomId)
        await this.addOrUpdateMessage({
          ...message,
          status: 'sent',
          roomId: room.id,
        } as MessageDoc);

        // Notify user
        (() => {
          const notification = new Notification(sender.username, {
            timestamp: Date.now(),
            icon: './assets/icons/clip.svg',
            body: `– ${message.content}`,
          });
          notification.onclick = () => {
            if (this.$route.params.roomId !== room.id) {
              this.$router.push({ name: 'room', params: { roomId: room.id } });
              console.info('Navigate to room');
            }
          };
        })();
        console.info('Message received correctly!!! 🎉😼', message);
      }
    );
    this.handleServer('start');
  },
}).$mount('#app');
