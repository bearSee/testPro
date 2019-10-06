const index = () => import(/* webpackChunkName: "index" */ '@/components/pages/index');
const login = () => import(/* webpackChunkName: "login" */ '@/components/pages/login');


export default {
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: '登陆页面',
      component: login,
      meta: {
        keepAlive: false,
        requirAuth: false,
      },
    },
    {
      path: '/index',
      name: '主页',
      component: index,
      meta: {
        keepAlive: false,
        requirAuth: false,
      },
    },
  ],
};
