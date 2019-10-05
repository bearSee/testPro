import Vue from 'vue';

export default {
  data() {
    return {
      langs: [
        {
          label: '中文',
          value: 'zh-CN',
          suffix: 'cn',
        },
        {
          label: 'English',
          value: 'en-US',
          suffix: 'en',
        },
      ],
    };
  },
  methods: {
    toSwitchLanguage(val) {
      this.$i18n.locale = val;
      Vue.prototype.$cookies.set('user_language', val);
      // location.reload();
    },
  },
};
