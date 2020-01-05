import * as Integrations from '@sentry/integrations';
import Vue from 'vue';

const electron = window.require('electron');
const { remote } = electron;

export const environment = {
  sentry: {
    dsn: remote.process.env.VUE_APP_SENTRY_DSN!,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })] as any,
  },
};
