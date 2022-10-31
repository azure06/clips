import Vue from 'vue';
import VueRouter from 'vue-router';

import Room from '../components/Room.vue';
import Advanced from '../components/settings/Advanced.vue';
import General from '../components/settings/General.vue';
import Language from '../components/settings/Language.vue';
import Account from '../views/Account.vue';
import Editor from '../views/Editor.vue';
import GoogleDrive from '../views/GoogleDrive.vue';
import Home from '../views/Home.vue';
import Note from '../views/Note.vue';
import Settings from '../views/Settings.vue';
import Share from '../views/Share.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
  },
  {
    path: '/note',
    name: 'note',
    component: Note,
  },
  {
    path: '/account',
    name: 'account',
    component: Account,
  },
  {
    path: '/google-drive',
    name: 'google-drive',
    component: GoogleDrive,
  },
  {
    path: '/share',
    name: 'share',
    component: Share,
    children: [
      {
        // Room will be rendered inside Share's <router-view>
        // when /share/room:id is matched
        name: 'room',
        path: 'room/:roomId',
        component: Room,
      },
    ],
  },
  {
    path: '/editor',
    name: 'editor',
    component: Editor,
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    redirect: { name: 'general-settings' },
    children: [
      {
        path: '/general',
        name: 'general-settings',
        component: General,
      },
      {
        path: '/advanced',
        name: 'advanced-settings',
        component: Advanced,
      },
      {
        path: '/language',
        name: 'language-settings',
        component: Language,
      },
    ],
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
