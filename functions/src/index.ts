import * as functions from 'firebase-functions';
import * as sendGrid from '@sendgrid/mail';
import { environment } from './environemnt.config';

sendGrid.setApiKey(environment.sendGridApiKey);

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const sendContactMail = functions.https.onCall(
  async (data: any, context) => {
    const { fullName, email, content } = data;
    const msgbody = {
      to: 'info@infiniticlips.com',
      from: 'info@infiniticlips.com',
      subject: `Info - Contact us`,
      text: `${content}\n\nfrom ${fullName} - ${email}`,
      html: `${content}<strong>from ${fullName} - ${email}</strong>`
    };
    return sendGrid
      .send(msgbody)
      .then(([requestResponse]) => requestResponse.toJSON())
      .catch(error => error);
  }
);
