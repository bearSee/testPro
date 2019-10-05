<template>
  <div class="borrowProcessing">
    <zte-table
      ref="borrowProcessing"
      request-url="/borrowProcessing/listNeedDoApprove"
      excelUrl="/borrowProcessing/jyclExportExcel"
      :buttonList="buttonList"
      index-style="selection"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn"
      @row-check="select">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.stop.native="view(row)">{{$t('查看')}}</el-button>
        <el-button :disabled="row.archivesStatus!=='ARCHIVES_WAIT_REVERT'" type="text" size="mini" @click.stop.native="giveBack(row)">{{$t('归还')}}</el-button>
        <el-button :disabled="row.archivesStatus!=='ARCHIVES_ALREADY_APPROVE'" type="text" size="mini" @click.stop.native="invalid(row)">{{$t('作废')}}</el-button>
        <el-button type="text" size="mini" @click.stop.native="watchHistory(row)">{{$t('操作记录')}}</el-button>
      </template>
      <!-- 表头按钮部分 -->
      <div slot="content">
        <el-button size="small" @click.native="allByCredential">{{ $t('批量按凭证领用') }}</el-button>
        <el-button size="small" @click.native="allByCopie">{{ $t('批量按册领用') }}</el-button>
        <el-button size="small" @click.native="allGiveBack">{{ $t('批量归还') }}</el-button>
        <el-button size="small" @click.native="allPrint">{{ $t('批量打印') }}</el-button>
      </div>
    </zte-table>

    <!-- 查看 -->
    <el-dialog
      fullscreen
      style="margin-bottom:20px;"
      :title="$t('借阅记录')"
      :visible.sync="viewVisible"
      :close-on-press-escape="false"
      @closed="whenClosed">
      <borrow-dialog-view
        :rowSize="2"
        :itemInfo="viewData.itemInfo"
        :form="viewData.form"
        :tableColumn="viewData.tableColumn"
        :tableData="viewData.tableData"
        :uploadData="viewData.uploadData"
        @closeDialog="closeDialog">
      </borrow-dialog-view>
    </el-dialog>
    <!-- 审批流程弹窗 -->
    <el-dialog
      custom-class="customDialog"
      :title="$t('操作记录')"
      historyVisible
      :visible.sync="historyVisible">
      <zte-table
        request-url="/borrowProcessing/getErsApplyHistorie"
        index-style="index"
        :table-column="historyTableColumn"
        :params="historyParams">
        <div slot="content">
          <span size="small" class="headText">{{ $t('审批流程信息') }}</span>
        </div>
      </zte-table>
    </el-dialog>
    <!-- 归还/领用 -->
    <el-dialog
      class="dialogPublic"
      width="35%"
      :title="$t(dialogPublicData.title)"
      :visible.sync="publicVisible">
      <zte-form
        size="mini"
        :item-info="dialogPublicData.searchInfo"
        @submit="submit">
      </zte-form>
    </el-dialog>
    <!-- 打印弹窗 -->
    <el-dialog
      custom-class="printDialog"
      fullscreen
      append-to-body
      v-if="printVisible"
      :visible.sync="printVisible">
      <print-table
       :printData="allCollectRow"
       @back="closePrint">
      </print-table>
    </el-dialog>

  </div>
</template>

<script type='text/javascript'>
import borrowDialogView from '../../modules/borrow-dialog-view';
import printTable from './printTable';

