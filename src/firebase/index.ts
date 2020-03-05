import firebase from 'firebase';
import 'firebase/analytics';
import { ipcRenderer } from 'electron';
import { environment } from '@/environment';
import {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED as ON_NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
  // @ts-ignore
} from 'electron-push-receiver/src/constants';

firebase.initializeApp(environment.firebaseConfig);

const functions = firebase.functions();

const write = console;

// Listen for service successfully started
ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, (_, token) => {
  write.warn('service start', token);
});
// Handle notification errors
ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, (_, error) => write.log('notification error', error));
// Send FCM token to backend
ipcRenderer.on(TOKEN_UPDATED, (_, token) => write.log('token updated', token));
// Display notification
ipcRenderer.on(ON_NOTIFICATION_RECEIVED, (_, notification) => write.warn(notification));
// Start service
ipcRenderer.send(START_NOTIFICATION_SERVICE, environment.firebaseConfig.messagingSenderId);
