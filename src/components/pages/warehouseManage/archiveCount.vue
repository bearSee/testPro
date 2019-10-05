<template>
  <div class="archive-accept">
    <zte-table
      ref="archiveAccept"
      index-style="selection"
      :request-url="requestUrl"
      :params='params'
      excelUrl="/ArchiveInventory/exportInventoryExcel"
      :row-size="3"
      :buttonList="buttonList"
      :search-info="searchConfig"
      :table-column="tableColumn"
      :selectable="selectable"
      @picker-Change="pickerChange"
      @search="search">
      <template slot="moreOperate">
        <el-button size="mini" @click="inventoryInit">{{ $t('盘点初始化') }}</el-button>
      </template>
      <div slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="handlerBatchInventory(rows)">{{ $t('批量盘点') }}</el-button>
        <el-button size="small" @click.native="weiInventoryVisible = true">{{ $t('扫描盘点') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click="watch(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="mini" @click="accept(row)" :disabled="row.status === 'Y_INVENTORY'">{{ $t('盘点') }}</el-button>
        <el-button type="text" size="mini" @click="giveBack(row)" :disabled="row.status === 'N_INVENTORY'">{{ $t('撤销') }}</el-button>
      </template>
      <template slot="bookCode" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.stop.native="viewImage(row)">{{ row.bookCode }}</el-button>
      </template>
    </zte-table>

    <!-- 操作记录 -->
    <el-dialog
      fullscreen
      style="margin-bottom:20px;"
      :title="$t('盘点记录')"
      :visible.sync="viewVisible">
      <zte-table
        index-style="index"
        request-url="/ArchiveInventory/queryFasciculeRecord"
        :params="view.secondParams"
        :table-column="view.secondColumn">
        <div slot="content">
          <span size="small" class="headText">{{ $t('盘点历史记录') }}</span>
        </div>
      </zte-table>
      <el-button style="margin:20px 0 40px 0;" size="small" @click="viewVisible=false">{{$t('返回')}}</el-button>
    </el-dialog>

    <!-- 分册编号-->
    <el-dialog
      fullscreen
      class="allot-number"
      :title="$t('分册编号')"
      :append-to-body="true"
      :visible.sync="barcodeDialogVisible">
      <barcode
        class="barcode"
        v-for="item in printData"
        :key="item.bookCode"
        :value="item.bookCode"
        :text="item.bookCode"
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

    <!-- 新增调拨弹窗 -->
    <el-dialog
      class="weiInventoryDialog"
      :modal="false"
      :modal-append-to-body="false"
      :title="$t('扫描盘点')"
      v-if="weiInventoryVisible"
      :visible.sync="weiInventoryVisible">
      <weiInventory @back="weiInventoryVisible = false"/>
    </el-dialog>
  </div>
</template>

<script>
import barcode from '@/es/barcodeUtil';
import compare from '@/es/utils';
import weiInventory from './weiInventory';

export default {
  name: 'archiveAccept',
  components: {
    barcode,
    weiInventory,
  },
  data() {
    return {
      weiInventoryVisible: false,
      requestUrl: '/ArchiveInventory/list',
      params: { inventory: '' },
      // 分册编号
      barcodeDialogVisible: false,
      printData: [],
      searchConfig: [
        {
          code: 'cityId',
          label: '城市',
          showLabel: 'cityName',
          type: 'table',
          key: 'CityLov.find',
          required: true,
          trans: [
            {
              to: 'cityCode',
              from: 'CITY_CODE',
            },
            {
              to: 'cityName',
              from: 'CITY_NAME',
            },
            {
              to: 'cityId',
              from: 'CITY_ID',
            },
          ],
        },
        {
          code: 'storageCode',
          label: '仓库',
          type: 'select',
          options: [],
          optionProps: {
            label: 'storageName',
            value: 'storageCode',
          },
          commonRequest: 'storage/listStorageByCityId',
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
          code: 'voucherTypeCode',
          label: '凭证类型',
          required: true,
          type: 'select',
          options: [],
          fastCode: 'VOUCHER_TYPE',
        },
        {
          code: 'bookStatusCode',
          label: '分册状态',
          type: 'select',
          options: [],
          fastCode: 'BOOK_STATUS',
        },
        {
          code: 'startBookNum',
          label: '开始分册编号',
          type: 'text',
        },
        {
          code: 'endBookNum',
          label: '截止分册编号',
          type: 'text',
        },
        {
          code: 'inventoryStatusCode',
          label: '盘点状态',
          type: 'select',
          options: [],
          fastCode: 'INVENTORY_STATUS',
        },
        {
          code: 'inventoryEemployeeId',
          label: '最新盘点人',
          type: 'table',
          showLabel: 'inventoryEemployeeName',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'inventoryEemployeeName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'inventoryEemployeeId',
              from: 'ID',
            },
          ],
        },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 150,
        },
        {
          code: 'bookCode',
          label: '分册编号',
          temp: 'bookCode',
          width: 200,
        },
        {
          code: 'companyName',
          label: '结算单位',
          width: 180,
        },
        {
          code: 'vouchertype',
          label: '凭证类型',
          width: 100,
        },
        {
          code: 'periodName',
          label: '会计期间',
          width: 100,
        },
        {
          code: 'bookstatus',
          label: '分册状态',
          width: 100,
        },
        {
          code: 'inventorystatus',
          label: '盘点状态',
          width: 100,
        },
        {
          code: 'inventoryDate',
          label: '最新盘点日期',
          width: 120,
        },
        {
          code: 'employeeName',
          label: '最新盘点人',
          width: 120,
        },
        {
          code: 'address',
          label: '存放地点',
          width: 320,
        },
      ],
      viewVisible: false,
      view: {
        firstParams: {},
        secondParams: {},
        bookCode: '',
        secondColumn: [
          {
            label: '处理人',
            code: 'employeeName',
          },
          {
            label: '处理动作',
            code: 'handleAction',
          },
          {
            label: '处理时间',
            code: 'handleDate',
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
      this.view.bookCode = row.bookCode;
      this.view.firstParams = {
        bookId: row.id,
      };
      this.view.secondParams = {
        bookId: row.id,
      };
      this.viewVisible = true;
    },
    // 盘点初始化
    inventoryInit() {
      const searchObject = this.$refs.archiveAccept.getSearchObject();
      if (!searchObject.companyCode || !searchObject.periodName) {
        this.$message.warning('请按照计划范围盘点初始化, 仓库、结算单位、会计期间不能为空');
        return;
      }
      this.$confirm(`${('是否盘点初始化')}?`, ('提示'), {
        confirmButtonText: ('确认'),
        cancelButtonText: ('取消'),
        type: 'warning',
      }).then(() => {
        this.inventoryInitStart();
        // this.$message.success('盘点初始化成功');
        // this.params = {};
        // this.requestUrl = '/ArchiveInventory/setInventoryStatus';
        // this.$nextTick(() => {
        //   // this.$refs.archiveAccept.getTableData();
        //   this.params = { inventory: '' };
        //   this.requestUrl = '/ArchiveInventory/list';
        // });
      });
    },
    inventoryInitStart() {
      const searchObject = this.$refs.archiveAccept.getSearchObject();
      this.$http.post('/ArchiveInventory/setInventoryStatus', searchObject).then(
        () => {
          this.$message.success('盘点初始化成功');
          this.params = { inventory: '' };
          this.requestUrl = '/ArchiveInventory/list';
        },
        () => {},
      );
    },
    handlerBatchInventory(rows) {
      if (rows.length) {
        const allotIds = rows.map(data => data.id);
        const params = {
          bookIds: allotIds.join(','),
          status: 'N_INVENTORY',
        };
        this.$http.post('/ArchiveInventory/updateFasciculeList', params).then(
          () => {
            this.$message.success(this.$t('批量盘点成功'));
            this.$refs.archiveAccept.getTableData();
          },
          () => {},
        );
        return;
      }
      this.$message.warning(this.$t('请勾选至少一条数据'));
    },
    accept(row) {
      this.acceptAndBack(row, '/ArchiveInventory/updateFascicule', '盘点成功', 'Y_INVENTORY', '盘点');
    },
    // 点击编号名查看图片
    viewImage(row) {
      window.open(`${window.location.pathname}#/bookView?bookId=${row.id}&imageNumber=${row.barcode}&bookCode=${row.bookCode}&type=none`);
    },
    printPage() {
      window.print();
    },
    giveBack(row) {
      if (this.returnBtnloading) {
        return;
      }
      this.returnBtnloading = true;
      this.acceptAndBack(row, '/ArchiveInventory/updateFascicule', '撤销成功', 'N_INVENTORY', '撤销');
    },
    acceptAndBack(data, url, msg, eng, china) {
      this.view.firstParams = {
        bookId: data.id,
        inventoryStatusCode: eng,
        status: data.status,
        statusCharacter: china,
        inventoryEemployeeId: data.employeeName,
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
      return row.status !== 'Y_INVENTORY';
    },
    search(form) {
      const bool = compare(form.startAllotNum, form.endAllotNum);
      if (!bool) {
        this.$message.warning(this.$t('截止调拨编号不可小于起始调拨编号!'));
      }
    },
    // 选择城市后重新获取仓库
    pickerChange(row, info) {
      const { searchConfig } = this;
      if (info.code === 'cityId') {
        const index = searchConfig.findIndex(d => d.code === 'storageCode');
        searchConfig[index].params = { cityId: row.cityId };
        delete this.$refs.archiveAccept.searchForm.storageCode;
        this.$http.post(searchConfig[index].commonRequest, searchConfig[index].params).then(
          ({ data }) => {
            searchConfig[index].options = data.list;
            this.searchConfig = searchConfig;
          },
          () => {},
        );
      }
    },
  },
};
</script>

<style lang='scss'>
.allot-number .el-dialog__body {
  text-align: center;
  .barcode {
    text-align: center;
  }
}
.archive-accept {
  position: relative;
  .weiInventoryDialog {
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
        .user-role {
          height: calc(100% - 20px);
          .volume-Append {
            padding-bottom: 10px;
          }
          .table-body {
            margin-top: 15px;
            height: calc(100% - 171px);
            .el-table {
              height: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
