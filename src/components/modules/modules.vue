<template>
  <el-menu :default-active="service" class="modules" mode="horizontal">
    <el-menu-item
      v-for="(sys, index) in sysMenu.slice(0, 8)"
      :key="index"
      :class="['module', service === sys.modules && 'currentSys']"
      :index="sys.modules"
      @click="openSystem(sys)">
      <div class="icon"><svg-icon :iconClass="sys.icon"></svg-icon></div>
      <div class="name">{{ sys.name }}</div>
    </el-menu-item>
    <el-submenu index="more" v-if="moreSys.length">
      <template slot="title">更多</template>
      <el-menu-item
        v-for="(sys, index) in moreSys"
        :key="index"
        class="module"
        :index="sys.modules"
        @click="openSystem(sys)">
        <span class="icon"><svg-icon :iconClass="sys.icon"></svg-icon></span>
        <span class="name">{{ sys.name }}</span>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
// import openSystem from './mixins/openSystem';

export default {
  name: 'modules',
  // mixins: [openSystem],
  props: {
    service: String,
    baseUrl: {
      type: String,
      default: 'https://fol.ztessc.com.cn',
    },
    modules: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {};
  },
  computed: {
    sysMenu() {
      const sysMenu = this.modules.filter(item => item.modules !== this.service);
      const currentMenu = this.modules.filter(item => item.modules === this.service);
      return currentMenu.concat(sysMenu);
    },
    moreSys() {
      return this.sysMenu.slice(8);
    },
  },
  methods: {
    openSystem(sys) {
      if (sys.modules === this.service) return;
      // const newWindow = _blank ? window.open() : window;
      const url = `${this.baseUrl}${sys.url || '/#/index'}`;
      // newWindow.location.href = url;
      this.$emit('openSystem', url);
    },
  },
};
</script>
<style lang="scss">
$back: #0068b7;
$font: #f6f6f6;
.modules {
  background: none;
  border: 0!important;
  .module {
    width: 80px;
    height: 55px;
    padding: 0;
    display: flex;
    flex-direction: column;
    color: $font!important;
    border: 0!important;
    .icon {
      display: flex;
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin: 5px auto;
    }
    .name {
      line-height: 1;
      font-size: 14px;
      margin: 5px 0;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .currentSys {
    background: $back;
  }
  .el-menu-item:not(.is-disabled):focus,.el-menu-item:not(.is-disabled):hover {
    background: $back;
    color: $font;
  }
  .el-submenu__title {
    height: 55px!important;
    color: $font!important;
    border: 0!important;
    background: none;
    .el-submenu__icon-arrow::before {
      color: $font;
    }
    .is-active {
      background: red;
    }
  }
  .el-submenu__title:not(.is-disabled):focus,.el-submenu__title:not(.is-disabled):hover {
    background: $back;
    color: $font;
  }
}
</style>
