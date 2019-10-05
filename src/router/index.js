import Vue from 'vue';
import Router from 'vue-router';
import routeConfig from './route-config';

Vue.use(Router);
const krtRouter = new Router(routeConfig);
krtRouter.beforeEach((to, from, next) => {
  document.body.scrollTop = 0;
  next();
});

export default krtRouter;
