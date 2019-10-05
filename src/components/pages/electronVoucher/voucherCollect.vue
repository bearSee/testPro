<template>
<!-- 凭证采集 -->
  <div class="voucherCollect">
    <zte-table
      ref="voucherCollect"
      request-url="/voucherCollect/listCollectVoucher"
      excelUrl="/voucherCollect/excelDownload"
      :buttonList="{ excel: true }"
      index-style="selection"
      :row-size="3"
      :label-width="120"
      v-loading="isImporting"
      :search-info="searchConfig"
      :table-column="tableColumn"
      @search="search">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.stop.native="viewImage(row)">{{$t('查看')}}</el-button>
        <el-button type="text" size="mini" :disabled="row.voucherStatus !== 'DRAFT'" @click.stop.native="edit(row)">{{$t('修改')}}</el-button>
        <el-button type="text" size="mini" :disabled="row.voucherStatus !== 'DRAFT'" @click.stop.native="deletRow(row)">{{$t('删除')}}</el-button>
      </template>
      <template slot="voucherNum" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.stop.native="view(row)">{{row.voucherNum}}</el-button>
      </template>
      <!-- 表头按钮部分 -->
      <div class="moreBtn" slot="moreOperate">
        <el-button icon="el-icon-plus" type="primary" size="mini" @click.stop.native="readyExport">{{$t('新增导入')}}</el-button>
      </div>
      <!-- 表格头部批量按钮 -->
      <div class="moreBtn" slot="content">
        <el-button size="small" @click="handleSubmitSelects">{{ $t('批量提交') }}</el-button>
        <el-button size="small" @click="readyDownTemplate">{{ $t('下载模版') }}</el-button>
      </div>
    </zte-table>

    <el-dialog
      :title="$t('请选择凭证类型')"
      class="chooseVoucherType"
      :visible.sync="importVisible"
      :close-on-press-escape="false">
      <zte-item size="small" :props="voucherTypeInfo" v-model="templateInfo.uploadParams.excelType"></zte-item>
      <div class="comfirm-btn">
        <el-upload
          v-if="isUpload"
          v-show="templateInfo.uploadParams.excelType"
          :headers="{ Authorization: Authorization }"
          :show-file-list="false"
          :action="templateInfo.action"
          :data="templateInfo.uploadParams"
          :before-upload="beforeUpload"
          :on-success="cloaseMask"
          :on-error="cloaseMask">
          <el-button size="mini" type="primary">{{$t('确定')}}</el-button>
        </el-upload>
        <el-button v-else size="mini" v-show="templateInfo.uploadParams.excelType" @click="downLoadTemplate">{{$t('确定')}}</el-button>
        <el-button size="mini" @click="importVisible = false">{{$t('关闭')}}</el-button>
      </div>
    </el-dialog>

    <!-- 查看 -->
    <el-dialog
      fullscreen
      class="entries-dialog"
      :title="$t('凭证采集')"
      :visible.sync="viewVisible"
      :close-on-press-escape="false">
      <!-- 基本信息 编辑-->
      <zte-form
        border
        v-if="isEdit"
        size="small"
        :item-info="itemInfo"
        :form="form"
        :row-size="4"
        :labelWidth="150"
        :isCancel="false"
        @submit="submit">
        <template slot="moreOperate" slot-scope="{ currentForm }">
          <el-button size="small" @click="saveDraft(currentForm)" type="primary">{{ $t('存为草稿') }}</el-button>
          <el-button size="small" @click="viewVisible = false">{{ $t('关闭') }}</el-button>
        </template>
      </zte-form>
      <!-- 基本信息 查看 -->
      <zte-form
        border
        v-else
        size="small"
        :item-info="viewItemInfo"
        :form="form"
        :row-size="4"
        :labelWidth="150"
        :isSubmit="false"
        :cancel-text="$t('关闭')"
        @reset="viewVisible = false">
      </zte-form>

      <!-- 凭证分录 -->
      <zte-table-local
        ref="entriesTable"
        class="entriesTable"
        indexStyle="index"
        :tableColumn="entriesTableColumn"
        :tableData="entriesTableData">
        <div slot="content" class="content">
          <span size="small" class="headText">{{ $t('凭证分录') }}</span>
        </div>
        <template slot="operate" slot-scope="{ $index }">
          <el-button type='text' :disabled="!isEdit" @click.native.stop="deletLine($index)">{{$t('删除')}}</el-button>
        </template>
      </zte-table-local>

      <!-- 附件列表 -->
      <zte-table-local
        class="uploadList"
        indexStyle="index"
        :tableColumn="uploadListColumn"
        :tableData="uploadData">
        <div slot="content" class="content">
          <span size="small" class="headText">{{ $t('附件列表') }}</span>
          <el-upload
            v-if="isEdit"
            :headers="{ Authorization: Authorization }"
            :data="fileInfo.uploadParams"
            :show-file-list="false"
            :action="fileInfo.action"
            :file-list="fileInfo.list"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess">
            <el-button size="small" type="primary">{{$t('添加影像')}}</el-button>
            <span>（ 附件大小不超过10M ）</span>
          </el-upload>
        </div>
        <template slot="operate" slot-scope="{ row, $index }">
          <el-button v-if="isEdit" type="text" size="mini" @click.native="deletFile(row, $index)">{{$t('删除')}}</el-button>
          <el-button v-else type="text" size="mini" @click.native="downloadImg(row, $index)">{{$t('下载')}}</el-button>
        </template>
      </zte-table-local>
    </el-dialog>
  </div>
