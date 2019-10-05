import Vue from 'vue';
import Vuex from 'vuex';
import vuexRouterInterceptor from './plugin/vuex-router-interceptor';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    menuList: [],
    routes: [],
    routeFlag: false,
  },
  mutations: {
    setLogin(state) {
      window.localStorage.setItem('logined', 'Y');
      state.routes = [];
    },
    initMenu(state, payload) {
      state.routes = payload.routes;
      state.menuList = payload.menuList;
      state.routeFlag = true;
    },
    setLogout(state) {
      state.routeFlag = false;
      window.localStorage.clear();
    },
  },
  actions: {
    // 获取页面权限的接口
  },
  strict: debug,
  plugins: [vuexRouterInterceptor()],
});
