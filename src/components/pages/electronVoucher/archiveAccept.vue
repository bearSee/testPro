<template>
  <div class="archive-accept">
    <zte-table
      ref="archiveAccept"
      index-style="selection"
      request-url="/archiveReceive/list"
      excelUrl="/archiveReceive/excelDownload"
      :row-size="3"
      :buttonList="buttonList"
      :search-info="searchConfig"
      :table-column="tableColumn"
      :selectable="selectable"
      @search="search">
      <div slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="handlerBatchAccept(rows)">{{ $t('批量接收') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click="watch(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="mini" @click="accept(row)" :disabled="row.allotStatus === 'ALREADY_RECEIVE' || row.allotStatus === 'ALREADY_RETURN'">{{ $t('接收') }}</el-button>
        <el-button type="text" size="mini" @click="giveBack(row)" :disabled="row.allotStatus === 'ALREADY_RECEIVE' || row.allotStatus === 'ALREADY_RETURN'">{{ $t('退回') }}</el-button>
      </template>
    </zte-table>

    <!-- 查看弹窗 -->
    <el-dialog
      fullscreen
      style="margin-bottom:20px;"
      :title="$t('调拨记录')"
      :visible.sync="viewVisible">
      <zte-table
        index-style="index"
        request-url="/archiveAllot/listAllotBooks"
        :params="view.firstParams"
        :table-column="view.firstColumn">
        <template slot="voucherNum" slot-scope="{ row }">
          <el-button type="text" size="small" @click.native="viewImage(row)">{{ row.voucherNum }}</el-button>
        </template>
        <div slot="content">
          <span size="small" class="headText">{{ $t('调拨编号') + '：' + view.allotNum }}</span>
        </div>
      </zte-table>
      <zte-table
        index-style="index"
        request-url="/archiveAllot/listAllotHeaderHistory"
        :params="view.secondParams"
        :table-column="view.secondColumn">
        <div slot="content">
          <span size="small" class="headText">{{ $t('调拨历史记录') }}</span>
        </div>
      </zte-table>
      <el-button style="margin:20px 0 40px 0;" size="small" @click="viewVisible=false">{{$t('返回')}}</el-button>
    </el-dialog>
  </div>
</template>

<script>
import compare from '../../../es/utils';

export default {
  name: 'archiveAccept',
  data() {
    return {
      searchConfig: [
        {
          code: 'startAllotNum',
          label: '开始调拨编号',
          type: 'text',
        },
        {
          code: 'endAllotNum',
          label: '截止调拨编号',
          type: 'text',
        },
        {
          code: 'allotEmployeeId',
          label: '调拨人',
          type: 'table',
          showLabel: 'allotByName',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'allotByName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'allotEmployeeId',
              from: 'ID',
            },
          ],
        },
        {
          code: 'allotDate',
          label: '调拨起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'startAllotDate',
          endCode: 'endAllotDate',
          type: 'daterange',
        },
        // {
        //   code: 'startAllotDate',
        //   label: '起始调拨日期',
        //   type: 'date',
        // },
        // {
        //   code: 'endAllotDate',
        //   label: '终止调拨日期',
        //   type: 'date',
        // },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 160,
        },
        {
          code: 'allotNum',
          label: '调拨编号',
          width: 200,
        },
        {
          code: 'allotName',
          label: '调拨人',
          width: 90,
        },
        {
          code: 'allotDate',
          label: '调拨日期',
          width: 150,
        },
        {
          code: 'receivename',
          label: '接收人',
          width: 90,
        },
        {
          code: 'receiveDate',
          label: '接收日期',
          width: 150,
        },
        {
          code: 'allotDesc',
          label: '调拨说明',
          width: 150,
        },
        {
          code: 'allotStatusValue',
          label: '调拨状态',
          width: 70,
        },
      ],
      viewVisible: false,
      view: {
        firstParams: {},
        secondParams: {},
        allotNum: '',
        firstColumn: [
          {
            label: '分册编号',
            code: 'bookCode',
          },
          {
            label: '结算单位',
            code: 'companyName',
          },
          {
            label: '会计期间',
            code: 'periodName',
          },
          {
            label: '分册人',
            code: 'bookEmployeeName',
          },
          {
            label: '分册日期',
            code: 'bookDate',
          },
          {
            label: '状态',
            code: 'bookStatusValue',
          },
        ],
        secondColumn: [
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
      },
      // 导出excel
      buttonList: {
        excel: true,
      },
      returnBtnloading: false,
    };
  },
  methods: {
    watch(row) {
      this.view.allotNum = row.allotNum;
      this.view.firstParams = {
        allotHeaderId: row.id,
      };
      this.view.secondParams = {
        objectCode: row.id,
      };
      this.viewVisible = true;
    },
    handlerBatchAccept(rows) {
      if (rows.length) {
        const allotIds = rows.map(data => data.id);
        const params = {
          allotHeaderId: allotIds.join(','),
          // allotNum: data.allotNum,
        };
        this.$http.post('/archiveReceive/archiveReceive', params).then(
          () => {
            this.$message.success(this.$t('接收成功'));
            this.$refs.archiveAccept.getTableData();
          },
          () => {},
        );
        return;
      }
      this.$message.warning(this.$t('请勾选至少一条数据'));
    },
    accept(row) {
      this.acceptAndBack(row, '/archiveReceive/archiveReceive', '接收成功');
    },
    giveBack(row) {
      if (this.returnBtnloading) {
        return;
      }
      this.returnBtnloading = true;
      this.acceptAndBack(row, '/archiveReceive/archiveReject', '回退成功');
    },
    acceptAndBack(data, url, msg) {
      this.view.firstParams = {
        allotHeaderId: data.id,
        // allotNum: data.allotNum,
      };
      this.$http.post(url, this.view.firstParams).then(
        () => {
          this.$message.success(this.$t(msg));
          this.$refs.archiveAccept.getTableData();
          if (this.returnBtnloading) {
            this.setloadingWaitTimeout();
          }
        },
        () => {
          if (this.returnBtnloading) {
            this.setloadingWaitTimeout();
          }
        },
      );
    },
    setloadingWaitTimeout() {
      setTimeout(() => {
        this.returnBtnloading = false;
      }, 2000);
    },
    selectable(row) {
      return row.allotStatus !== 'ALREADY_RECEIVE' && row.allotStatus !== 'ALREADY_RETURN';
    },
    search(form) {
      const bool = compare(form.startAllotNum, form.endAllotNum);
      if (!bool) {
        this.$message.warning(this.$t('截止调拨编号不可小于起始调拨编号!'));
      }
    },
  },
};
</script>

<style>

</style>
