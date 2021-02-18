import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import sendGrid from '@sendgrid/mail';
import cors from 'cors';
import Stripe from 'stripe';
import querystring from 'querystring';

const corsHandler = cors({ origin: true });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const stripe = new Stripe(functions.config().stripe.sk, {
  apiVersion: '2020-08-27',
});
sendGrid.setApiKey(functions.config().sendgrid.apikey);
admin.initializeApp();

// Stripe

export const createCheckoutSession = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  corsHandler(req as any, res as any, async () => {
    const domain = 'https://infiniticlips.com';
    const price = (await stripe.prices.list()).data;
    return stripe.checkout.sessions
      .create({
        payment_method_types: ['card'],
        line_items: price.map((item) => ({
          // price_data: {
          //   currency: 'usd',
          //   product_data: {
          //     name: 'Clips Premium',
          //     images: ['https://infiniticlips.com/logo.svg'],
          //   },
          //   unit_amount: 599,
          // },
          price: item.id,
          quantity: 1,
        })),
        mode: 'payment',
        success_url: `https://us-central1-infiniti-clips.cloudfunctions.net/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}/premium`,
      })
      .then((session) => res.status(200).send({ id: session.id }))
      .catch((err) => res.status(500).send(err));
  });
});

export const success = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  corsHandler(req as any, res as any, async () => {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    const isString = (args: typeof session.customer): args is string =>
      typeof args === 'string';
    // prettier-ignore
    const isCustomer = (args: typeof session.customer): args is Stripe.Customer =>
      args !== null && !isString(args) && args.deleted === undefined;

    const isAvailable = (
      args: typeof session.customer
    ): args is string | Stripe.Customer => isCustomer(args) || isString(args);

    const redirect = await (isAvailable(session.customer)
      ? stripe.customers
          .retrieve(
            isString(session.customer) ? session.customer : session.customer.id
          )
          .then((customer) =>
            isCustomer(customer)
              ? `https://infiniticlips.com/success?email=${querystring.escape(
                  customer.email || ''
                )}`
              : 'https://infiniticlips.com/premium'
          )
          .catch((error) => 'https://infiniticlips.com/premium')
      : Promise.resolve('https://infiniticlips.com/premium'));

    res.redirect(redirect);
  });
});

// Activation

export const activatePremium = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  corsHandler(req as any, res as any, async () => {
    const { licenseKey } = req.query;
    return res.send({ valid: licenseKey === 'CLIPS_PREMIUM' });
  });
});

export const activateByEmail = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Send email with SendGrid

export const sendEmail = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      subject: `Clips - Thank you for reaching out`,
      text: ` Hi Dan Panke,
      Thank you for reaching out and downloading Clips.
      We are working on a bunch of new features, including the improvement you mentioned.
      We will reach you out soon. So stay tuned.

      Thanks,
      Clips`,
      html: `<html>
      <body>
          Hi Dan Panke,<br>
          Thank you for reaching out and downloading Clips.<br>
          We are working on a bunch of new features, including the improvement you mentioned.<br>
          We will reach you out soon. So stay tuned.<br>
          <br>
          Thanks,<br>
          Clips<br><br><br>
      
          Please don't reply to this email. If you have any other questions please contact us from our official website
          <a target="_blank" href="https://infiniticlips.com/contact">Clips Site</a>
      </body>
      </html>
            `,
    };

    return sendGrid
      .send(msgbody)
      .then(([requestResponse]) => res.send(requestResponse.toJSON()))
      .catch(() => {
        res.status(500).send('Something went wrong...');
      });
  });
});
