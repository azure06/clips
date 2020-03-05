import * as functions from 'firebase-functions';
import sendGrid from '@sendgrid/mail';
import { environment } from './environment';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

sendGrid.setApiKey(environment.sendGridApiKey);

export const sendContactMail = functions.https.onCall(async (data: any, context) => {
  const { fullName, email, content, to } = data;
  const msgbody = {
    to: to || 'info@infiniticlips.com',
    from: 'info@infiniticlips.com',
    subject: `Info - Contact us`,
    text: `${content}\n\nfrom ${fullName} - ${email}`,
    html: `${content}<br><strong>from ${fullName} - ${email}</strong>`,
  };
  return sendGrid
    .send(msgbody)
    .then(([requestResponse]) => requestResponse.toJSON())
    .catch((error) => error);
});
