<template>
  <div class="voucher-ReviewComment">
    <zte-form
      disabled
      border
      size="mini"
      :rowSize="1"
      :labelWidth="120"
      :item-info="itemInfo"
      :form="form"
      :is-submit="false"
      :is-cancel="false">
    </zte-form>
    <!-- <zte-table
      ref="voucherReviewComment"
      index-style="selection"
      request-url="/voucherMatch/findVoucher"
      :table-column="tableColumn">
    </zte-table> -->
  </div>
</template>

<script>
export default {
  name: 'voucherReviewComment',
  components: {},
  props: {
    voucherId: String,
  },
  data() {
    return {
      itemInfo: [
        {
          code: 'voucherNum',
          label: '凭证编号',
          type: 'text',
        },
        {
          code: 'periodName',
          label: '会计期间',
          type: 'text',
        },
        {
          code: 'voucherTypeName',
          label: '凭证类型',
          type: 'text',
        },
        {
          code: 'userName',
          label: '制单人',
          type: 'text',
        },
        {
          code: 'voucherDate',
          label: '制单日期',
          type: 'text',
        },
        {
          code: 'barcode',
          label: '影像文件编号',
        },
        {
          code: 'updatedDt',
          label: '上传日期',
        },
      ],
      form: {},
      tableColumn: [
        {
          code: 'taskNum',
          label: '影像任务编号',
        },
        {
          code: 'fileNum',
          label: '影像文件编号',
        },
      ],
    };
  },
  created() {
    this.getDetailData();
  },
  methods: {
    getDetailData() {
      const params = {
        voucherId: this.voucherId,
      };
      this.$http.post('/voucherMatch/findVoucher', params).then(
        (res) => {
          res = res.data;
          if (res.voucherDate) {
            res.voucherDate = res.voucherDate.substring(0, 10);
          }
          this.form = res;
        },
        () => {},
      );
    },
  },
};
</script>


<style>

</style>
