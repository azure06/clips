import Vue from 'vue';
import VueRx from 'vue-rx';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import subscriptions from './subscriptions';
import { mapActions, mapMutations, mapGetters } from 'vuex';
import * as Sentry from '@sentry/electron';
import { environment } from './environment';
import { interval, from } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { Clip, SettingsState } from './store/types';
import VueDOMPurifyHTML from 'vue-dompurify-html';

Vue.config.productionTip = false;
Sentry.init(environment.sentry);
Vue.use(VueRx);
Vue.use(VueDOMPurifyHTML, {
  default: {
    FORBID_TAGS: ['a'],
  },
});

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
    ...mapMutations('user', {
      loadUser: 'loadUser',
    }),
    ...mapMutations('settings', {
      loadSettings: 'loadSettings',
      changeSettings: 'changeSettings',
    }),
    filterClip(clip: Clip): Clip {
      return Object.entries(this.settings.storage.formats).reduce((acc, entry) => {
        const [key, value] = entry as ['plainText' | 'richText' | 'htmlText' | 'dataURI', boolean];
        acc[key] = value ? clip[key] : '';
        return acc;
      }, clip);
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
          filter((clip) => !!clip.dataURI || !!clip.plainText || !!clip.htmlText || !!clip.richText)
        )
        .pipe(
          tap((clip) => {
            if (this.settings.drive.sync)
              this.uploadToDrive({ clip, threshold: this.settings.drive.threshold });
          })
        ),
      (clip) => this.addClip(clip)
    );

    /**
     * Optimize storage
     */
    this.$subscribeTo(
      interval(this.oneHour)
        .pipe(filter(() => !!this.user && this.settings.storage.optimize.every > 0))
        .pipe(
          concatMap((_) =>
            from(this.removeClipsLte(Date.now() - this.settings.storage.optimize.every))
          )
        ),
      (value: Clip[]) => {}
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

    this.$subscribeTo(subscriptions.onNavigate, (location) => this.$router.push(location));
  },
}).$mount('#app');
