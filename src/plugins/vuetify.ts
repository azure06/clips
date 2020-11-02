import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import '@mdi/font/css/materialdesignicons.css';
// import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
  theme: {
    dark: false,
    themes: {
      light: {
        surfaceVariant: '#FFF',
        surface: '#FFF',
        background: '#f6f6f8',
      },
      dark: {
        surfaceVariant: '#2b2b31',
        surface: '#222226',
        background: '#1d1d20',
      },
    },
  },
});
