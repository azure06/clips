import Vue from 'vue';
import VueRx from '@azure06/vue-rx';
import App from './renderer/App.vue';
import AppEditor from './renderer/AppEditor.vue';
import router from '@/renderer/router';
import store from '@/renderer/store';
import vuetify from './plugins/vuetify';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import * as Sentry from '@/utils/sentry';
import { isEditorView } from './utils/environment';
import { environment } from '@/renderer/environment';

Vue.config.productionTip = false;
Vue.use(VueRx);

Vue.use(VueDOMPurifyHTML, {
  default: {
    FORBID_TAGS: ['a'],
  },
});

if (!isEditorView(window.process.argv))
  setTimeout(() => Sentry.init(environment.sentry), 0);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vm = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(isEditorView(window.process.argv) ? AppEditor : App),
}).$mount('#app');
