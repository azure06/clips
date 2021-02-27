import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import sendGrid from '@sendgrid/mail';
import cors from 'cors';
import Stripe from 'stripe';
import querystring from 'querystring';
import { uuid } from 'uuidv4';
import { purchaseTemplate } from './template';

const corsHandler = cors({ origin: true });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const CLIPS_DOMAIN = functions.config().domain.clips;
const FUNCTIONS_DOMAIN = functions.config().domain.functions;
const stripe = new Stripe(functions.config().stripe.sk, {
  apiVersion: '2020-08-27',
});
sendGrid.setApiKey(functions.config().sendgrid.apikey);
admin.initializeApp();

// Stripe

export const createCheckoutSession = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  corsHandler(req as any, res as any, async () => {
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
        success_url: `${FUNCTIONS_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIPS_DOMAIN}/premium`,
      })
      .then((session) => res.status(200).send({ id: session.id }))
      .catch((err) => res.status(500).send(err));
  });
});

export const createActivationCode = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  corsHandler(req as any, res as any, async () => {
    const { email } = req.query;
    return admin
      .firestore()
      .collection('emails')
      .where('email', '==', email)
      .get()
      .then(async (snapshot) => {
        const [head] = snapshot.docs.map((doc) => doc.data());
        const code = uuid()
          .replace(/-/g, '')
          .split(/(.{6})/)
          .filter(Boolean)
          .filter((_, index) => index < 1)
          .join()
          .toUpperCase();

        if (head) {
          await Promise.resolve([
            admin
              .firestore()
              .collection('codes')
              .doc(email)
              .set({ code }),
            sendGrid.send({
              to: email,
              from: 'info@infiniticlips.com',
              subject: `Clips Premium - Universal clipboard app`,
              text: `Your security code is ${code}. Happy Clips!`,
              html: `Your security code is ${code}. Happy Clips!`,
            }),
          ]);
          return res.status(200).send();
        } else {
          return res.status(500).send();
        }
      })
      .catch(() => {
        return res.status(500).send();
      });
  });
});

// Activation

export const activatePremium = functions.https.onRequest((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  corsHandler(req as any, res as any, async () => {
    const { code } = req.query;
    admin
      .firestore()
      .collection('codes')
      .where('code', '==', code)
      .get()
      .then((snapshot) => {
        const tenMin = 60000 * 10;
        const arr = snapshot.docs.filter(
          (doc) => Date.now() - doc.updateTime.toMillis() <= tenMin
        );
        return res.send({ valid: arr.length > 0 });
      })
      .catch(() => res.send({ valid: false }));
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

    const redirectSuccess = (email: string) =>
      res.redirect(
        `${CLIPS_DOMAIN}/success?email=${querystring.escape(email)}`
      );
    const redirectFailure = (error?: unknown) => {
      if (error !== undefined) console.info('Failure:', error);
      res.redirect(`${CLIPS_DOMAIN}/premium`);
    };

    return isAvailable(session.customer)
      ? stripe.customers
          .retrieve(
            isString(session.customer) ? session.customer : session.customer.id
          )
          .then(async (customer) => {
            if (isCustomer(customer)) {
              const email = customer.email || '';
              Promise.all([
                admin
                  .firestore()
                  .collection('emails')
                  .add({ email }),
                sendGrid.send({
                  to: email,
                  from: 'info@infiniticlips.com',
                  subject: `Clips Premium - Universal clipboard app`,
                  text: `Thank you for purchasing Clips. To activate Clips Premium, please request a one-time code from "Advanced Settings" section of Clips.`,
                  html: purchaseTemplate,
                }),
              ])
                .then(() => redirectSuccess(email))
                .catch(redirectFailure);
            } else {
              redirectFailure(customer);
            }
          })
          .catch(redirectFailure)
      : redirectFailure(session);
  });
});
