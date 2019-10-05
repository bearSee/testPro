<template>
  <div class="organizationMessage">
      <div>
        <p>凭证查询：</p>
        <p>用于凭证信息查询。</p>
        <p>凭证管理监控表：</p>
        <p>用于管理凭证。</p>
        <p>凭证调拨记录：</p>
        <p>用于凭证调拨历史记录查询。</p>
        <p>凭证借阅记录：</p>
        <p>用于凭证借阅历史记录查询。</p>
        <p>特殊附件管理报表：</p>
        <p>用于附件管理。</p>
        <p>单据传递管理报表：</p>
        <p>用于单据管理。</p>
        <p>库位管理统计报表：</p>
        <p>用于管理库位。</p>
      </div>
  </div>
</template>

<script type='text/javascript'>

export default {
  name: 'organizationMessage',
  data() {
    return {

    };
  },
  mounted() {

  },
  methods: {

  },
};
</script>

<style lang='scss'>
.organizationMessage {
    height: 50%;
  div {
    position: fixed;
    height: 58%;
    width: 90%;
    // border: 1px solid #DCDFE6;
    padding: 0 5%;
    margin: 13px auto;
    text-align: left;
    p {
        line-height: 36px;
    }
    p:nth-child(odd) {
      color: #409EFF;
    }
    p:nth-child(even) {
      color: #909399;
    }
  }
}
</style>
