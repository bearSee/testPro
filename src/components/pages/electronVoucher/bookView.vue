<template>
  <div class="bookView">
    <image-view
        :leftCustom="true"
        :downLoadParams="params"
        downloadAllUrl="/voucherMatch/batchDownloadVoucher"
        imageListUrl="/voucherMatch/view"
        >
        <template slot="leftCustom">
          <div class="leftCustom">
            <div class="bookId">分册编号:</div>
            <div class="bookId">{{bookCode}}</div>
            <el-tree :data="tree" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
          </div>
        </template>
    </image-view>
  </div>
</template>

<script type='text/javascript'>
import imageView from '../electronImage/imageView';

export default {
  name: 'bookView',
  components: {
    imageView,
  },
  data() {
    return {
      params: {},
      tree: [],
      bookId: this.$route.query.bookId,
      bookCode: this.$route.query.bookCode,
      defaultProps: {
        label: 'voucherNum',
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleNodeClick(data) {
      this.params = {
        voucherIds: data.voucherId,
        barCode: data.barcode,
      };
    },
    getList() {
      const bookId = this.$route.query.bookId;
      this.$http.post('/archiveBook/listVoucherByBookId', { bookId }).then(
        (res) => {
          this.tree = res.data.list;
          // this.params = res.data.list[0];
          this.params = { voucherIds: res.data.list[0].voucherId, barCode: res.data.list[0].barcode };
        },
        () => {},
      );
    },
  },
};
</script>

<style lang='scss'>
.bookView{
    .leftCustom{
    height: 100%;
    overflow: scroll;
    .bookId {
      overflow: hidden;
      padding-left: 24px;
      font-size: 16px;
      width: 100%;
      height: 30px;
      white-space : nowrap;
      text-overflow: clip;
      color: #909399;
      line-height: 30px;
      border-bottom: 1px solid #DCDFE6;
      background-color: #f9f9f9;
    }
    .el-tree {
      text-align: center;
      height: calc(100vh - 120px);
      background-color: #f9f9f9;
      .el-tree-node__content{
        padding: 20px 1px;
        text-align: center;
        border-bottom: 1px solid #EBEEF5;
        overflow: hidden;
      }
    }
  }
}
</style>
