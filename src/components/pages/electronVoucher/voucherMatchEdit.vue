<template>
  <div class="voucher-match-edit">
    <zte-table
      request-url="/voucherMatch/listImageInfo"
      :row-size="2"
      :search-info="searchInfo"
      :params="params"
      :table-column="tableColumn">
      <template slot="operate" slot-scope="{ row }">
        <el-button
          type="text"
          size="mini"
          @click.native="handlerConfirm(row)">
          {{ $t('匹配') }}
        </el-button>
      </template>
    </zte-table>
  </div>
</template>

<script>
export default {
  name: 'voucherMatchEdit',
  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      searchInfo: [
        {
          label: '影像任务编号',
          code: 'imageNumber',
          type: 'text',
        },
        {
          label: '上传时间',
          code: 'uploadDate',
          type: 'text',
          placeholder: '上传时间，格式为yyyy-mm-dd',
        },
      ],
      tableColumn: [
        {
          label: '影像任务编号',
          code: 'imageNumber',
        },
        {
          label: '上传时间',
          code: 'uploadDate',
          type: 'text',
        },
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
          width: '100',
        },
      ],
      selectedRows: [],
    };
  },
  methods: {
    handlerConfirm(row) {
      this.$emit('confirm', row.imageNumber);
    },
  },
};
</script>

<style>
.voucher-match-edit {}
</style>
