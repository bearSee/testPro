<template>
  <div class="warpper">
    <div class="image">
      <img :src="png">

      <div class="btn-group">
        <el-button type="primary" round @click.native="back">{{$t('返回')}}</el-button>
        <el-button round @click.native="goHome">{{$t('首页')}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      png: `${window.location.protocol}//${window.location.host}/image/404.png`,
    };
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    goHome() {
      this.$router.push('/index');
    },
  },
};
</script>


<style lang="scss">
.warpper{
  height: 100%;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  .image {
    width: 800px;
    // position: relative;
    // top: 50%;
    // transform: translateY(-50%);

    img{
      max-width: 100%;
    }
  }

  .btn-group {
    padding: 2rem 0;
  }
}
</style>
