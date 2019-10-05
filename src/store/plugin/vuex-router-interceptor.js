import router from '@/router';
import axios from 'axios';
import routerPages from './dynamicDirectory';

const portal = () => import(/* webpackChunkName: "portal" */ '@/components/pages/master');

// 通过菜单树筛选出路由页面
const getRoutes = (lists) => {
  let routes = [];
  if (lists && lists.length) {
    lists.forEach((item) => {
      const { url, path, name, children } = item;
      if (url) {
        routes.push({ path, name });
        const page = routerPages[item.path] || {};
        item.path = page.path || '';
      }
      if (children && children.length) routes = routes.concat(getRoutes(children));
    });
  }
  return routes;
};

const formatRoutes = (routes) => {
  const fmRoutes = [routerPages.index];
  routes.forEach((item) => {
    const { path, name } = item;
    if (routerPages[path]) {
      const fmRouter = { ...routerPages[path], name };
      if (!fmRoutes.find(rt => rt.path === fmRouter.path)) fmRoutes.push(fmRouter);
    }
  });
  return fmRoutes;
};
const initMenu = async (store) => {
  if (store.state.routeFlag || store.state.routes.length) return;
  await axios.post('/personal/listAuthFuncs').then(({ data }) => {
    const menuList = data.list[0] ? data.list[0].children : [];
    const routeList = getRoutes(menuList);
    const fmRoutes = formatRoutes(routeList);
    const pages = [
      { path: '*', redirect: '/error' },
      // { path: '/', redirect: '/login' },
      // { path: '/login', component: login, meta: { requirAuth: false } },
      // { path: '/error', component: page404, meta: { requirAuth: false } },
      {
        path: '/portal',
        component: portal,
        children: fmRoutes,
      },
    ];
    router.addRoutes(pages);
    store.commit('initMenu', { routes: fmRoutes, menuList });
  },
  () => {
    store.commit('setLogout');
    router.push('/');
  });
};
export default function vuexRouterInterceptor() {
  return (store) => {
    router.beforeEach(async (to, from, next) => {
      const logined = window.localStorage.getItem('logined');
      // 单点过来(会带logined字段，SSO)，但需要获取菜单的页面，需放行
      if (logined === 'SSO') {
        await initMenu(store);
        window.localStorage.setItem('logined', 'Y');
        next({ ...to, replace: true });
        return;
      }
      // 如果跳入页面不需要登录，或者单点过来，但不需要获取菜单的页面，需放行
      if (to.meta && to.meta.requirAuth === false) {
        next();
        return;
      }
      if (logined !== 'Y') {
        window.localStorage.clear();
        next('/');
      } else if (!store.state.routeFlag) {
        await initMenu(store);
        if (store.state.routeFlag) {
          next({ ...to, replace: true });
        } else {
          next('/login');
        }
      } else {
        next();
      }
    });
  };
}
