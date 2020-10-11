import ua from 'universal-analytics';
import { storeService } from '../services/electron-store';
import { environment } from './../environment';

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

(global as any).analytics = { trackEvent, visitor };
