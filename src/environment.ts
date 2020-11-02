import * as Integrations from '@sentry/integrations';
import Vue from 'vue';
import * as Sentry from '@sentry/electron';

export const environment = {
  sentry: {
    dsn: process.env.VUE_APP_SENTRY_DSN || '',
    integrations: [new Integrations.Vue({ Vue, attachProps: true })],
    environment: process.env.NODE_ENV || '',
  } as Sentry.ElectronOptions,
  firebaseConfig: {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL || '',
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VUE_APP_FIREBASE_APP_ID || '',
    measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID || '',
  },
};
