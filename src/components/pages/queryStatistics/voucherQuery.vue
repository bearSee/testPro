<template>
  <div class="voucherQuery">
    <zte-table
      ref="voucherQuery"
      index-style="index"
      request-url="/voucherQuery/listVoucher"
      excelUrl="/voucherQuery/voucherQueryExportExcel"
      :buttonList="buttonList"
      :row-size="3"
      :search-info="searchInfo"
      :table-column="tableColumn"
      @search="search">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" :disabled="row.voucherStatus === 'DESTROYED'" @click.native="viewVoucher(row, '')">{{$t('查看')}}</el-button>
        <el-button type="text" size="small" @click.native="handlerOpenHistory(row)">{{$t('操作记录')}}</el-button>
      </template>
      <template slot="voucherNum" slot-scope="{ row }">
        <el-button type="text" size="small" :disabled="row.voucherStatus === 'DESTROYED'" @click.native="viewVoucher(row, 'COVER')">{{ row.voucherNum }}</el-button>
      </template>
      <template slot="barcode" slot-scope="{ row }">
        <!-- <el-button type="text" size="small" @click.native="clickImgCode(row)">{{ row.barcode }}</el-button> -->
        <el-button type="text" size="small" :disabled="row.barcode === $t('无影像附件') || row.voucherStatus === 'DESTROYED'" @click.native="viewVoucher(row, 'IMAGE')">{{ row.barcode }}</el-button>
      </template>
      <template slot="boeNum" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native="gotoBas(row)">{{ row.boeNum }}</el-button>
      </template>
    </zte-table>

    <!-- 凭证历史记录 -->
    <el-dialog
      width="70%"
      :title="$t('凭证历史记录')"
      :visible.sync="historyDialogVisible">
      <zte-table
        request-url="/voucherQuery/listVoucherHistory"
        :table-column="historyTableColumn"
        :params="historyParams">
      </zte-table>
    </el-dialog>

    <!-- 影像编号列表 -->
    <el-dialog
      width="70%"
      :title="$t('影像编号列表')"
      :visible.sync="imageDialogVisible">
      <zte-table
        request-url="/voucher"
        :table-column="imageTableColumn">
      </zte-table>
    </el-dialog>
  </div>
</template>

<script type='text/javascript'>
import mixins from '../../../mixins/publicMethods';
import compare from '../../../es/utils';

export default {
  name: 'voucherQuery',
  mixins: [mixins],
  data() {
    return {
      // 搜索框信息
      searchInfo: [
        {
          code: 'startVoucherNum',
          label: '起始凭证编号',
          type: 'text',
        },
        {
          code: 'endVoucherNum',
          label: '截止凭证编号',
          type: 'text',
        },
        {
          code: 'periodName',
          label: '会计期间',
          type: 'select',
          options: [],
          optionProps: {
            label: 'periodName',
            value: 'periodName',
          },
          commonRequest: 'common/listPeriods',
        },
        {
          code: 'startBookNum',
          label: '起始分册编号',
          type: 'text',
        },
        {
          code: 'endBookNum',
          label: '截止分册编号',
          type: 'text',
        },
        {
          code: 'matchMode',
          label: '匹配方式',
          type: 'select',
          options: [],
          fastCode: 'MATCH_MODE',
        },
        {
          code: 'companyCode',
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
            {
              to: 'companyCode',
              from: 'COMPANY_CODE',
            },
          ],
        },
        {
          code: 'userNum',
          label: '制单人',
          showLabel: 'employName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'userNum',
              from: 'EMPLOYEE_NUMBER',
            },
            {
              to: 'employName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          code: 'approverNum',
          label: '复核人',
          showLabel: 'employeeName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'approverNum',
              from: 'EMPLOYEE_NUMBER',
            },
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          code: 'voucherStatus',
          label: '凭证状态',
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_STATUS',
        },
        {
          code: 'voucherType',
          label: '凭证类型',
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_TYPE',
        },
        {
          code: 'barcode',
          label: '影像任务编号',
          type: 'text',
        },
        {
          code: 'UserDate',
          label: '制单起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'startUserDate',
          endCode: 'endUserDate',
          type: 'daterange',
        },
        // {
        //   code: 'startUserDate',
        //   label: '制单起始日期',
        //   type: 'date',
        // },
        // {
        //   code: 'endUserDate',
        //   label: '制单截止日期',
        //   type: 'date',
        // },
        {
          label: '单据编号',
          code: 'boeNum',
          type: 'text',
        },
      ],
      tableColumn: [
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
          width: 120,
        },
        {
          label: '分册编号',
          code: 'bookCode',
          width: 200,
        },
        {
          label: '凭证编号',
          code: 'voucherNum',
          temp: 'voucherNum',
          width: 180,
        },
        {
          label: '凭证状态',
          code: 'voucherStatusName',
          width: 100,
        },
        {
          label: '凭证类型',
          code: 'voucherTypeName',
          width: 100,
        },
        {
          label: '公司名称',
          code: 'companyName',
          width: 200,
        },
        {
          label: '会计期间',
          code: 'periodName',
          width: 120,
        },
        {
          label: '单据编号',
          code: 'boeNum',
          width: 180,
          temp: 'boeNum',
        },
        {
          label: '制单人',
          code: 'userName',
          width: 90,
        },
        {
          label: '制单日期',
          code: 'userDate',
          type: 'date',
          width: 100,
        },
        {
          label: '复核人',
          code: 'approverName',
          width: 90,
        },
        {
          label: '匹配方式',
          code: 'matchMode',
          width: 90,
        },
        {
          label: '影像任务编号',
          code: 'barcode',
          temp: 'barcode',
          width: 200,
        },
        {
          label: '存放地点',
          code: 'inventory',
          width: 350,
        },
      ],
      // 操作记录弹窗数据
      historyDialogVisible: false,
      // 操作记录 表格表头
      historyTableColumn: [
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
          code: 'voucherStatus',
          label: '凭证状态',
        },
      ],
      historyParams: {
        voucherId: '',
      },
      // 点击影像编号的弹窗数据
      imageDialogVisible: false,
      imageTableColumn: [
        {
          code: 'taskCode',
          label: '影像任务编号',
        },
        {
          code: 'barcode',
          label: '影像文件编号',
        },
      ],
      buttonList: {
        excel: true,
      },
    };
  },
  mounted() {
  },
  methods: {
    // 操作记录按钮
    handlerOpenHistory(row) {
      this.historyParams.voucherId = row.id;
      this.historyDialogVisible = true;
    },
    // 图片查看
    viewVoucher(row, str) {
      this.openUrl(row, str, 'voucherMatching');
    },
    // 点击影像文件
    clickImgCode() {
      this.imageDialogVisible = true;
    },
    search(form) {
      const bool = compare(form.startVoucherNum, form.endVoucherNum);
      if (!bool) {
        this.$message.warning(this.$t('截止凭证编号不可小于起始凭证编号!'));
      }
    },
    gotoBas(row) {
      const { boeNum } = row;
      this.$http.post('/init/getEasSessionId', { boeNum, type: 'LOOK_BOE_NUM' }).then(
        ({ data }) => {
          const { language, userInfo, sessionId, lookBoeUrl } = data;
          this.$cookies.set('ZTESSCAUTH', sessionId, '0', '/');
          if (language) this.$cookies.set('user_language', language, '0', '/');
          if (userInfo) this.$cookies.set('userInfo', JSON.stringify(userInfo), '0', '/');
          window.open(lookBoeUrl);
        },
        () => {},
      );
    },
  },
};
</script>

<style lang='scss'>
.el-dialog p {
  padding: 15px 0 0 0;
}
</style>
