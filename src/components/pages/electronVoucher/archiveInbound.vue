<template>
  <div class="archive-inbound">
    <zte-table
      ref="archiveInbound"
      index-style="index"
      request-url="/archiveInbound/list"
      :row-size="3"
      excelUrl="/archiveInbound/downloadExcel"
      :buttonList="{ excel: true }"
      :search-info="searchConfig"
      :table-column="tableColumn"
      @search="search">
      <template slot="moreOperate">
        <el-button size="mini" icon="el-icon-plus" @click.native="addInboundDialogVisible = true">{{ $t('入库') }}</el-button>
      </template>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native="viewVolumeDetail(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="small" @click.native="modifyArchive(row)">{{ $t('修改') }}</el-button>
      </template>
    </zte-table>
    <!-- 查看历史记录 -->
    <el-dialog
      class="look"
      type="temp"
      width="80%"
      v-if="look.visible"
      :title="$t('分册编号') + '：' + record.serialNum"
      :visible.sync="look.visible">
      <zte-table
        index-style="index"
        layout="total, prev, pager, next"
        :pageSize="5"
        :request-url="look.requestUrl"
        :table-column="look.tableColumn"
        :params="look.params"
        :is-sortable="false">
      </zte-table>
      <p style="font-size:18px;padding:5px 0;">{{$t('调拨历史记录')}}</p>
      <zte-table
        index-style="index"
        layout="total, prev, pager, next"
        :pageSize="5"
        :request-url="record.requestUrl"
        :table-column="record.tableColumn"
        :params="record.params"
        :is-sortable="false">
      </zte-table>
    </el-dialog>
    <el-dialog
      class="archiveInbound-storage"
      width="80%"
      v-if="storage.visible"
      :title="$t('库存地点')"
      :visible.sync="storage.visible"
      @close='closeDialog'>
        <archiveBatchStorage
          ref="modifyStorage"
          :request-url="storage.requestUrl"
          :tableData="storageTableData"
          :volumeData="storageVolumeData"
          :params="storageParams"
          :showData="showLabelData"
          @picker-change='storagePickerSelect'
          @option-change='storageOptionSelect'
          @submit-success='submitToStorage'>
        </archiveBatchStorage>
     </el-dialog>

    <!-- 新增入库弹窗 -->
    <el-dialog
      class="inboundTransferDialog"
      :modal="false"
      :modal-append-to-body="false"
      :title="$t('新增入库')"
      :visible.sync="addInboundDialogVisible"
      @close='addInboundDialogVisible = false'>
      <archiveInboundOperate @back="addInboundDialogVisible = false"/>
    </el-dialog>
  </div>
</template>

<script>
import archiveInboundOperate from './archiveInboundOperate';
import archiveBatchStorage from './archiveBatchStorage';
import mixins from '../../../mixins/publicMethods';
import compare from '../../../es/utils';

