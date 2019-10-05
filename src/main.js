/* eslint-disable */
import Vue from 'vue';              // vue.js引入
import './element-variables.scss'   // 定制的主题色的样式以及element-UI样式
import animate from 'animate.css';  //annimate.css引入

import App from './App';            // 入口vue文件
import router from './router';      // 前端路由引入
import './cookie';                  // vue-cookie引入
// i18n依赖cookie读取本地默认语言
import i18n from './i18n';          // 国际化引入 并 引入element UI库引入
import './axios';                   // 向后台请求的axios模块
import store from './store';        // vuex引入
import './icons';                   // svg-icon放置的位置

import zteUI from './components/modules';
Vue.use(zteUI);

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>',
});
