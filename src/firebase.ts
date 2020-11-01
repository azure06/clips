import firebase from 'firebase';
import { environment } from '@/environment';

interface Notification<T = any> {
  collapse_key: string;
  data: T;
  from: string;
  notification: { title: string; body: string };
}

firebase.initializeApp(environment.firebaseConfig);

export const activatePremium = (licenseKey: string) => {
  const encode = (data: { [key: string]: any }) => {
    return Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
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
