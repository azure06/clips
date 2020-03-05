import * as Integrations from '@sentry/integrations';
import Vue from 'vue';

const electron = window.require('electron');
const { remote } = electron;

export const environment = {
  sentry: {
    dsn: remote.process.env.VUE_APP_SENTRY_DSN!,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })] as any,
    environment: remote.process.env.NODE_ENV,
  },
  firebaseConfig: {
    apiKey: remote.process.env.VUE_APP_FIREBASE_API_KEY!,
    authDomain: remote.process.env.VUE_APP_FIREBASE_AUTH_DOMAIN!,
    databaseURL: remote.process.env.VUE_APP_FIREBASE_DATABASE_URL!,
    projectId: remote.process.env.VUE_APP_FIREBASE_PROJECT_ID!,
    storageBucket: remote.process.env.VUE_APP_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: remote.process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID!,
    appId: remote.process.env.VUE_APP_FIREBASE_APP_ID!,
    measurementId: remote.process.env.VUE_APP_FIREBASE_MEASUREMENT_ID!,
  },
};
