/* eslint-disable */
import Vue from 'vue';              // vue.js引入
import App from './App';            // 入口vue文件
import router from './router';      // 前端路由引入
import './axios';                   // 向后台请求的axios模块

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'animate.css';  //annimate.css引入

Vue.use(ElementUI);

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
