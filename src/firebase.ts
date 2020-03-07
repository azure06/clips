import firebase from 'firebase';
import { ipcRenderer, shell } from 'electron';
import { environment } from '@/environment';
import { storeService } from '@/electron/services/electron-store';
import log from 'electron-log';
import {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED as ON_NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
  // @ts-ignore
} from 'electron-push-receiver/src/constants';
interface Notification<T = any> {
  collapse_key: string;
  data: T;
  from: string;
  notification: { title: string; body: string };
}

firebase.initializeApp(environment.firebaseConfig);

const functions = firebase.functions();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
analytics.setUserId(storeService.getUserId());
analytics.logEvent('app-start');

const updateToken = async (userId: string, token: string) => {
  log.info(userId, token);
  return firestore
    .collection('users')
    .doc(userId)
    .set({ token });
};

const notify = (args: Notification) => {
  const notification = new Notification(args.notification.title, {
    body: args.notification.body,
  });

  notification.onclick = () => {
    if (args.data.url) shell.openExternal(args.data.url);
  };
};

const electronReceiver = () => {
  // Listen for service successfully started
  ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, async (_, token) =>
    updateToken(storeService.getUserId(), token)
  );
  // Handle notification errors
  ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, (_, error) => {
    log.error('Notification error: ', error);
  });
  // Send FCM token to backend
  ipcRenderer.on(TOKEN_UPDATED, (_, token) => updateToken(storeService.getUserId(), token));
  // Display notification
  ipcRenderer.on(ON_NOTIFICATION_RECEIVED, (_, notification) => notify(notification));
  // Start service
  ipcRenderer.send(START_NOTIFICATION_SERVICE, environment.firebaseConfig.messagingSenderId);
};

export const activatePremium = (licenseKey: string) => {
  const encode = (data: { [key: string]: any }) => {
    return Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
  };

  return fetch(
    'https://us-central1-infiniti-clips.cloudfunctions.net/activatePremium?' +
      encode({
        licenseKey: licenseKey,
      }),
    {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
};

electronReceiver();
