import firebase from 'firebase';
import { environment } from '@/environment';

firebase.initializeApp(environment.firebaseConfig);

export const activatePremium = (licenseKey: string): Promise<Response> => {
  const encode = (data: { [key: string]: string }) => {
    return Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join('&');
  };
  return fetch(
    'https://us-central1-infiniti-clips.cloudfunctions.net/activatePremium?' +
      encode({
        licenseKey,
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
