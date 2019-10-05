<template>
  <div class="voucher-matching">
    <zte-table
      ref="table"
      index-style="selection"
      request-url="/voucherMatch/listVoucher"
      excelUrl="/voucherMatch/excelDownload"
      :buttonList="buttonList"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn"
      :selectable="selectable"
      @search="search">
      <div slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="handlerBatchMatch(rows)">{{ $t('批量赋予无影像附件') }}</el-button>
        <el-button size="small" @click.native="handlerBatchDownload(rows)" :loading="downloading">{{ $t('批量下载') }}</el-button>
        <el-button size="small" @click.native="handlerBatchPrint(rows)">{{ $t('批量打印') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" :disabled="row.voucherStatus === 'DESTROYED' || row.coverStatus === '0'" @click.stop.native="viewVoucher(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="small" @click.stop.native="matchVoucher(row)" :disabled="matchBtnDisabled(row)">{{ $t('匹配') }}</el-button>
      </template>
      <template slot="voucherNum" slot-scope="{ row }">
        <el-button type="text" size="small" :disabled="row.voucherStatus === 'DESTROYED'" @click.stop.native="viewVoucherNum(row)">{{ row.voucherNum }}</el-button>
      </template>
      <template slot="barcode" slot-scope="{ row }">
        <el-button type="text" size="small" :disabled="row.barcode === $t('无影像附件') || row.voucherStatus === 'DESTROYED'" @click.stop.native="viewVoucherImage(row)">{{ row.barcode }}</el-button>
      </template>
    </zte-table>

    <el-dialog
      fullscreen
      append-to-body
      :title="$t(printTitle)"
      class="printImagge"
      v-if="printDialogVisible"
      :visible.sync="printDialogVisible"
      :show-close='showClose'>
      <el-button class="not-print" @click.native="printPage">{{$t('打印')}}</el-button>
      <img
        style="width: 100%;page-break-after: always;"
        v-for="(img, index) of imageList"
        :key="index"
        :src="'/erssys' + img.imageUrl"
        alt="">
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
          <el-button type="text" size="small" @click.native="viewVoucherImage(row)">{{ row.barcode }}</el-button>
        </template>
      </zte-table>
    </el-dialog> -->

    <!-- 凭证匹配修改弹窗 -->
    <el-dialog
      append-to-body
      width="80%"
      v-if="matchDialogVisible"
      :visible.sync="matchDialogVisible"
      :title="$t('凭证匹配')">
      <voucher-match-edit
        :params="matchParams"
        @confirm="handlerConfirm">
      </voucher-match-edit>
    </el-dialog>
  </div>
</template>

<script>
import { setTimeout } from 'timers';
import downloadFile from '@/es/download';
import mixins from '../../../mixins/publicMethods';
import voucherMatchEdit from './voucherMatchEdit';
import compare from '../../../es/utils';

export default {
  name: 'voucherMatching',
  mixins: [mixins],
  components: {
    voucherMatchEdit,
  },
  data() {
    return {
      printTitle: '图片打印',
      showClose: true,
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
          code: 'matchMode',
          label: '匹配方式',
          type: 'select',
          options: [],
          fastCode: 'MATCH_MODE',
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
          code: 'voucherType',
          label: '凭证类型',
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_TYPE',
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
        {
          code: 'barcode',
          label: '影像任务编号',
          type: 'text',
        },
        {
          code: 'indexNum',
          label: '索引号',
          type: 'text',
        },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 100,
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
          code: 'barcode',
          label: '影像任务编号',
          temp: 'barcode',
          width: 180,
        },
        {
          code: 'voucherStatusName',
          label: '凭证状态',
          width: 120,
        },
        {
          code: 'matchMode',
          label: '匹配方式',
          width: 120,
        },
        {
          code: 'indexNum',
          label: '索引号',
          width: 110,
        },
      ],
      downloading: false,
      imageList: [],
      printDialogVisible: false,
      imageDialogVisible: false,
      imageTableColumn: [
        {
          label: '影像任务编号',
          code: 'imageTaskNo',
        },
        {
          label: '影像文件编号',
          code: 'barcode',
          temp: 'barcode',
        },
      ],
      voucherId: '',
      matchDialogVisible: false,
      matchParams: {},
      buttonList: {
        excel: true,
      },
    };
  },
  methods: {
    getTableData() {
      this.$refs.table.getTableData();
    },
    matchVoucher(row) {
      this.matchParams = { voucherId: row.voucherId };
      this.matchDialogVisible = true;
      this.voucherId = row.voucherId;
    },
    // 查看, 包括影像和凭证封面
    viewVoucher(row) {
      this.viewImageList(row, '');
    },
    // 查看凭证封面
    viewVoucherNum(row) {
      this.viewImageList(row, 'COVER');
    },
    // 查看影像
    viewVoucherImage(row) {
      this.viewImageList(row, 'IMAGE');
    },
    viewImageList(row, typeStr) {
      // debugger;
      this.openUrl(row, typeStr, 'voucherMatching');
    },
    // viewImageList() {
    //   this.imageDialogVisible = true;
    // },
    // 凭证匹配
    handlerConfirm(imageNumber) {
      this.matchDialogVisible = false;
      const params = {
        voucherId: this.voucherId,
        imageNumber,
      };
      this.$http.post('/voucherMatch/manualMatchImage', params).then(
        () => {
          this.$message.success('匹配成功');
          this.getTableData();
        },
        () => {},
      );
    },
    // 批量匹配
    handlerBatchMatch(rows) {
      if (!rows.length) {
        this.$message.warning('请选择一条数据');
        return;
      }
      if (rows.some(row => row.voucherStatus === 'MATCHED')) {
        this.$message.warning('请选择未匹配的凭证');
        return;
      }

      const params = {
        voucherIds: rows.map(row => row.voucherId).join(),
      };
      this.$http.post('/voucherMatch/batchGiveNoImage', params).then(
        () => {
          this.$message.success('匹配成功');
          this.getTableData();
        },
        () => {},
      );
    },
    handlerBatchDownload(rows) {
      if (!rows.length) {
        this.$message.warning('请选择一条数据');
        return;
      }

      const params = {
        voucherIds: rows.map(row => row.voucherId).join(),
      };

      this.downloading = true;
      this.$http.get('/voucherMatch/batchDownloadVoucher', {
        params,
        responseType: 'blob',
      }).then(
        (res) => {
          if (res.headers['content-disposition']) {
            const fileName = res.headers['content-disposition'].split('=')[1];
            downloadFile(fileName, res.data);
            this.downloading = false;
            return;
          }
          this.$message.warning('下载失败');
          this.downloading = false;
        },
        () => {},
      );
    },
    handlerBatchPrint(rows) {
      if (!rows.length) {
        this.$message.warning('请选择一条数据');
        return;
      }
      const params = {
        voucherIds: rows.map(row => row.voucherId).join(),
      };
      this.$http.post('/voucherMatch/listPrintVoucher', params).then(
        (res) => {
          res = res.data;
          this.imageList = res.list;
          this.printDialogVisible = true;
        },
        () => {},
      );
    },
    printPage() {
      this.printTitle = '';
      this.showClose = false;
      setTimeout(() => {
        window.print();
        this.printTitle = '图片打印';
        this.showClose = true;
        this.printDialogVisible = false;
      }, 500);
    },
    // 搜索框凭证编号比较 并给出提示
    search(form) {
      const bool = compare(form.startVoucherNum, form.endVoucherNum);
      if (!bool) {
        this.$message.warning(this.$t('截止凭证编号不可小于起始凭证编号!'));
      }
    },
    matchBtnDisabled(row) {
      // 非未匹配和已拒绝的分册 或者 未生产封面的分册都要置灰操作按钮
      return (row.voucherStatus !== 'UNMATCH' && row.voucherStatus !== 'REJECTED') || (row.coverStatus === '0');
    },
    selectable(row) {
      return row.coverStatus !== '0';
    },
  },
};
</script>

<style lang="scss">
.voucher-matching {
  .printImagge .el-dialog__body {
    text-align: center;
  }
}

</style>
