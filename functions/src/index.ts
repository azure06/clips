import * as functions from 'firebase-functions';
import * as sendGrid from '@sendgrid/mail';
import { environment } from './environemnt.config';

sendGrid.setApiKey(environment.sendGridApiKey);

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const sendContactMail = functions.https.onCall(
  async (data: any, context) => {
    const { fullName, email, content } = data;
    console.log(fullName, email, content, data);
    const msgbody = {
      to: 'gabri06e@gmail.com',
      from: 'noreply@infiniticlips.com',
      subject: `Contact-us email from ${fullName} - ${email}`,
      text: content,
      html: `<strong>${content}</strong>`
    };
    return sendGrid
      .send(msgbody)
      .then(([requestResponse]) => requestResponse.toJSON())
      .catch(error => error);
  }
);
