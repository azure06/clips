import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import sendGrid from '@sendgrid/mail';
import cors from 'cors';

const corsHandler = cors({ origin: true });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

sendGrid.setApiKey(functions.config().sendgrid.apikey);
admin.initializeApp();

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

export const activatePremium = functions.https.onRequest((req, res) => {
  corsHandler(req as any, res as any, async () => {
    const { licenseKey } = req.query;
    return res.send({ valid: licenseKey === 'CLIPS_PREMIUM' });
  });
});

exports.activateByEmail = functions.https.onRequest((req, res) => {
  corsHandler(req as any, res as any, async () => {
    const { email } = req.query;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    await admin
      .firestore()
      .collection('emails')
      .add({ email });

    const msgbody = {
      to: email,
      from: 'info@infiniticlips.com',
      subject: `Clips Premium - Universal clipboard app`,
      text: `Thank you for participating to beta testing. Use the following Code to unlock premium features: CLIPS_PREMIUM`,
      html: `Thank you for participating to our beta testing. 
             <br>
             Use the following CODE to unlock the premium features: 
             <br>
             <strong> CLIPS_PREMIUM </strong>
            `,
    };

    return sendGrid
      .send(msgbody)
      .then(([requestResponse]) => res.send(requestResponse.toJSON()))
      .catch((error) => {
        res.status(500).send('Something went wrong...');
      });
  });
});
