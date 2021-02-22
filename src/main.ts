import Vue from 'vue';
import VueRx from 'vue-rx';
import App from './App.vue';
import AppEditor from './AppEditor.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './firebase';
import { initAnalytics } from './analytics-vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import Sentry from '@/sentry-vue';
import { isEditorView } from './utils/environment';
import { environment } from './environment';

Vue.config.productionTip = false;
if (!isEditorView(window.process.argv)) Sentry.init(environment.sentry);

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
  render: (h) => h(isEditorView(window.process.argv) ? AppEditor : App),
}).$mount('#app');
