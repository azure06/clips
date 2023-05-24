import VueRx from '@azure06/vue-rx';
import Vue from 'vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import VueQRCodeComponent from 'vue-qrcode-component';
import { environment } from '@/renderer/environment';
import router from '@/renderer/router';
import store from '@/renderer/store';
import * as Sentry from '@/utils/sentry';

import vuetify from './plugins/vuetify';
import App from './renderer/App.vue';
import AppEditor from './renderer/AppEditor.vue';

import { isEditorView } from './utils/environment';

Vue.config.productionTip = false;
Vue.use(VueRx);

Vue.use(VueDOMPurifyHTML, {
  default: {
    FORBID_TAGS: ['a'],
  },
});
Vue.component('qr-code', VueQRCodeComponent);

if (!isEditorView(window.process.argv))
  setTimeout(() => Sentry.init(environment.sentry), 0);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vm = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(isEditorView(window.process.argv) ? AppEditor : App),
}).$mount('#app');
