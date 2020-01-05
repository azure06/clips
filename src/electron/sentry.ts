import { init } from '@sentry/electron/dist/main';
import * as Sentry from '@sentry/electron';
import log from 'electron-log';

export default {
  ...Sentry,
  init,
  captureException(error: any) {
    const id = Sentry.captureException(error);
    log.error({ [id]: error });
  },
};
