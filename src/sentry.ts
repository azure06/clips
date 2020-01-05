import { init } from '@sentry/electron';
import * as Integrations from '@sentry/integrations';
import Vue from 'vue';

init({
  dsn: '',
  integrations: [new Integrations.Vue({ Vue, attachProps: true })] as any,
});
