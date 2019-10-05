<template>
  <div class="master not-print">
    <el-container>
      <el-header class="top-header">
        <div class="portal-logo">
          <router-link :to="{ name: '主页', path: '/'}">
            <img class="image" src="../../assets/images/portal_logo.png">
          </router-link>
        </div>
        <ul class="header-left-list">
          <modules :modules="sysMenu" :baseUrl="baseUrl" service="archives" @openSystem="openSystem"></modules>
          <li class="userInfo">
            <img class="avatar" src="../../assets/images/avatar.png" alt="头像">
            <div>
              <p style="white-space: nowrap;">
                欢迎您，{{userName}}
                <!-- <el-button class="logout" size="large" type="text" @click.native="changeL">{{ $t('切换语言') }}</el-button> -->
                <span class="loginout"  @click="logout" title="点击退出"><span class="icon"><svg-icon iconClass="top-out"></svg-icon></span>退出</span>
              </p>
            </div>
          </li>
        </ul>
      </el-header>
      <el-container class="body">
        <el-aside :width="isCollapse ? '64px' : '180px'" class="aside-transition">
          <transition
            mode="out-in"
            name="menu-status-classes-transition"
            duration="300"
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut">
            <div class="menu-title" @click="isCollapse = !isCollapse">
              <div v-if="!isCollapse" class="title">{{$t('全部分类')}}</div>
              <template>
                <svg-icon v-if="!isCollapse" key="open" iconClass="menu-open" ></svg-icon>
                <svg-icon v-else key="close" iconClass="menu-close" ></svg-icon>
              </template>
            </div>
          </transition>
          <el-scrollbar class="menu-sroll">
            <el-menu
              class="menu-vertical"
              ref="menu"
              router
              unique-opened
              :collapse="isCollapse"
              :default-openeds="openedMenu"
              :default-active="activeMenu">
              <template v-for="(sub, index) in realMenu">
                <el-submenu :index="index.toString()" v-if="sub.children" :key="sub.name">
                  <template slot="title">
                    <svg-icon :icon-class="sub.icon"></svg-icon>
                    <span v-text="$t(sub.name)" slot="title"></span>
                  </template>
                  <el-menu-item
                    :title="$t(item.name)"
                    v-for="item in sub.children"
                    :key="item.name"
                    :index="item.path">
                    <span v-text="$t(item.name)" slot="title"></span>
                  </el-menu-item>
                </el-submenu>
                <el-menu-item
                  :title="$t(sub.name)"
                  :index="sub.path"
                  :key="sub.name"
                  v-else>
                  <span v-text="$t(sub.name)" slot="title"></span>
                </el-menu-item>
              </template>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-container class="master">
          <el-header height="32px" class="sub-header">
            <nav-tabs
              ref="navTabs"
              @active-change="handlerTabChange"
              @remove-route="handleNavRemove"
              @refresh="hanlderRefresh"
              @clearAll="clearAll">
            </nav-tabs>
          </el-header>
          <el-main class="container">
            <transition
              name="custom-classes-transition"
              enter-active-class="animated fadeInLeft"
              leave-active-class="animated fadeOutLeft">
              <!-- <el-scrollbar class="main-scollbar"> -->
                <div class="container">
                  <transition
                    name="portal-classes-transition"
                    enter-active-class="animated fadeInDown">
                    <!-- 内容部分 -->
                    <keep-alive :include="route">
                      <router-view v-if="$route.meta.keepAlive && renderFlag" ref="route">
                        <!--  这里是会被缓存的视图组件 -->
                      </router-view>
                    </keep-alive>
                  </transition>
                  <transition
                    name="portal-classes-transition"
                    enter-active-class="animated fadeInDown">
                    <router-view v-if="!$route.meta.keepAlive && renderFlag" ref="route">
                    </router-view>
                  </transition>
                </div>
              <!-- </el-scrollbar> -->
            </transition>
          </el-main>
        </el-container>
      </el-container>
      <el-footer>
        <p>Copyright © 2015-2020 中兴新云版权所有. IE(Version 11)/Chrome/Firefox</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script type="text/javascript">
import modules from '@/components/modules/modules';
import navTabs from '@/components/modules/nav-tabs';
import { mapState, mapMutations } from 'vuex';
import i18n from '../../mixins/i18n';


