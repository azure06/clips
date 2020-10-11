import * as Sentry from '@sentry/electron';
import log from 'electron-log';
import { storeService } from '@/electron/services/electron-store';

// Use only with main.process
export default {
  ...Sentry,
  init: (value: Sentry.ElectronOptions) => {
    Sentry.init(value);
    Sentry.configureScope(function(scope) {
      const user = storeService.getUser();
      scope.setUser({
        id: storeService.getUserId(),
        username: user ? user.displayName : undefined,
        email: user ? user.emailAddress : undefined,
      });
    });
  },
  captureException(error: any) {
    const id = Sentry.captureException(error);
    log.error({ [id]: error });
  },
};
