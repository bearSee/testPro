import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';
import store from '@/store';
import router from '@/router';

// axios.defaults.baseURL = `${window.location.protocol}//${window.location.host}/ztessc-ers/erssys`;
axios.defaults.baseURL = `${window.location.protocol}//${window.location.host}/erssys`;
axios.defaults.timeout = 30000;
axios.defaults.transformRequest = [data => qs.stringify(data)];

// 添加一个请求拦截器
axios.interceptors.request.use((config) => {
  if (window.localStorage.getItem('Authorization')) {
    config.headers.Authorization = window.localStorage.getItem('Authorization');
  }
  // 让每个请求携带token--['X-Token']为自定义key
  if (Vue.prototype.$cookies.get('user_session')) {
    config.headers['X-Token'] = Vue.prototype.$cookies.get('user_session');
  }
  if (Vue.prototype.$cookies.get('user_language')) {
    config.headers['Accept-Language'] = Vue.prototype.$cookies.get('user_language');
  }
  // get请求增加时间戳，避免服务器304
  if (config.method === 'get') {
    config.params = {
      _t: Date.parse(new Date()) / 1000,
      ...config.params,
    };
  }
  return config;
}, (error) => {
  Promise.reject(error);
});

// 添加一个响应拦截器
axios.interceptors.response.use(
  (res) => {
    if (res.config.responseType === 'blob') {
      return Promise.resolve(res);
    }
    if (res.headers.authorization) {
      window.localStorage.setItem('Authorization', res.headers.authorization);
    }
    if (res.data.ok) {
      if ((res.status === 200 || res.status === '200') && res.data.message) {
        Vue.prototype.$message.success(res.data.message);
        window.localStorage.setItem('logined', 'Y');
      }
      return res;
    }
    Vue.prototype.$message.error(res.data.message);
    if (res.data.code === '10000') {
      store.commit('setLogout');
      router.push('/login');
    }
    return Promise.reject(res);
  },
  (res) => {
    if (res.response) {
      Vue.prototype.$message.error(res.response.data.message);
    }
    return Promise.reject(res.response);
  },
);

Vue.prototype.$http = axios;
