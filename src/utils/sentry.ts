import * as Sentry from '@sentry/electron';
import log from 'electron-log';
import * as storeService from '@/electron/services/electron-store';
import { session } from 'electron';

export function init(
  options: Omit<Sentry.ElectronOptions, 'ipcMode' | 'getSessions'>
): void {
  if (options.dsn === undefined) return;
  Sentry.init({
    ...options,
    getSessions: () => [session.defaultSession],
  });
  Sentry.configureScope(function (scope) {
    const user = storeService.getAppConf()?.user;
    scope.setUser({
      id: storeService.getUserId(),
      username: user ? user.displayName : undefined,
      email: user ? user.emailAddress : undefined,
    });
  });
}

export function captureException(error: unknown): void {
  const id = Sentry.captureException(error);
  log.error({ [id]: error });
}
