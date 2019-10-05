<template>
  <div class="vocher-review">
    <zte-table
      ref="table"
      request-url="/voucherApprove/listVoucher"
      index-style="selection"
      excelUrl="/voucherApprove/voucherApproveExportExcel"
      :row-size="3"
      :buttonList="buttonList"
      :search-info="searchConfig"
      :table-column="tableColumn"
      :selectable="selectable"
      @search="search">
      <div slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="handlerBatchApprove(rows)">{{ $t('批量通过') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.stop.native="viewHistoryRecord(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="small" @click.stop.native="reviewVoucher(row)" :disabled="row.voucherStatus !== 'MATCHED'">{{ $t('复审') }}</el-button>
      </template>
      <template slot="voucherNum" slot-scope="{ row }">
        <el-button type="text" size="small" @click.stop.native="viewVoucher(row, 'COVER')">{{ row.voucherNum }}</el-button>
      </template>
      <template slot="barcode" slot-scope="{ row }">
        <el-button type="text" size="small" :disabled="row.barcode === '无影像附件'" @click.stop.native="viewVoucher(row, 'IMAGE')">{{ row.barcode }}</el-button>
      </template>
    </zte-table>
    <!-- 查看历史记录 -->
    <el-dialog
      class="look"
      type="temp"
      width="80%"
      v-if="look.visible"
      :title="$t('凭证编号') + '：' + record.serialNum"
      :visible.sync="look.visible">
      <zte-table
        index-style="index"
        :isPagination="false"
        :request-url="look.requestUrl"
        :table-column="look.tableColumn"
        :params="look.params">
      </zte-table>
      <p style="font-size:18px;padding:5px 0;">{{$t('凭证历史记录')}}</p>
      <zte-table
        index-style="index"
        :request-url="record.requestUrl"
        :table-column="record.tableColumn"
        :params="record.params">
      </zte-table>
    </el-dialog>
    <!-- 影像编号列表弹窗 -->
    <!-- <el-dialog
      :visible.sync="imageDialogVisible"
      :title="$t('影像编号列表')">
      <zte-table
        index-style="index"
        request-url="/voucherMatching/imageList"
        :tableColumn="imageTableColumn">
        <template slot="barcode" slot-scope="{ row }">
          <el-button type="text" size="small" @click.native="viewVoucher(row, 'IMAGE')">{{ row.barcode }}</el-button>
        </template>
      </zte-table>
    </el-dialog> -->

    <el-dialog
      :title="$t('复审')"
      v-if="approveDialogVisible"
      :visible.sync="approveDialogVisible">
      <voucher-review-comment
        :voucher-id="voucherId">
      </voucher-review-comment>
      <div class="approve">
        {{$t('复审意见')}}
        <el-input
          type="textarea"
          placeholder="请输入内容"
          v-model="approveDesc">
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click.native="handlerApprove('APPROVEED')">{{$t('复审通过')}}</el-button>
        <el-button size="mini" @click.native="handlerApprove('REJECTED')">{{$t('退回')}}</el-button>
        <el-button size="mini" @click.native="approveDialogVisible = false">{{$t('关闭')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import mixins from '../../../mixins/publicMethods';
import voucherReviewComment from './voucherReviewComment';
import compare from '../../../es/utils';

export default {
  name: 'archiveEntry',
  mixins: [mixins],
  components: {
    voucherReviewComment,
  },
  data() {
    return {
      searchConfig: [
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
          code: 'companyCode',
          label: '结算单位',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyCode',
              from: 'COMPANY_CODE',
            },
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
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
              to: 'employName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'userNum',
              from: 'EMPLOYEE_NUMBER',
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
          code: 'matchMode',
          label: '匹配方式',
          type: 'select',
          options: [],
          fastCode: 'MATCH_MODE',
        },
        // {
        //   code: 'voucherStatus',
        //   label: '凭证状态',
        //   type: 'select',
        //   options: [],
        //   fastCode: 'VOUCHER_STATUS',
        // },
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
        //   label: '起始制单日期',
        //   type: 'date',
        // },
        // {
        //   code: 'endUserDate',
        //   label: '截止制单日期',
        //   type: 'date',
        // },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 120,
        },
        {
          code: 'voucherNum',
          label: '凭证编号',
          temp: 'voucherNum',
          width: 110,
        },
        {
          code: 'voucherTypeName',
          label: '凭证类型',
        },
        {
          code: 'companyName',
          label: '结算单位',
          width: 200,
        },
        {
          code: 'periodName',
          label: '会计期间',
        },
        {
          code: 'userName',
          label: '制单人',
          width: 90,
        },
        {
          code: 'voucherDate',
          label: '制单日期',
          type: 'date',
          width: 100,
        },
        {
          code: 'approverName',
          label: '复核人',
          width: 90,
        },
        {
          code: 'approverDate',
          label: '复核日期',
          type: 'date',
          width: 100,
        },
        {
          code: 'barcode',
          label: '影像任务编号',
          temp: 'barcode',
          width: 180,
        },
        {
          code: 'voucherStatusName',
          label: '凭证状态',
          width: 110,
        },
        {
          code: 'matchMode',
          label: '匹配方式',
        },
      ],
      voucherId: '',
      approveDialogVisible: false,
      // imageDialogVisible: false,
      // imageTableColumn: [
      //   {
      //     label: '影像任务编号',
      //     code: 'imageTaskNo',
      //   },
      //   {
      //     label: '影像文件编号',
      //     code: 'barcode',
      //     temp: 'barcode',
      //   },
      // ],
      approveDesc: '',
      // 查看弹窗的数据
      look: {
        requestUrl: '/voucherApprove/listVoucherByVoucherId',
        visible: false,
        title: ' ',
        params: {},
        tableColumn: [
          {
            code: 'voucherNum',
            label: '凭证编号',
            width: 150,
          },
          {
            code: 'voucherTypeName',
            label: '凭证类型',
          },
          {
            code: 'companyName',
            label: '结算单位',
            width: 200,
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
            code: 'voucherDate',
            label: '制单日期',
            width: 150,
          },
          {
            code: 'approverName',
            label: '复核人',
          },
          {
            code: 'approverDate',
            label: '复核日期',
            width: 150,
          },
          {
            code: 'voucherStatusName',
            label: '凭证状态',
          },
        ],
      },
      // 历史数据
      record: {
        requestUrl: '/voucherApprove/listVoucherHistoryByVoucherId',
        visible: false,
        title: ' ',
        serialNum: '00001',
        // 查看弹窗 表格表头
        tableColumn: [
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
            label: '凭证状态',
          },
          {
            code: 'approveOpinion',
            label: '审批意见',
          },
        ],
      },
      // 操作按钮
      buttonList: {
        excel: true,
      },
    };
  },
  methods: {
    getTableData() {
      this.$refs.table.getTableData();
    },
    viewHistoryRecord(row) {
      this.record.serialNum = row.voucherNum;
      this.record.params = { voucherId: row.voucherId };
      this.look.params = { voucherId: row.voucherId };
      this.look.visible = true;
    },
    reviewVoucher(row) {
      this.voucherId = row.voucherId;
      this.approveDialogVisible = true;
    },
    viewVoucher(row, str) {
      this.openUrl(row, str, 'voucherMatching');
    },
    // viewImageList() {
    //   this.imageDialogVisible = true;
    // },
    handlerApprove(approve) {
      if (!this.approveDesc && approve === 'REJECTED') {
        this.$message.warning(this.$t('请输入复审意见'));
        return;
      }

      const params = {
        voucherId: this.voucherId,
        approve,
        approveDesc: this.approveDesc,
      };

      this.$http.post('/voucherApprove/approve', params).then(
        () => {
          this.$message.success(this.$t('复审成功'));
          this.approveDialogVisible = false;
          this.approveDesc = '';
          this.getTableData();
        },
        () => {},
      );
    },
    handlerBatchApprove(rows) {
      if (rows.length) {
        const voucherIds = rows.map(data => data.voucherId);
        const params = {
          voucherIds: voucherIds.join(','),
        };
        this.$confirm(`${this.$t('是否批量通过复审')}?`, this.$t('提示'), {
          confirmButtonText: this.$t('确认'),
          cancelButtonText: this.$t('取消'),
          type: 'warning',
        }).then(() => {
          this.$http.post('/voucherApprove/batchApproveVoucher', params).then(
            () => {
              this.$message.success(this.$t('批量复审成功'));
              this.$refs.table.getTableData();
            },
            () => {},
          );
        });
        return;
      }
      this.$message.warning(this.$t('请勾选至少一条数据'));
    },
    selectable(row) {
      return row.voucherStatus === 'MATCHED';
    },
    // 搜索框凭证编号比较 并给出提示
    search(form) {
      const bool = compare(form.startVoucherNum, form.endVoucherNum);
      if (!bool) {
        this.$message.warning(this.$t('截止凭证编号不可小于起始凭证编号!'));
      }
    },
  },
};
</script>

<style>
  .approve{
    margin-top: 15px;
  }
  .vocher-review .el-textarea {
    margin-top: 10px;
  }
</style>
