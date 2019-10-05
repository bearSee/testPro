<template>
  <div class="archive-transfer-record">
    <zte-table
      request-url="/archiveAllot/listAllotBooks"
      layout="total, prev, pager, next"
      :pageSize="5"
      :params="archiveParams"
      :tableColumn="archiveColumn">
      <template slot="content">
        {{ $t('调拨单号') }}：{{archiveParams.allotNum}}
      </template>
    </zte-table>
    <zte-table
      request-url="/archiveAllot/listAllotHeaderHistory"
      layout="total, prev, pager, next"
      :pageSize="5"
      :params="allotParams"
      :tableColumn="recordColumn">
      <template slot="content">
        {{ $t('调拨历史记录') }}
      </template>
    </zte-table>
  </div>
</template>

<script>
export default {
  name: 'archiveTransferRecord',
  props: {
    archiveParams: {
      type: Object,
      default: () => ({}),
    },
    allotParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      archiveRecordParam: {},
      allotRecordParam: {},
      archiveColumn: [
        {
          label: '分册编号',
          code: 'bookCode',
          width: 130,
        },
        {
          label: '结算单位',
          code: 'companyName',
          width: 200,
        },
        {
          label: '会计期间',
          code: 'periodName',
          width: 100,
        },
        {
          label: '分册人',
          code: 'bookEmployeeName',
          width: 100,
        },
        {
          label: '分册日期',
          code: 'bookDate',
          width: 120,
        },
        {
          label: '状态',
          code: 'bookStatusValue',
          width: 100,
        },
      ],
      recordColumn: [
        {
          label: '处理人',
          code: 'opPeopleName',
        },
        {
          label: '处理动作',
          code: 'handleAction',
        },
        {
          label: '处理时间',
          code: 'handleDate',
        },
        {
          label: '调拨地点',
          code: 'address',
        },
        {
          label: '调拨说明',
          code: 'allotDesc',
        },
      ],
    };
  },
};
</script>

<style>
.archive-transfer-record {}
</style>