export default {
  name: 'borrowProcessing',
  components: {
    borrowDialogView,
    printTable,
  },
  data() {
    return {
      collectRow: [],
      // 搜索框信息
      searchConfig: [
        {
          code: 'applyNum',
          label: '申请单号',
          type: 'text',
        },
        {
          code: 'applyEmployeeId',
          label: '申请人',
          type: 'table',
          showLabel: 'applyEmployeeName',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'applyEmployeeName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'applyEmployeeId',
              from: 'ID',
            },
          ],
        },
        {
          code: 'companyId',
          label: '公司名称',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyId',
              from: 'ID',
            },
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
          ],
        },
        {
          code: 'applyDate',
          label: '申请起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'applyDateBegin',
          endCode: 'applyDateEnd',
          type: 'daterange',
        },
        {
          code: 'giveBackDate',
          label: '归还起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'giveBackDateBegin',
          endCode: 'giveBackDateEnd',
          type: 'daterange',
        },
        {
          code: 'useDate',
          label: '领用起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'useDateBegin',
          endCode: 'useDateEnd',
          type: 'daterange',
        },
        {
          code: 'archivesStatus',
          label: '借阅状态',
          type: 'select',
          options: [],
          fastCode: 'USE_STATUS',
        },
      ],
      // 页面table的表头信息
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 210,
        },
        {
          code: 'applyNum',
          label: '申请单号',
          width: 230,
        },
        {
          code: 'applyEmployeeName',
          label: '申请人',
          width: 100,
        },
        {
          code: 'applyDate',
          label: '申请日期',
          width: 150,
        },
        {
          code: 'applyDesc',
          label: '申请原因',
          width: 150,
        },
        {
          code: 'companyName',
          label: '公司名称',
          width: 220,
        },
        {
          code: 'useDate',
          label: '领用日期',
          type: 'date',
          width: 100,
        },
        {
          code: 'giveBackDate',
          label: '归还日期',
          type: 'date',
          width: 100,
        },
        {
          code: 'useType',
          label: '领用类型',
          width: 100,
        },
        {
          code: 'meaning',
          label: '借阅状态',
          width: 100,
        },
        {
          code: 'inventoryAddress',
          label: '存放仓库',
          width: 150,
        },
      ],
      // 查看弹窗
      viewVisible: false,
      viewData: {
        itemInfo: [],
        form: {},
        tableColumn: [],
        uploadData: [],
        tableData: [],
      },
      historyTableColumn: [
        {
          label: '处理人',
          code: 'employeeName',
        },
        {
          label: '审批日期',
          code: 'approveDate',
        },
        {
          label: '处理结果',
          code: 'approveCommand',
        },
      ],
      historyParams: {},
      // 导出excel按钮
      buttonList: {
        excel: true,
      },
      // 归还、领取公用弹窗数据
      publicVisible: false,
      dialogPublicData: {},
      // 归还弹窗数据
      giveBackData: {
        title: '归还',
        url: '/borrowProcessing/updateApplyHeaderStatus',
        searchInfo: [{
          label: '归还日期',
          code: 'date',
          type: 'date',
        }],
      },
      // 批量归还弹窗数据
      allGiveBackData: {
        title: '批量归还',
        url: '/borrowProcessing/updateApplyHeaderStatus',
        searchInfo: [{
          label: '归还日期',
          code: 'date',
          type: 'date',
        }],
      },
      // 批量按册领用弹窗数据
      allByCopieData: {
        title: '批量按册领用',
        url: '/borrowProcessing/saveByBooks',
        searchInfo: [{
          label: '领用日期',
          code: 'date',
          type: 'date',
        }],
      },
      // 批量按凭证领用弹窗数据
      allByCredentialData: {
        title: '批量按凭证领用',
        url: '/borrowProcessing/saveByVouchers',
        searchInfo: [{
          label: '领用日期',
          code: 'date',
          type: 'date',
        }],
      },
      // 审批流程弹窗
      historyVisible: false,
      // 打印弹窗数据
      printVisible: false,
      // 区分归还与借阅状态
      ifGiveBack: false,
      // 单个归还与批量区分
      onlyOne: false,
      // 单个归还id存储
      onlyOneBackRow: [],
      // 选中行的所有数据
      allCollectRow: [],
    };
  },
  mounted() {
  },
  methods: {
    // 封装遍历勾选到的数据并将其整合成对象的方法
    traverse(values, key) {
      return values.map(item => item[key]);
    },
    // 通过子组件发射事件row-check获取选中的数据，并赋值给collectRow
    select(selection) {
      this.collectRow = this.traverse(selection, 'id');
      this.allCollectRow = selection;
    },
    // 查看按钮
    view(row) {
      const params = {
        employeeId: row.applyEmployeeId,
        applyNum: row.applyNum,
        id: row.id,
      };
      this.$http.post('/borrowProcessing/getApplyDetail', params).then(
        (res) => {
          this.viewData.form = Object.assign({}, { applyNum: row.applyNum }, res.data);
          this.viewData.uploadData = res.data.applyFiles;
          this.viewData.tableData = res.data.applyDetails;
          this.viewVisible = true;
        },
        () => {},
      );
    },
    // 操作记录
    watchHistory(row) {
      this.historyParams = {
        id: row.id,
      };
      this.historyVisible = true;
    },
    closeDialog() {
      this.viewVisible = false;
    },
    // 单个归还
    giveBack(row) {
      this.onlyOneBackRow = [row.id];
      this.onlyOne = true;
      this.ifGiveBack = true;
      this.publicVisible = true;
      this.dialogPublicData = this.giveBackData;
    },
    // 作废
    invalid(row) {
      const params = {
        applyList: JSON.stringify([
          {
            archivesHeaderId: row.id,
            approveCommand: '0',
          },
        ]),
      };
      this.$http.post('/borrowProcessing/updateApplyHeaderStatus', params).then(
        () => {
          this.$message.warning(this.$t('操作成功'));
          this.$refs.borrowProcessing.getTableData();
        },
        () => {},
      );
    },
    // 批量按凭证领用
    allByCredential() {
      if (!this.collectRow.length) {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
        return;
      }
      if (this.checkArr(this.allCollectRow, ['ARCHIVES_WAIT_REVERT', 'ARCHIVES_ALREADY_REVERT', 'ARCHIVES_ALREADY_CANCEL'])) {
        this.$message.warning(this.$t('请选择已审批借阅申请，进行批量领用!'));
        return;
      }
      this.publicVisible = true;
      this.dialogPublicData = this.allByCredentialData;
    },
    // 批量按册领用
    allByCopie() {
      if (!this.collectRow.length) {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
        return;
      }
      if (this.checkArr(this.allCollectRow, ['ARCHIVES_WAIT_REVERT', 'ARCHIVES_ALREADY_REVERT', 'ARCHIVES_ALREADY_CANCEL'])) {
        this.$message.warning(this.$t('请选择已审批借阅申请，进行批量领用!'));
        return;
      }
      this.publicVisible = true;
      this.dialogPublicData = this.allByCopieData;
    },
    // 批量归还
    allGiveBack() {
      this.ifGiveBack = true;
      if (!this.collectRow.length) {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
        return;
      }
      if (this.checkArr(this.allCollectRow, ['ARCHIVES_ALREADY_APPROVE', 'ARCHIVES_ALREADY_REVERT', 'ARCHIVES_ALREADY_CANCEL'])) {
        this.$message.warning(this.$t('请选择已领用借阅申请，进行批量归还!'));
        return;
      }

      this.publicVisible = true;
      this.dialogPublicData = this.allGiveBackData;
    },
    // 批量打印
    allPrint() {
      if (!this.collectRow.length) {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
        return;
      }
      this.printVisible = true;
    },
    // 表单提交
    submit(form) {
      if (this.onlyOne) {
        this.collectRow = this.onlyOneBackRow;
      }
      const params = this.ifGiveBack ? {
        applyList: JSON.stringify(this.collectRow.map(item => ({ archivesHeaderId: item, approveCommand: '1', giveBackDate: form.date }))),
      } : {
        applyList: JSON.stringify(this.collectRow.map((item, i) => ({ archivesHeaderId: item, useDate: form.date, voucherId: this.allCollectRow[i].voucherId ? this.allCollectRow[i].voucherId.voucherId : '' }))),
      };
      this.$http.post(this.dialogPublicData.url, params).then(
        () => {
          this.$message.success(this.$t('操作成功'));
          this.collectRow = [];
          this.onlyOneBackRow = [];
          this.onlyOne = false;
          this.ifGiveBack = false;
          this.publicVisible = false;
          this.$refs.borrowProcessing.getTableData();
        },
        () => {},
      );
    },
    // 检查数组内json对象是否包含某个字符串，有则返回true
    checkArr(arr, stringArr) {
      let bool = false;
      arr.forEach((item) => {
        if (this.checkForm(item, stringArr)) {
          bool = true;
        }
      });
      return bool;
    },
    // 检查json数据是否有某个字符串，若有则返回true
    checkForm(data, stringArr) {
      for (const key in data) {
        if (stringArr.indexOf(data[key]) > -1) return true;
      }
      return false;
    },
    // 弹窗关闭前回调
    whenClosed() {
      this.historyParams = {};
    },
    closePrint() {
      this.printVisible = false;
    },
  },
};
</script>

<style lang='scss'>
.printDialog {
  .el-dialog__header {
    background-color: #ffffff;
    margin-bottom: 0;
    height: 0;
  }
}
.borrowProcessing{
  .el-dialog{
    .el-dialog__body{
      padding-bottom: 30px;
      .borrowReadpublic{
        .el-form-item{
          width: 33.33%!important;
          .el-form-item__content{
            .el-radio-group{
              line-height: 15px;
              .el-radio{
                margin-left: 30px;
              }
            }
          }
        }
      }
      .view{
        padding: 0px 30px 30px 30px;
      }
    }
  }
  .customDialog {
    .el-dialog__body{
      padding-bottom: 0;
    }
  }
}
.dialogPublic {
  .el-dialog__body{
    padding-bottom: 0!important;
  }
}
</style>
