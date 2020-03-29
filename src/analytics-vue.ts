import ua from 'universal-analytics';
import { remote } from 'electron';
import VueRouter from 'vue-router';

export const analytics = remote.getGlobal('analytics') as {
  trackEvent: (
    category: string,
    action: string,
    label: string,
    value: string,
    path: string
  ) => void;
  visitor: ua.Visitor;
};

export const initAnalytics = function(router: VueRouter) {
  router.afterEach((to, from) => {
    analytics.visitor.pageview(to.path, 'clips', to.name || '').send();
  });

  return analytics;
};
