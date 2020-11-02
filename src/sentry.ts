import { init } from '@sentry/electron';
import * as Integrations from '@sentry/integrations';
import Vue from 'vue';

init({
  dsn: '',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  integrations: [new Integrations.Vue({ Vue, attachProps: true })] as any,
});
