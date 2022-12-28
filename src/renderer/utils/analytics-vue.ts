import VueRouter from 'vue-router';

import * as analytics from '../invokers/analytics';

export const initAnalytics = async function (router: VueRouter) {
  router.afterEach((to) => analytics.pageView(to.path, 'clips', to.name || ''));
};
