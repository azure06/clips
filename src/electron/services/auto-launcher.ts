import Sentry from './sentry-electron';
import AutoLaunch from 'auto-launch';
import { HandlerResponse } from '../../utils/invocation-handler';

const isDevelopment = process.env.NODE_ENV !== 'production';

const autoLauncher = new AutoLaunch({
  name: 'Clips',
});

export function autoLauncherHandler(): (
  arg: boolean
) => Promise<HandlerResponse<boolean>> {
  return (startup) =>
    autoLauncher
      .isEnabled()
      .then(async (isEnabled) => {
        if (startup && !isEnabled && !isDevelopment) {
          await autoLauncher.enable();
        } else if (!startup && isEnabled) {
          await autoLauncher.disable();
        }
        return { status: 'success' as const, data: startup };
      })
      .catch((err: Error) => {
        Sentry.captureEvent(err);
        return { status: 'failure' as const, message: err.message };
      });
}