export default {
  name: 'master',
  mixins: [i18n],
  components: { navTabs, modules },
  data() {
    return {
      cdn: `${window.location.protocol}//${window.location.host}/image`,
      isCollapse: false,
      messageNum: 0,
      popNotice: null,
      route: [],
      renderFlag: true,
      userName: window.localStorage.getItem('userName'),
      // 头部跳转系统config
      baseUrl: '',
      sysMenu: [
        {
          code: 'XY_archives_09000_F000000',
          configurationPlatform: '1',
          groupId: 'accba517-5725-4fae-8938-48946676bfc1',
          icon: 'top-archives',
          id: '80842916-3f5a-9a88-e053-0100007f5761',
          language: 'zh-CN',
          modules: 'archives',
          name: '档案系统',
          orderNum: 7,
          type: 3,
          url: '/archives/#/index',
        },
      ], // 系统权限菜单,
    };
  },
  computed: {
    ...mapState({
      realMenu: state => state.menuList,
    }),
    defaultOpen() {
      return this.$route;
    },
    openedMenu() {
      let openedMenu;
      for (const menu of this.activeMenu) {
        if (menu.children && menu.children.length) {
          for (const sub of menu.children) {
            if (sub.url === this.activeMenu) {
              openedMenu = [menu.name];
              break;
            }
          }
        }
      }
      return openedMenu;
    },
    activeMenu() {
      return this.$route.fullPath;
    },
  },
  watch: {
    /* eslint-disable */
    '$route' (to) {
      // 将当前打开路由加入到keepAlive的include中
      this.setAliveRoute(to);
      this.$refs.navTabs.add(to);
    },
  },
  methods: {
    ...mapMutations([
      'setLogout',
    ]),
    changeL() {
      const lange = this.$i18n.locale === 'zh-CN' ? 'en-US' : 'zh-CN';
      this.toSwitchLanguage(lange);
    },
    handlerTabChange(tab) {
      const path = tab && tab.path || '/index';
      this.$router.push(path);
    },
    handleNavRemove(tab) {
      // 将tab页签关闭的路由从keepAlive的include中移除
      if (tab.matched && tab.matched.length) {
        const routeIndex = this.route.findIndex(
          name => tab.matched[tab.matched.length - 1].components.default.name === name);
        this.route.splice(routeIndex, 1);
      }
    },
    clearAll() {
      this.route = [];
    },
    hanlderRefresh() {
      // 通过renderFlag 强制re-render router-view中的组件
      this.renderFlag = false;
      this.handleNavRemove(this.$route);
      this.$nextTick(() => {
        this.renderFlag = true;
        this.setAliveRoute(this.$route);
      });
    },
    async logout() {
      await this.$http.post('/init/logout').then(
        () => {
          this.$message({
            message: this.$t('注销成功！'),
            type: 'success',
          });
          this.setLogout();
        },
        () => {},
      );
      this.$router.push('/');
    },
    setAliveRoute(to) {
      if (to.matched && to.matched.length && to.matched[to.matched.length - 1].components.default.name) {
        const routeName = to.matched[to.matched.length - 1].components.default.name;
        if (this.route.indexOf(routeName) === -1) {
          this.route.push(routeName);
        }
      }
    },
    // 获取头部系统名称
    getSysConfig() {
      this.$http.post('/personal/listAuthSystem', {}).then(
        ({ data }) => {
          this.sysMenu = data.list;
          this.baseUrl = data.url;
        },
        () => {},
      );
    },
    openSystem(url) {
      this.$http.post('/init/getEasSessionId', {}).then(
        ({ data }) => {
          const { language, userInfo, sessionId } = data;
          this.$cookies.set('ZTESSCAUTH', sessionId, '0', '/');
          if (language) this.$cookies.set('user_language', language, '0', '/');
          if (userInfo) this.$cookies.set('userInfo', JSON.stringify(userInfo), '0', '/');
          window.open(url);
        },
        () => {},
      );
    },
  },
  created() {
    this.getSysConfig();
  },
};
</script>

<style lang="scss" src='../../assets/scss/style.scss'></style>
<style lang="scss" src='../../assets/scss/theme.scss'></style>
<style lang="scss">
@import "../../assets/scss/theme.scss";
@media print {
  .not-print {
    display: none;
  }
}
.master {
  .el-header {
    padding: 0;
    background-color:#fff;
    position: relative;
    color: #fff;
    &.top-header {
      background-color: $theme;
      height: 55px!important;
      .portal-logo {
        width: 250px;
        height: 3rem;
        padding: 10px 20px;
        .image {
          padding-bottom: 6px;
          height: 40px;
        }
      }
      .header-left-list {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        display: flex;
        margin-right: 10px;
        width: calc(100% - 210px);
        justify-content: flex-end;
        overflow: hidden;
        .modules {
          display: flex;
          justify-content: flex-end;
        }
        li.userInfo {
          padding: 0 10px 0 20px;
          display: flex;
          align-items: center;
          cursor: default;
          background: url(../../assets/images/line.png) 0 0 no-repeat;
          .avatar {
            width: 30px;
            height: 30px;
            margin-right: 4px;
          }
          div {
            text-align: left;
            font-size: 14px;
            line-height: 18px;
            .loginout {
              cursor: pointer;
            }
            .icon {
              margin: 0 4px 0 10px;
              .svg-icon {
                width: 0.9rem;
                height: 0.9rem;
              }
            }
          }
        }
      }
    }
  }
  .el-container.body {
    height: calc(100vh - 55px);
    background-color: #f9fcfe;
    .el-container.master {
      width: calc(100% - 180px);
    }
  }

  .el-aside.aside-transition {
    height: 100%;
    background-color: #fff;
    flex-flow: column nowrap;
    .menu-title {
      border-bottom: 1px solid #f4f4f4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      padding: 0 20px;
      color: $theme;
      font-weight: 600;
      font-size: 18px;
      .svg-icon {
        font-size: 30px;
      }
    }
    .menu-sroll.el-scrollbar {
      height: calc(100% - 50px);
      .el-scrollbar__wrap {
        overflow-x: hidden;
        .menu-vertical.el-menu {
          border-right: none;
          font-weight: 700;
        }
        .is-opened{
          .el-submenu__title{
            color: $dark;
          }
        }
        .el-menu--inline{
          font-weight: 500;
          .is-active{
            background-color: $light;
            color: #fff;
          }
        }
      }
    }
  }

  .el-header.sub-header {
    margin: 10px 0 3px 0;
    padding: 0 15px;
  }

  .el-main.container {
    overflow: hidden;
    padding: 0 15px 20px 15px;
    .container {
      height: 100%;
      &>div {
        width: 100%;
        height: 100%;
      }
    }
    .main-scollbar {
      height: 100%;
      .el-scrollbar__view {
        height: 100%;
        .container {
          height: 100%;
          &>div {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
  .el-footer{
    z-index: 2150;;
    background-color: $theme;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 20px !important;
    color: #fff;
    font-size: 14px;
    p{
      width: 100%;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%)
    }
  }
}
@media print {
  .not-print {
    display: none;
  }
}
</style>
