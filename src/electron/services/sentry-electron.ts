import * as storeService from './electron-store';
import { init } from '@sentry/electron/dist/main';
import * as Sentry from '@sentry/electron';
import log from 'electron-log';

// Use only with main.process
export default {
  ...Sentry,
  init: (value: Sentry.ElectronOptions): void => {
    init(value);
    Sentry.configureScope(function(scope) {
      const user = storeService.getAppConf()?.user;
      scope.setUser({
        id: storeService.getUserId(),
        username: user ? user.displayName : undefined,
        email: user ? user.emailAddress : undefined,
      });
    });
  },
  captureException(error: unknown): void {
    const id = Sentry.captureException(error);
    log.error({ [id]: error });
  },
};
