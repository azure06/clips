import * as Sentry from '@/utils/sentry';
import AutoLaunch from 'auto-launch';
import { Result__ } from '@/utils/result';

const isDevelopment = process.env.NODE_ENV !== 'production';

const autoLauncher = new AutoLaunch({
  name: 'Clips',
});

export function autoLauncherHandler(
  startup: boolean
): Promise<Result__<boolean>> {
  return autoLauncher
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
      Sentry.captureException(err);
      return { status: 'failure' as const, message: err.message };
    });
}
