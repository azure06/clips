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

export const pageView = (path: string, hostname: string, title: string) =>
  visitor.pageview(path, hostname, title).send();
