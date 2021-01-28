import { environment } from '../environment';
import * as storeService from './electron-store';
import ua from 'universal-analytics';

const visitor = ua(environment.analytics.accountId, storeService.getUserId());

const trackEvent = (
  category: string,
  action: string,
  label: string,
  value: string,
  path: string
) => {
  return visitor
    .event({
      ec: category,
      ea: action,
      el: label,
      ev: value,
      p: path,
    })
    .send();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).analytics = { trackEvent, visitor };
