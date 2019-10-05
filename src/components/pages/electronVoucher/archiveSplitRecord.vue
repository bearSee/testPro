<template>
  <div class="archive-split-record">
    <zte-table
      request-url="/archiveBook/listVoucherByBookId"
      layout="total, prev, pager, next"
      :pageSize="5"
      :params="params"
      :tableColumn="voucherColumn">
      <template slot="content">
        {{ $t('分册编号')+ '：' + recordSerialNum }}
      </template>
    </zte-table>
    <zte-table
      request-url="/archiveBook/listVoucherHistoryByBook"
      layout="total, prev, pager, next"
      :pageSize="5"
      :params="params"
      :tableColumn="recordColumn">
      <template slot="content">
        {{ $t('分册历史记录') }}
      </template>
    </zte-table>
  </div>
</template>

<script>
export default {
  name: 'archiveSplitRecord',
  props: {
    recordSerialNum: {
      type: String,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // 查看分册凭证
      voucherColumn: [
        {
          code: 'voucherNum',
          label: '凭证编号',
        },
        {
          code: 'voucherTypeName',
          label: '凭证类型',
        },
        {
          code: 'companyName',
          label: '结算单位',
        },
        {
          code: 'periodName',
          label: '会计期间',
        },
        {
          code: 'userName',
          label: '制单人',
        },
        {
          code: 'userDate',
          label: '制单日期',
          type: 'date',
        },
        {
          code: 'approverName',
          label: '复核人',
        },
        {
          code: 'approverDate',
          label: '复核日期',
          type: 'date',
        },
        {
          code: 'voucherStatusName',
          label: '凭证状态',
        },
      ],
      // 历史记录
      recordColumn: [
        {
          code: 'employeeName',
          label: '处理人',
        },
        {
          code: 'handleAction',
          label: '处理动作',
        },
        {
          code: 'handleDate',
          label: '处理时间',
        },
        {
          code: 'bookStatus',
          label: '分册状态',
        },
      ],
    };
  },
};
</script>

<style>
.archive-split-recore {}
</style>
