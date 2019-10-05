const login = () => import(/* webpackChunkName: "login" */ '../components/base/login');
const page404 = () => import(/* webpackChunkName: "page404" */ '../components/base/404');
const imageView = () => import(/* webpackChunkName: "imageView" */ '@/components/pages/electronImage/imageView');
const imageAudit = () => import(/* webpackChunkName: "imageAudit" */ '@/components/pages/electronImage/imageAudit');
const bookView = () => import(/* webpackChunkName: "bookView" */ '@/components/pages/electronVoucher/bookView');

const pages = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login, meta: { requirAuth: false } },
  { path: '/error', component: page404, meta: { requirAuth: false } },
];

export default {
  routes: [
    ...pages,
    { path: '/imageView',
      name: '影像查看',
      component: imageView,
      meta: {
        keepAlive: false,
        requirAuth: false,
      },
    },
    {
      path: '/bookView',
      name: '凭证查看',
      component: bookView,
      meta: {
        keepAlive: false,
        requirAuth: false,
      },
    },
    {
      path: '/imageAudit',
      name: '影像审核',
      component: imageAudit,
      meta: {
        keepAlive: false,
        requirAuth: false,
      },
    },
  ],
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
};
