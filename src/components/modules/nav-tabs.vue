<template>
  <div class="nav-tabs">
    <transition-group name="list-complete" class="tab-list" ref="navTab">
      <span
        v-for="(tab, index) of currentTabs"
        :key="tab.path.replace('/', '')"
        class="list-complete-item"
        :class="activeIndex === index ? 'is-active': ''">
        <el-button
          :type="index === activeIndex ? 'primary' : 'default'"
          round
          @click.native="handlerClick(tab, index)">
          {{$t(tab.name)}}
        </el-button>
        <el-badge class="badge" @click.native="remove(tab, index)">
          <i class="el-icon-error"></i>
        </el-badge>
      </span>
      <el-popover
        key="more"
        width="200"
        popper-class="hidden-tabs-popup"
        v-if="tabsLen > maxLen"
        placement="bottom-end"
        trigger="hover">
        <ul class="hidden-list">
          <li
            v-for="(tab, index) of hiddenTabs"
            :key="tab.path.replace('/', '')"
            class="list-complete-item"
            :data-index="index + maxLen"
            :class="{active: (index + maxLen) === activeIndex}"
            @click="handlerClick(tab, index + maxLen)">
            <span class="name">
              {{$t(tab.name)}}
            </span>
            <span class="close el-icon-close" @click.stop="remove(tab, index + maxLen)"></span>
          </li>
        </ul>
        <span
          slot="reference"
          class="is-more">
          <el-button round :type="activeIndex >= maxLen ? 'primary' : 'default'">{{$t('更多')}}</el-button>
        </span>
      </el-popover>
    </transition-group>
    <span class="quick-operate">
      <i class="icon el-icon-menu" @click="gotoIndex"></i>
      <i class="icon el-icon-refresh" @click="handlerRefresh"></i>
      <i class="icon el-icon-circle-close-outline" @click="hanlerClear"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'navTabs',
  data() {
    return {
      tabs: [],
      activeIndex: 0,
    };
  },
  computed: {
    tabsLen() {
      return this.tabs.length;
    },
    maxLen() {
      let length = 100;
      const tabWidth = (this.$refs.navTab && this.$refs.navTab.$el && this.$refs.navTab.$el.scrollWidth) || 1000;
      const maxWidth = tabWidth - 74;
      // let width = 0;
      // for (const index in this.tabs) {
      //   const tab = this.tabs[index];
      //   width += this.getTabWidth(tab.name.length);
      //   if (width > maxWidth) {
      //     length = parseInt(index);
      //     return length;
      //   }
      // }
      this.tabs.reduce((prev, cur, index) => {
        const total = prev + this.getTabWidth(cur.name.length);
        if (prev <= maxWidth && total >= maxWidth) {
          length = parseInt(index);
        }
        return total;
      }, 0);
      return length;
    },
    currentTabs() {
      const tabs = this.tabs.slice(0, this.maxLen);
      return tabs;
    },
    hiddenTabs() {
      let tabs = [];
      if (this.tabsLen > this.maxLen) {
        tabs = this.tabs.slice(this.maxLen, this.tabsLen);
      }
      return tabs;
    },
  },
  created() {
    this.add(this.$route);
    window.onresize = () => {
      this.tabs.push({ name: '', path: '/' });
      this.$nextTick(() => {
        this.tabs.splice(this.tabsLen - 1, 1);
      });
    };
  },
  watch: {
    // activeIndex(val) {
    //   if (val > -1) {
    //     const tab = this.tabs[val];
    //     this.$emit('active-change', tab);
    //   }
    // },
  },
  methods: {
    add(tab) {
      if (this.tabs.some(t => t.path === tab.path)) {
        this.activeIndex = this.tabs.findIndex(t => t.path === tab.path);
        return;
      }
      // this.tabs.push(tab);
      // this.activeIndex = this.tabsLen - 1;
      this.tabs.unshift(tab);
      this.activeIndex = 0;
    },
    remove(tab, index) {
      // if (tab.meta) {
      //   tab.meta.keepAlive = false;
      // } else {
      //   tab.meta = { keepAlive: false };
      // }
      this.$emit('remove-route', tab);
      this.tabs.splice(index, 1);
      if (this.activeIndex > index) {
        this.activeIndex--;
      } else if (this.activeIndex === index) {
        if (index > 0) {
          this.activeIndex--;
        }
        const newTab = this.tabs[this.activeIndex];
        this.$emit('active-change', newTab);
      }
    },
    handlerClick(tab, index) {
      this.activeIndex = index;
      this.$emit('active-change', tab);
    },
    gotoIndex() {
      this.$router.push('/index');
    },
    handlerRefresh() {
      this.$emit('refresh');
    },
    hanlerClear() {
      this.$confirm(`您即将关闭${this.tabsLen}个标签, 是否继续?`, this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        this.tabs = [];
        this.$router.push('/index');
        this.$emit('clearAll');
      }).catch();
    },
    getTabWidth(len) {
      const fontWidth = this.$i18n.locale === 'zh-CN' ? 14 : 9;
      const padding = 30 * 2;
      const margin = 15;
      const width = len * fontWidth + padding + margin;
      return width;
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";

.nav-tabs {
  width: 100%;
  .tab-list {
    width: calc(100% - 138px);
    display: inline-block;
    position: relative;
    margin-right: 10px;

    .el-button {
      box-shadow: 0 7px 9px 0 rgba(#00579a, .08);
      border: 0;
    }

    .is-more {
      position: absolute;
      top: 0;
      right: 0;
      .el-button {
        padding: 6px 23px;
        margin : 3px;
      }
    }
  }
  .list-complete-item {
    display: inline-block;
    position: relative;
    margin-right: 15px;
    transition: all .3s;

    .el-button {
      height: 32px;
      padding: 2px 30px;
    }

    .el-badge {
      position: absolute;
      // width: 16px;
      // height: 16px;
      top: -4px;
      right: 0;
      cursor: pointer;

      .el-icon-error {
        border-radius: 50%;
        background-color: #fff;
        color: $theme;
      }
    }

    &.is-active {
      .el-icon-error {
        background-color: $theme;
        color: #fff;
      }
    }
  }
  .list-complete-enter, .list-complete-leave-to
  /* .list-complete-leave-active for below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
  .list-complete-leave-active {
    position: absolute;
  }

  .quick-operate {
    display: flex;
    width: 100px;
    height: 28px;
    padding: 0 10px;
    background-color: #e9e9e9;
    color: #000;
    border-radius: 18px;
    float: right;
    box-shadow: 0 7px 9px rgba(#00679a, .04);
    justify-content: space-around;
    align-items: center;

    .icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      cursor: pointer;
    }
  }
}
.hidden-tabs-popup {
  // background-color: transparent;
  .list-complete-item {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      color: $theme;
    }

    &.active {
      color: $theme;
    }
  }
}
</style>
