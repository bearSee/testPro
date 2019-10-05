<template>
  <div class="voucherQuery">
    <zte-table
      ref="voucherQuery"
      index-style="index"
      request-url="/applyQuery/listApply"
      excelUrl="/applyQuery/applyRecordExportExcel"
      :buttonList="buttonList"
      :row-size="3"
      :search-info="searchInfo"
      :table-column="tableColumn">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native="view(row)">{{$t('查看')}}</el-button>
      </template>
    </zte-table>
    <!-- 查看 -->
    <el-dialog
      fullscreen
      style="margin-bottom:20px;"
      :title="$t('借阅记录')"
      :visible.sync="viewVisible"
      :close-on-press-escape="false">
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
  </div>
</template>

<script type='text/javascript'>
import borrowDialogView from '../../modules/borrow-dialog-view';

export default {
  name: 'voucherQuery',
  components: { borrowDialogView },
  data() {
    return {
      // 搜索框信息
      searchInfo: [
        {
          code: 'applyNum',
          label: '借阅单号',
          type: 'text',
        },
        {
          code: 'applyEmployeeId',
          label: '借阅人',
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
          type: 'table',
          showLabel: 'companyName',
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
          label: '借阅起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'startApplyDate',
          endCode: 'endApplyDate',
          type: 'daterange',
        },
        // {
        //   code: 'endApplyDate',
        //   label: '借阅结束日期',
        //   type: 'date',
        // },
        // {
        //   code: 'startApplyDate',
        //   label: '借阅开始日期',
        //   type: 'date',
        // },
        {
          code: 'applyType',
          label: '借阅类型',
          type: 'select',
          options: [],
          fastCode: 'BORROW_MODE',
        },
      ],
      tableColumn: [
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
          width: 50,
        },
        {
          label: '借阅单号',
          code: 'applyNum',
          width: 220,
        },
        {
          label: '公司名称',
          code: 'companyName',
          width: 250,
        },
        {
          label: '借阅状态',
          code: 'archivesStatusName',
          width: 180,
        },
        {
          label: '借阅人',
          code: 'employeeName',
          width: 100,
        },
        {
          label: '借阅日期',
          code: 'applyDate',
          width: 170,
        },
        {
          label: '借阅类型',
          code: 'applyTypeName',
          width: 120,
        },
        {
          label: '归还日期',
          code: 'giveBackDate',
          width: 170,
        },
      ],
      // 导出excel弹窗数据
      buttonList: { excel: true },
      // 弹窗的数据
      viewVisible: false,
      viewData: {
        form: {},
        tableData: [],
        tableColumn: [],
        uploadData: [],
      },
    };
  },
  mounted() {
  },
  methods: {
    // 查看按钮
    view(row) {
      const params = {
        employeeId: row.applyEmployeeId,
        applyNum: row.applyNum,
        id: row.id,
      };
      this.$http.post('applyQuery/getApplyDetail', params).then(
        (res) => {
          this.viewData.form = Object.assign({}, { applyNum: row.applyNum }, res.data);
          this.viewData.uploadData = res.data.applyFiles;
          this.viewData.tableData = res.data.applyDetails;
          this.viewVisible = true;
        },
        () => {},
      );
    },
    closeDialog() {
      this.viewVisible = false;
    },
  },
};
</script>

<style lang='scss'>
.voucherQuery .borrowReadpublic .mid-table {
  margin: 0 0 20px 0;
}
</style>