export default {
  name: 'archiveInbound',
  mixins: [mixins],
  components: {
    archiveBatchStorage,
    archiveInboundOperate,
  },
  data() {
    return {
      addInboundDialogVisible: false,
      searchConfig: [
        {
          code: 'beginBookCode',
          label: '起始分册编号',
          type: 'text',
        },
        {
          code: 'endBookCode',
          label: '截止分册编号',
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
          key: 'StorageComapanyLov.find',
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
          code: 'bookEmployeeId',
          label: '分册人',
          showLabel: 'employeeName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'bookEmployeeId',
              from: 'ID',
            },
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          code: 'bookDate',
          label: '分册起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'beginBookDate',
          endCode: 'endBookDate',
          type: 'daterange',
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
          code: 'bookCode',
          label: '分册编号',
          width: 180,
        },
        {
          code: 'companyName',
          label: '结算单位',
          width: 190,
        },
        {
          code: 'employeeName',
          label: '分册人',
          width: 100,
        },
        {
          code: 'bookDate',
          label: '分册日期',
          width: 140,
        },
        {
          code: 'address',
          label: '存放地点',
          width: 370,
        },
      ],
      // 查看弹窗的数据
      look: {
        requestUrl: '/archiveBook/findBookListById',
        visible: false,
        title: ' ',
        params: {},
        tableColumn: [
          {
            code: 'bookCode',
            label: '分册编号',
          },
          {
            code: 'companyName',
            label: '结算单位',
          },
          {
            code: 'periodName',
            label: '会计期间',
          },
          {
            code: 'bookEmployeeName',
            label: '分册人',
          },
          {
            code: 'bookDate',
            label: '分册日期',
          },
          {
            code: 'bookStatusName',
            label: '状态',
          },
        ],
      },
      // 入库弹窗数据
      record: {
        requestUrl: '/archiveInbound/listBookHistory',
        visible: false,
        title: ' ',
        serialNum: '',
        // 查看弹窗 表格表头
        tableColumn: [
          {
            code: 'opPeopleName',
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
            code: 'address',
            label: '存放地点',
          },
        ],
      },
      storage: {
        requestUrl: '/archiveInbound/archiveInboundUpdate',
        visible: false,
        title: ' ',
      },
      storageVolumeData: [
        {
          code: 'cityId',
          label: '城市',
          showLabel: 'CITY_NAME',
          type: 'table',
          key: 'CityLov.find',
          required: true,
          disabled: false,
          trans: [
            {
              to: 'cityCode',
              from: 'CITY_CODE',
            },
            {
              to: 'cityName',
              from: 'CITY_NAME',
            },
          ],
        },
        {
          code: 'storageCode',
          label: '仓库',
          showLabel: 'STORAGE_NAME',
          type: 'ajax',
          options: [],
          selectCode: '',
          required: true,
          disabled: false,
          ajax: '/storage/listStorageByCityId',
          params: {
            cityId: '',
          },
          optionProps: {
            label: 'storageName',
            value: 'storageCode',
          },
        },
        {
          code: 'invArea',
          label: '区',
          showLabel: 'invArea',
          required: true,
          disabled: false,
          type: 'select',
          options: [],
          mapkey: 'L_AREA',
          optionProps: {
            label: 'libraryName',
            value: 'libraryCode',
          },
        },
        {
          code: 'invRow',
          label: '行',
          showLabel: 'invRow',
          required: true,
          disabled: false,
          type: 'select',
          options: [],
          mapkey: 'L_ROW',
          optionProps: {
            label: 'libraryName',
            value: 'libraryCode',
          },
        },
        {
          code: 'invColumn',
          label: '列',
          showLabel: 'invColumn',
          required: true,
          disabled: false,
          type: 'select',
          options: [],
          mapkey: 'L_COLUMN',
          optionProps: {
            label: 'libraryName',
            value: 'libraryCode',
          },
        },
        {
          code: 'invLevel',
          showLabel: 'invLevel',
          label: '层',
          required: true,
          disabled: false,
          type: 'select',
          options: [],
          mapkey: 'L_LEVEL',
          optionProps: {
            label: 'libraryName',
            value: 'libraryCode',
          },
        },
      ],
      storageTableData: [
        {
          cityId: '',
          storageCode: '',
          invArea: '',
          invRow: '',
          invColumn: '',
          invLevel: '',
          volumeQuantity: '',
        },
      ],
      storageParams: {
        bookId: '',
        cityId: '',
        storageCode: '',
        invArea: '',
        invRow: '',
        invColumn: '',
        invLevel: '',
      },
      showLabelData: {
        CITY_NAME: '',
        STORAGE_NAME: '',
        invArea: '',
        invRow: '',
        invColumn: '',
        invLevel: '',
      },
      inboundStorageTransKey: {
        invArea: 'L_AREA',
        invRow: 'L_ROW',
        invColumn: 'L_COLUMN',
        invLevel: 'L_LEVEL',
      },
    };
  },
  created() {
    this.getStroageLabelTitle();
  },
  methods: {
    // 获取区行层列标题
    getStroageLabelTitle() {
      this.$http.post('common/combo/list', { type: 'ATTRIBUTE' }).then(
        (res) => {
          res = res.data;
          const list = res.list;
          list.forEach((item) => {
            this.storageVolumeData.forEach((volume) => {
              if (volume.mapkey === item.key) {
                volume.label = item.value;
              }
            });
          });
        },
      ).catch();
    },
    // 查看历史记录
    viewVolumeDetail(row) {
      this.record.serialNum = row.bookCode;
      this.record.params = { bookId: row.id };
      this.look.params = { bookId: row.id };
      this.look.visible = true;
    },
    // 修改入库
    modifyArchive(row) {
      this.$http.post('/borrowProcessing/queryWarehouseAddress', { bookId: row.id }).then(
        (res) => {
          res = res.data.list[0];
          if (res.cityId) {
            this.getStorageByCityId(res);
          }
          if (res.cityId && res.storageCode) {
            this.getOtherInfoByStorageCode(res);
          }
          this.showLabelData = {
            CITY_NAME: res.city,
            STORAGE_NAME: res.storageCode,
            invArea: res.lAreaCode,
            invRow: res.aslRowCode,
            invColumn: res.lColumnCode,
            invLevel: res.lLevelCode,
          };
          this.storageParams.cityId = res.cityId;
          this.storageParams.storageCode = res.storageCode;
        },
        () => {},
      );
      this.storageParams.bookId = row.id;
      this.storage.visible = true;
    },
    // 修改入库时, 通过城市查询仓库信息
    getStorageByCityId(resData) {
      // 查询仓库
      this.storageVolumeData.forEach((row) => {
        if (row.code === 'storageCode') {
          row.params.cityId = resData.cityId;
          if (row.type === 'ajax') {
            this.$http.post(row.ajax, row.params).then(
              (res) => {
                res = res.data;
                row.options = res.list;
              },
            ).catch();
          }
        }
      });
    },
    // 修改入库时, 通过关联的仓库查询区, 行, 列, 层信息
    getOtherInfoByStorageCode(resData) {
      this.$http.post('/storage/listDimentionByStorageCode', { storageCode: resData.storageCode }).then(
        (res) => {
          res = res.data;
          const dimentionList = res.list;
          this.storageVolumeData.forEach((cloumn) => {
            const tempOptions = [];
            dimentionList.forEach((rows) => {
              if (rows.libraryAtt === cloumn.mapkey) {
                const data = {};
                data[cloumn.code] = rows[cloumn.showLabel];
                const optionObjects = Object.assign({}, data, rows);
                tempOptions.push(optionObjects);
              }
            });
            if (cloumn.code !== 'storageCode') {
              cloumn.options = tempOptions;
            }
          });
          // 设置区.行.列.层非必填项目
          this.setRequiredOption();
        },
      ).catch();
    },
    // 发起分册入库操作
    clickArchiveInbound() {
      this.$router.push('/archiveInboundOperate');
    },
    // 选择城市
    storagePickerSelect(data) {
      const keys = Object.keys(data);
      keys.forEach((key) => {
        if (key === 'CITY_ID') {
          this.storageParams.cityId = data[key];
          // 查询仓库
          this.storageVolumeData.forEach((row) => {
            if (row.code === 'storageCode') {
              row.params.cityId = data[key];
              this.handlerAjaxReq(row);
            }
          });
        }
      });
    },
    // 选择仓库, 查询 区  层 列信息 ....
    storageOptionSelect(value, columnData) {
      this.setInboundReqParams(value, columnData);
      if (columnData.code === 'storageCode') {
        columnData.selectCode = value;
        this.$http.post('/storage/listDimentionByStorageCode', { storageCode: value }).then(
          (res) => {
            res = res.data;
            const dimentionList = res.list;
            // 选择仓库-清空库 区 层的数据
            this.clearRelateData();
            // 设置区 ,层 ,列 options选项值
            this.storageVolumeData.forEach((cloumn) => {
              dimentionList.forEach((row) => {
                if (row.libraryAtt === cloumn.mapkey) {
                  const data = {};
                  data[cloumn.code] = row[cloumn.showLabel];
                  const optionObjects = Object.assign({}, data, row);
                  cloumn.options.push(optionObjects);
                }
              });
            });
            // 设置区.行.列.层非必填项目
            this.setRequiredOption();
          },
        ).catch();
      }
    },
    // 1.选择城市-清空仓库.库.区.层的数据  2. 选择仓库-清空库 区 层的数据
    clearRelateData() {
      const keys = Object.keys(this.inboundStorageTransKey);
      this.storageVolumeData.forEach((cloumn) => {
        keys.forEach((key) => {
          if (cloumn.code === key) {
            cloumn.options = [];
            this.showLabelData[cloumn.code] = '';
          }
        });
      });
    },
    // 设置区.行.列.层非必填项目
    setRequiredOption() {
      const keys = Object.keys(this.inboundStorageTransKey);
      this.storageVolumeData.forEach((cloumn) => {
        keys.forEach((key) => {
          if (cloumn.code === key) {
            if (cloumn.options.length) {
              cloumn.required = true;
              cloumn.disabled = false;
            } else {
              cloumn.required = false;
              cloumn.disabled = true;
            }
          }
        });
      });
    },
    // 选择城市后, ajax查询城市关联的仓库信息
    handlerAjaxReq(data) {
      if (data.type === 'ajax') {
        this.$http.post(data.ajax, data.params).then(
          (res) => {
            res = res.data;
            data.options = res.list;
            this.showLabelData.STORAGE_NAME = '';
            // 选择城市-清空仓库.库.区.层的数据
            this.clearRelateData();
          },
        ).catch();
      }
    },
    // 设置提交入库的参数
    setInboundReqParams(value, columnData) {
      columnData.options.forEach((row) => {
        if (columnData.code === 'storageCode' && row.storageCode === value) {
          this.storageParams.storageCode = row.storageCode;
        } else if (this.inboundStorageTransKey[columnData.code] === row.libraryAtt && row.libraryCode === value) {
          this.storageParams[columnData.code] = row.libraryCode;
        }
      });
    },
    // 入库成功
    submitToStorage() {
      this.$message.success(this.$t('更新成功'));
      this.$refs.archiveInbound.getTableData();
      this.storage.visible = false;
      this.closeDialog();
    },
    // 关闭弹窗后, 清空入库组件的数据
    closeDialog() {
      const keys = Object.keys(this.showLabelData);
      keys.forEach((key) => {
        this.showLabelData[key] = '';
      });
    },
    search(form) {
      const bool = compare(form.beginBookCode, form.endBookCode);
      if (!bool) {
        this.$message.warning(this.$t('截止分册编号不可小于起始分册编号!'));
      }
    },
  },
};
</script>

<style lang='scss'>
.archive-inbound {
  position: relative;
  .inboundTransferDialog {
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
        .archiveInbound-operate {
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
.archiveInbound-storage {
  .el-dialog {
    max-width: 1200px;
  }
  .el-dialog__body {
    .archive-batchStorage {
      .el-form {
        .allotDesc, .cityId, .storageCode, .EMPLOYEE_NAME {
          width: 50%!important;
          border-bottom: 0;
          margin-bottom: 0;
          .el-form-item__content {
            display: flex;
            .title {
              width: 120px;
              text-align: right;
              padding-right: 10px;
              line-height: 50px;
              border: 0;
            }
          }
        }
        .storageCode {
          border-right: 1px solid #dcdfe6;
        }
        .invArea, .invRow, .invColumn, .invLevel {
          width: 25%!important;
        }
      }
    }
  }
}
</style>
