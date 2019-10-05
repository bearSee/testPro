<template>
  <div class="archive-destroy">
    <zte-table
      ref="archiveDestroy"
      index-style="selection"
      request-url="/archiveDestroy/list"
      excelUrl="/archiveDestroy/excelDownload"
      :buttonList="buttonList"
      :search-info="searchInfo"
      :table-column="tableColumn"
      :selectable="selectable"
      @row-check="select">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" :disabled="btnDisabled(row)" size="mini" @click.native.stop="handlerDestroy(row)">{{ $t('销毁') }}</el-button>
        <el-button type="text" size="mini" @click="look(row)">{{ $t('查看') }}</el-button>
      </template>
      <template slot="content" slot-scope="{ rows }">
        <el-button size="small" @click.native="handlerBatchDestroy">{{ $t('批量销毁') }}</el-button>
      </template>
    </zte-table>

    <!-- 查看弹窗 -->
    <el-dialog
      fullscreen
      style="margin-bottom:20px;"
      :title="$t('分册记录')"
      :visible.sync="viewVisible">
      <zte-table
        index-style="index"
        request-url="/archiveDestroy/listVoucherByBookId"
        :isPagination="false"
        :params="view.params"
        :table-column="view.firstColumn">
        <template slot="voucherNum" slot-scope="{ row }">
          <el-button type="text" size="small" :disabled="voucherLookDisabled" @click.native="viewImage(row, '')">{{ row.voucherNum }}</el-button>
        </template>
        <div slot="content">
          <span size="small" class="headText">{{ $t('分册编号') + '：' + view.bookNum }}</span>
        </div>
      </zte-table>
      <zte-table
        index-style="index"
        request-url="/archiveDestroy/listVoucherHistoryByBook"
        :params="view.params"
        :table-column="view.secondColumn">
        <div slot="content">
          <span size="small" class="headText">{{ $t('分册历史记录') }}</span>
        </div>
      </zte-table>
      <el-button style="margin:20px 0 40px 0;" size="small" @click="viewVisible=false">{{$t('返回')}}</el-button>
    </el-dialog>
  </div>
</template>

<script>
import mixins from '../../../mixins/publicMethods';

export default {
  name: 'archiveDestroy',
  mixins: [mixins],
  data() {
    return {
      searchInfo: [
        {
          label: '分册编号',
          code: 'bookCode',
          type: 'text',
        },
        {
          label: '仓库',
          code: 'storageCode',
          type: 'table',
          showLabel: 'storageName',
          key: 'StorageLov.find',
          trans: [
            {
              to: 'storageName',
              from: 'STORAGE_NAME',
            },
            {
              to: 'storageCode',
              from: 'STORAGE_CODE',
            },
          ],
        },
        {
          code: 'warehousesName',
          label: '入库人',
          type: 'table',
          showLabel: 'warehousesName',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'warehousesName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'warehousesId',
              from: 'ID',
            },
          ],
        },
        {
          code: 'warehouseDate',
          label: '入库起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'startWarehouseDate',
          endCode: 'endWarehouseDate',
          type: 'daterange',
        },
        // {
        //   label: '起始入库日期',
        //   code: 'startWarehouseDate',
        //   type: 'date',
        // },
        // {
        //   label: '终止入库日期',
        //   code: 'endWarehouseDate',
        //   type: 'date',
        // },
      ],
      tableColumn: [
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
          width: 110,
        },
        {
          label: '分册编号',
          code: 'bookCode',
          width: 180,
        },
        {
          label: '入库人',
          code: 'employeeName',
          width: 90,
        },
        {
          label: '入库日期',
          code: 'createdDt',
          width: 150,
        },
        {
          label: '状态',
          code: 'bookstatusvalue',
          width: 70,
        },
        {
          label: '存放地点',
          code: 'address',
          width: 230,
        },
      ],
      viewVisible: false,
      view: {
        params: {},
        bookNum: '',
        firstColumn: [
          {
            label: '凭证编号',
            code: 'voucherNum',
            temp: 'voucherNum',
          },
          {
            label: '凭证类型',
            code: 'voucherTypeName',
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
            label: '制单人',
            code: 'userName',
          },
          {
            label: '制单日期',
            code: 'voucherDate',
          },
          {
            label: '提交人',
            code: 'approverName',
          },
          {
            label: '提交日期',
            code: 'approverDate',
          },
          {
            label: '凭证状态',
            code: 'voucherStatusName',
          },
        ],
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
          {
            label: '分册状态',
            code: 'bookStatus',
          },
        ],
      },
      buttonList: {
        excel: true,
      },
      selectedIds: [],
      destroyParams: {},
      voucherLookDisabled: false,
    };
  },
  methods: {
    // 控制多选框能否被选
    selectable(row) {
      if (row.bookStatus === 'DESTROYED') {
        return false;
      }
      return true;
    },
    traverse(values) {
      return values.map(item => item.id);
    },
    select(selection) {
      // this.collectRow = this.traverse(selection);
      this.selectedIds = this.traverse(selection);
    },
    look(row) {
      this.view.bookNum = row.bookCode;
      this.view.params = {
        bookId: row.id,
      };
      this.viewVisible = true;
      this.voucherLookDisabled = this.btnDisabled(row);
    },
    viewImage(row, str) {
      this.openUrl(row, str);
    },
    handlerDestroy(row) {
      this.destroyParams = {
        bookIds: row.id,
      };
      this.destroy();
    },
    handlerBatchDestroy() {
      if (this.selectedIds.length) {
        this.destroyParams = {
          bookIds: `${this.selectedIds}`,
        };
        this.destroy();
      } else {
        this.$message.warning(this.$t('请至少选择一条数据'));
      }
    },
    destroy() {
      this.$confirm(`${this.$t('是否销毁数据')}?`, this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        this.$http.post('/archiveDestroy/archiveDestroyUpdate', this.destroyParams).then(
          () => {
            this.$message.success(this.$t('销毁成功'));
            this.$refs.archiveDestroy.getTableData();
          },
          () => {},
        );
      });
    },
    btnDisabled(row) {
      return row.bookStatus === 'DESTROYED' || row.bookStatus === 'BOOKED';
    },
  },
};
</script>

<style lang="scss">
.archive-destroy {}
</style>
