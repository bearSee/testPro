<template>
  <div class="archiv-transfer">
    <zte-table
      ref="archiveTransfer"
      index-style="selection"
      request-url="/archiveAllot/list"
      :row-size="3"
      excelUrl="/archiveAllot/excelDownload"
      :buttonList="{ excel: true }"
      :search-info="searchConfig"
      :table-column="tableColumn"
      @search="search">
      <template slot="moreOperate">
        <el-button size="mini" icon="el-icon-plus"  @click.native="addTransferDialogVisible = true">{{ $t('调拨') }}</el-button>
      </template>
      <div slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="handlerBatchPrint(rows)">{{ $t('打印调拨条码') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native.stop="viewArchive(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="small" @click.native="modifyArchive(row)" :disabled="row.allotStatus === 'ALREADY_RECEIVE'">{{ $t('修改') }}</el-button>
        <el-button type="text" size="small" @click.native="revokeArchive(row)" :disabled="row.allotStatus !== 'NOW_FLITTING'">{{ $t('撤销') }}</el-button>
      </template>
    </zte-table>

    <!-- 修改调拨弹窗 -->
    <el-dialog
      class="transferDialog"
      :modal="false"
      :modal-append-to-body="false"
      :title="$t('按册调拨')"
      v-if="transferDialogVisible"
      :visible.sync="transferDialogVisible"
      @close='closeTransferDialog'>
      <archive-transfer-add
        :isAddAllot="false"
        ref="archiveTransferAdd"
        requestUrl="/archiveAllot/listAllotBooks"
        :allotIdParams="allotIdParams"
        @transfer-success='transferSuccess'
        @back="transferDialogVisible = false">
      </archive-transfer-add>
    </el-dialog>

    <!-- 新增调拨弹窗 -->
    <el-dialog
      class="transferDialog"
      :modal="false"
      :modal-append-to-body="false"
      :title="$t('新增调拨')"
      v-if="addTransferDialogVisible"
      :visible.sync="addTransferDialogVisible">
      <archive-transfer-add
        ref="archiveTransferEidt"
        @transfer-success='transferSuccess'
        @back="addTransferDialogVisible = false">
      </archive-transfer-add>
    </el-dialog>

    <!-- 条码-->
    <el-dialog
      fullscreen
      class="allot-number"
      :title="$t('调拨编号')"
      :append-to-body="true"
      :visible.sync="barcodeDialogVisible">
      <barcode
        class="barcode"
        v-for="item in printData"
        :key="item.allotNum"
        :value="item.allotNum"
        :text="item.allotNum"
        :width="2"
        :height="50"
        :text-margin="2"
        font-options=""
        :font-size="15"
        :margin="10"
        text-position="bottom"
        lineColor="#000000">
      </barcode>
      <el-button style="margin-bottom: 40px;" class="not-print" @click.native="printPage">{{$t('打印')}}</el-button>
    </el-dialog>

    <!-- 调拨记录弹窗 -->
    <el-dialog
      width="80%"
      :title="$t('调拨记录')"
      :visible.sync="recordDialogVisible">
      <archive-transfer-record
        :archiveParams="archiveParam"
        :allotParams="allotParam">
      </archive-transfer-record>
    </el-dialog>
  </div>
</template>

<script>
import archiveTransferAdd from './archiveTransferAdd';
import archiveTransferRecord from './archiveTransferRecord';
import barcode from '../../../es/barcodeUtil';
import compare from '../../../es/utils';

export default {
  name: 'archiveTransfer',
  components: {
    archiveTransferAdd,
    archiveTransferRecord,
    barcode,
  },
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
          code: 'allotBy',
          label: '调拨人',
          showLabel: 'employeeName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'allotBy',
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
        //   label: '调拨起始日期',
        //   type: 'date',
        // },
        // {
        //   code: 'endAllotDate',
        //   label: '调拨截止日期',
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
        },
        {
          code: 'allotName',
          label: '调拨人',
        },
        {
          code: 'allotDate',
          label: '调拨日期',
        },
        {
          code: 'allotStatusValue',
          label: '状态',
        },
      ],
      transferDialogVisible: false,
      addTransferDialogVisible: false,
      recordDialogVisible: false,
      barcodeDialogVisible: false,
      allotIdParams: {},
      printData: [],
      archiveParam: {},
      allotParam: {},
    };
  },
  methods: {
    modifyArchive(row) {
      this.allotIdParams = { allotHeaderId: row.id };
      this.transferDialogVisible = true;
    },
    viewArchive(row) {
      this.archiveParam = { allotHeaderId: row.id, allotNum: row.allotNum };
      this.allotParam = { objectCode: row.id };
      this.recordDialogVisible = true;
    },
    // 档案撤销
    revokeArchive(row) {
      const params = { allotHeaderId: row.id };
      this.$http.post('/archiveAllot/revokeAllotRecord', params).then(
        (res) => {
          res = res.data;
          if (res.ok) {
            this.$refs.archiveTransfer.getTableData();
            this.$message.success(this.$t('撤销成功'));
          }
        },
        () => {},
      );
    },
    // 批量打印
    handlerBatchPrint(rows) {
      if (rows.length) {
        this.printData = rows;
        this.barcodeDialogVisible = true;
      } else {
        this.$message.warning(this.$t('请勾选至少一条数据！'));
      }
    },
    printPage() {
      window.print();
    },
    search(form) {
      const bool = compare(form.startAllotNum, form.endAllotNum);
      if (!bool) {
        this.$message.warning(this.$t('截止调拨编号不可小于起始调拨编号!'));
      }
    },
    // 关闭调拨组件
    closeTransferDialog() {
      this.$refs.archiveTransfer.getTableData();
      this.$refs.archiveTransferAdd.clearData();
    },
    // 调拨成功
    transferSuccess() {
      this.transferDialogVisible = false;
      this.$refs.archiveTransfer.getTableData();
    },
  },
};
</script>

<style lang="scss">
.archiv-transfer {
  position: relative;
  .transferDialog {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    .el-dialog {
      height: 100%;
      width: 100%;
      border-radius: 0;
      .el-dialog__header {
        border-radius: 0;
        margin-bottom: 10px;
      }
      .el-dialog__body {
        max-height: 100vh;
        height: calc(100% - 50px);
        padding-bottom: 0;
        .archive-transfer-add {
          height: 100%;
          .volume-Append {
            padding-bottom: 10px;
          }
          .table-body {
            margin-top: 15px;
          }
        }
      }
    }
  }
}
.allot-number .el-dialog__body {
  text-align: center;
  .barcode {
    text-align: center;
  }
}
.archiv-transfer {
  .volume-Append {
      padding: 0px 0px 20px 0px;
  }
}
</style>