</template>

<script type='text/javascript'>
import qs from 'qs';
import downloadFile from '@/es/download';
import zteItem from '@/components/modules/zte-item';
import mixins from '../../../mixins/publicMethods';
import compare from '../../../es/utils';

export default {
  name: 'voucherCollect',
  mixins: [mixins],
  components: { zteItem },
  data() {
    return {
      voucherTypeInfo: {
        label: '凭证类型',
        code: 'templateType',
        type: 'select',
        options: [
          {
            label: '会计凭证',
            value: 'ACCOUNTANT_VOUCHER',
          },
          {
            label: '会计报表（负债表）',
            value: 'ACCOUNTANT_REPORT_DEBT',
          },
          {
            label: '会计报表（利润表、现金流表）',
            value: 'ACCOUNTANT_REPORT_PROFIT_AND_CASH',
          },
          {
            label: '会计账簿（固定资产）',
            value: 'ACCOUNTANT_BOOK_FIXED_ASSETS',
          },
          {
            label: '会计账簿（日记账、总分类账）',
            value: 'ACCOUNTANT_DAILY_BOOK_AND_GENERAL_LEDGER',
          },
          {
            label: '其他会计资料',
            value: 'ACCOUNTANT_OTHERS',
          },
        ],
        // fastCode: 'VOUCHER_TYPE',
      },
      templateInfo: {
        action: '/erssys/voucherCollect/importVoucherCollectExcel',
        list: [],
        uploadParams: {
          excelType: '',
        },
      },
      // 搜索框信息
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
          code: 'companyCode',
          label: '部门',
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
          code: 'periodName',
          label: '会计年度',
          type: 'select',
          options: [],
          optionProps: {
            label: 'periodName',
            value: 'periodName',
          },
          commonRequest: 'common/listPeriods',
        },
        {
          code: 'voucherType',
          showLabel: 'voucherTypeMeaning',
          label: '凭证类型',
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_TYPE',
        },
        {
          code: 'voucherStatus',
          label: '凭证状态',
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_STATUS',
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
          code: 'UserDate',
          label: '制单起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'startUserDate',
          endCode: 'endUserDate',
          type: 'daterange',
        },
      ],
      // 页面table的表头信息
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 150,
        },
        {
          code: 'voucherNum',
          label: '凭证编号',
          width: 180,
          temp: 'voucherNum',
        },
        {
          code: 'voucherTypeName',
          label: '凭证类别',
        },
        {
          code: 'companyName',
          label: '部门',
          width: 150,
        },
        {
          code: 'periodName',
          label: '会计年度',
        },
        {
          code: 'userName',
          label: '制单人',
          sort: false,
        },
        {
          code: 'userDate',
          label: '制单日期',
          type: 'date',
        },
        {
          code: 'voucherStatusName',
          label: '凭证状态',
          width: 100,
          sort: false,

        },
      ],
      isImporting: false,
      isEdit: false,
      viewVisible: false,
      importVisible: false,
      // 基本信息
      itemInfo: [
        {
          code: 'voucherNum',
          label: '凭证编号',
          type: 'text',
        },
        {
          code: 'companyCode',
          label: '部门',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyCode',
              from: 'ID',
            },
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
          ],
        },
        {
          code: 'periodName',
          label: '会计年度',
          type: 'select',
          options: [],
          optionProps: {
            label: 'periodName',
            value: 'periodName',
          },
          ajax: 'common/listPeriods',
        },
        {
          code: 'voucherType',
          label: '凭证类别',
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_TYPE',
        },
        {
          code: 'zflb',
          label: '支付类别',
          type: 'text',
        },
        {
          code: 'drAmountSum',
          label: '借方合计',
          type: 'text',
        },
        {
          code: 'crAmountSum',
          label: '贷方合计',
          type: 'text',
        },
        {
          code: 'ysdjh',
          label: '原始单据编号',
          type: 'text',
        },
        {
          code: 'ysdjlx',
          label: '原始单据类型',
          type: 'text',
        },
        {
          code: 'cnlsh',
          label: '出纳流水号',
          type: 'text',
        },
        {
          code: 'htbh',
          label: '合同编号',
          type: 'text',
        },
        {
          code: 'zxld',
          label: '中心领导',
          type: 'text',
        },
        {
          code: 'kjzg',
          label: '会计主管',
          type: 'text',
        },
        {
          code: 'kj',
          label: '快计',
          type: 'text',
        },
        {
          code: 'cn',
          label: '出纳',
          type: 'text',
        },
        {
          code: 'tzr',
          label: '制单人',
          type: 'text',
        },
      ],
      viewItemInfo: [
        {
          code: 'voucherNum',
          label: '凭证编号',
          type: 'label',
        },
        {
          code: 'companyName',
          label: '部门',
          type: 'label',
        },
        {
          code: 'periodName',
          label: '会计年度',
          type: 'label',
        },
        {
          code: 'voucherTypeName',
          label: '凭证类别',
          type: 'label',
        },
        {
          code: 'zflb',
          label: '支付类别',
          type: 'label',
        },
        {
          code: 'drAmountSum',
          label: '借方合计',
          type: 'label',
        },
        {
          code: 'crAmountSum',
          label: '贷方合计',
          type: 'label',
        },
        {
          code: 'ysdjh',
          label: '原始单据编号',
          type: 'label',
        },
        {
          code: 'ysdjlx',
          label: '原始单据类型',
          type: 'label',
        },
        {
          code: 'cnlsh',
          label: '出纳流水号',
          type: 'label',
        },
        {
          code: 'htbh',
          label: '合同编号',
          type: 'label',
        },
        {
          code: 'zxld',
          label: '中心领导',
          type: 'label',
        },
        {
          code: 'kjzg',
          label: '会计主管',
          type: 'label',
        },
        {
          code: 'kj',
          label: '快计',
          type: 'label',
        },
        {
          code: 'cn',
          label: '出纳',
          type: 'label',
        },
        {
          code: 'tzr',
          label: '制单人',
          type: 'label',
        },
      ],
      form: {},
      // 凭证分录
      entriesTableColumn: [
        {
          code: 'dcFlag',
          label: '科目',
        },
        {
          code: 'abstract',
          label: '摘要',
        },
        {
          code: 'subjectName',
          label: '借贷标识',
        },
        {
          code: 'dcAmount',
          label: '金额',
        },
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
        },
      ],
      entriesTableData: [],
      // 附件列表
      Authorization: window.localStorage.getItem('Authorization'),
      fileInfo: {
        action: '/erssys/voucherCollect/uploadFiles',
        list: [],
        uploadParams: {},
      },
      uploadListColumn: [
        {
          code: 'imageName',
          label: '影像文件名',
        },
        {
          code: 'imageType',
          label: '影像分类',
        },
        {
          code: 'imageMemo',
          label: '备注',
        },
        {
          code: 'fileSize',
          label: '文件大小',
        },
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
        },
      ],
      uploadData: [],
    };
  },
  mounted() {
  },
  methods: {
    readyExport() {
      this.importVisible = true;
      this.isUpload = true;
    },
    // 导入成功
    importSuccess() {
      this.$message.success(this.$t('导入成功'));
      this.$refs.voucherCollect.getTableData();
      this.isImporting = false;
      this.importVisible = false;
    },
    cloaseMask() {
      this.isImporting = false;
    },
    readyDownTemplate() {
      this.isUpload = false;
      this.importVisible = true;
    },
    // 下载模版
    downLoadTemplate() {
      this.isImporting = true;
      this.$http.post('/voucherCollect/downloadExcelTemplate', { templateType: this.templateInfo.uploadParams.excelType }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: window.localStorage.getItem('Authorization'),
        },
        responseType: 'blob',
        transformRequest: [d => JSON.stringify(d)],
      }).then(
        ({ data }) => {
          downloadFile('模版.xlsx', data);
          this.isImporting = false;
          this.importVisible = false;
        },
        () => {
          this.isImporting = false;
          this.importVisible = false;
        },
      );
    },
    // 点击凭证编号
    view({ voucherId }) {
      this.isEdit = false;
      this.$http.post('/voucherCollect/findCollectVoucher', { voucherId }).then(
        ({ data }) => {
          this.viewVisible = true;
          this.entriesTableData = data.voucherLineList;
          this.form = data;
          this.uploadData = data.files;
        },
        () => {},
      );
    },
    // 查看按钮
    viewImage(row) {
      this.viewImageList(row, 'COVER');
    },
    // 修改按钮
    edit({ voucherId }) {
      this.isEdit = true;
      this.$http.post('/voucherCollect/findCollectVoucher', { voucherId }).then(
        ({ data }) => {
          this.viewVisible = true;
          this.entriesTableData = data.voucherLineList;
          this.form = data;
          this.uploadData = data.files;
        },
        () => {},
      );
    },
    // 删除凭证
    deletRow(row) {
      this.$confirm(`${this.$t('是否删除')}?`, this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        this.$http.post('/voucherCollect/voucherCollectDelete', qs.parse({ ids: [row.id] })).then(
          () => {
            this.$message.success(this.$t('删除成功'));
            this.$refs.voucherCollect.getTableData();
          },
          () => {},
        );
      });
    },
    // 批量提交
    handleSubmitSelects() {
      const { selectionRows } = this.$refs.voucherCollect;
      const voucherIds = selectionRows.map(d => d.id);
      if (!voucherIds.length) {
        this.$message.warning(this.$t('请勾选至少一条凭证'));
        return;
      }
      this.$http.post('/voucherCollect/submitVouchers', { voucherIds: voucherIds.join() }).then(
        () => {
          this.$message.success(this.$t('提交成功'));
        },
        () => {},
      );
    },

    /** 弹窗头部表单操作
     *
    */
    // 提交
    submit(form) {
      Object.assign(form, { voucherLineList: JSON.stringify(this.entriesTableData), files: JSON.stringify(this.uploadData) });
      this.$http.post('/voucherCollect/submitVoucher', form).then(
        () => {
          this.$message.success(this.$t('提交成功'));
          this.editVisible = false;
        },
        () => {},
      );
    },
    // 草稿
    saveDraft(form) {
      Object.assign(form, { voucherLineList: JSON.stringify(this.entriesTableData), files: JSON.stringify(this.uploadData) });
      this.$http.post('/voucherCollect/updateCollectVoucher', form).then(
        () => {
          this.$message.success(this.$t('提交成功'));
          this.editVisible = false;
        },
        () => {},
      );
    },

    /** 凭证分录表格操作
     *
    */
    // 删除分录行
    deletLine(index) {
      this.entriesTableData.splice(index, 1);
    },

    /** 附件部分操作
     *
    */
    // 上传前
    beforeUpload(file) {
      this.isImporting = true;
      if (file.size > 10485760) {
        this.$message.warning(this.$t('附件大小不能超过10M'));
        this.isImporting = false;
        return false;
      }
      return true;
    },
    // 上传成功
    uploadSuccess(res) {
      if (res.ok) {
        this.$message.success(this.$t('上传成功'));
        this.fileId.push(res.id);
        return;
      }
      this.$message.warning(this.$t(res.message || '上传失败'));
    },
    // 删除上传文件
    deletFile(row, $index) {
      this.$http.post('/voucherCollect/deleteFiles', { id: row.id }).then(
        () => {
          this.$message.warning(this.$t('删除成功'));
          this.uploadData.splice($index, 1);
        },
        () => {},
      );
    },
    // 下载文件
    downloadImg({ imageName, imagePath }) {
      if (imagePath) {
        downloadFile(imageName, imagePath);
        return;
      }
      this.$message.warning(this.$t('当前影像附件地址不存在'));
    },
    // 搜索框凭证编号比较 并给出提示
    search(form) {
      const bool = compare(form.startVoucherNum, form.endVoucherNum);
      if (!bool) {
        this.$message.warning(this.$t('截止凭证编号不可小于起始凭证编号'));
      }
    },
  },
};
</script>

<style lang='scss'>
.entries-dialog {
  margin-bottom: 20px;
  .content {
    display: flex;
    justify-content: space-between;
    .headText {
      line-height: 32px;
      border-bottom: 1px solid #9e9e9ea8;
    }
  }
  .uploadList {
    margin-top: 25px;
  }
  .entriesTable {

  }
}
.voucherCollect {
  .search-body .moreBtn{
    float: right;
    margin-left: 10px;
  }
}
.chooseVoucherType {
  .el-dialog__body {
    padding-top: 15px;
    .comfirm-btn {
      padding-top: 20px;
      text-align: right;
      display: flex;
      justify-content: flex-end;
      .el-upload {
        margin-right: 15px;
      }
    }
  }
}
</style>
