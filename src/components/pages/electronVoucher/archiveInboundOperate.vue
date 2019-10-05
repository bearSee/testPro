<template>
  <div class="archiveInbound-operate">
    <zte-table
      ref="archiveInboundOperate"
      index-style="selection"
      size="mini"
      request-url="/archiveInbound/listToBeInbound"
      :row-size="3"
      :buttonList="{ back: true }"
      :params="appendSearchPara"
      :search-info="searchConfig"
      @search="search"
      :table-column="tableColumn"
      @submitAction="handleSubmitAction"
      @page-back="$emit('back')">
      <div slot="content" slot-scope="{ rows, datas}">
        <volumeNumber
          ref="volumeAppend"
          :msgAlert="msgAlert"
          :volumeInput="volumeInput"
          :isWarring="msgWarring"
          clearable
          @bookCode-append="keyPress($event, datas)"
          @clear="clear">
        </volumeNumber>
        <el-button size="small" @click.native="batchStorage(rows)">{{ $t('批量入库') }}</el-button>
        <el-button size="small" @click.native="batchRemove(rows)">{{ $t('批量移除') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native.stop="viewArchive(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="small" @click.native="removeArchive(row)">{{ $t('移除') }}</el-button>
      </template>
    </zte-table>
    <!-- 查看弹窗 -->
    <el-dialog
      width="80%"
      append-to-body
      :title="$t('分册记录')"
      :visible.sync="record.dialogVisible">
      <archive-split-record
        :params="record.params"
        :recordSerialNum="record.serialNum">
      </archive-split-record>
    </el-dialog>
    <el-dialog
      class="archiveInbound-storage"
      width="80%"
      append-to-body
      v-if="storage.visible"
      :title="$t('库存地点')"
      :visible.sync="storage.visible"
      @close='closeDialog'>
      <archiveBatchStorage
      ref="enterStorage"
      :request-url="storage.requestUrl"
      :volumeData="storageVolumeData"
      :tableData="storageTableData"
      :params="storageParams"
      :showData="showLabelData"
      @picker-change='storagePickerSelect'
      @option-change='storageOptionSelect'
      @submit-success='submitToStorage'>
      </archiveBatchStorage>
     </el-dialog>
  </div>
</template>

<script>
import archiveBatchStorage from './archiveBatchStorage';
import volumeNumber from './volumeNumber';
import archiveSplitRecord from './archiveSplitRecord';
import compare from '../../../es/utils';

export default {
  name: 'archiveInboundOperate',
  components: {
    archiveBatchStorage,
    volumeNumber,
    archiveSplitRecord,
  },
  data() {
    return {
      searchObj: {},
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
              from: 'EMPLOYEE_NUMBER',
            },
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          code: 'BookDate',
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
          width: 200,
        },
        {
          code: 'periodName',
          label: '会计期间',
          width: 100,
        },
        {
          code: 'employeeName',
          label: '分册人',
          width: 120,
        },
        {
          code: 'bookDate',
          label: '分册日期',
          width: 120,
        },
        {
          code: 'bookbookstatus',
          label: '状态',
          width: 100,
        },
      ],
      // 查看分册凭证
      record: {
        dialogVisible: false,
        serialNum: '',
        params: {},
      },

      volumeInput: '',
      msgAlert: '请在分册编号框中输入打印分册上的号码，按回车键追加，谢谢!',
      appendCodes: [],
      removeCodes: [],
      appendSearchPara: {},
      storage: {
        requestUrl: '/archiveInbound/archiveInbound',
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
          required: true,
          disabled: false,
          type: 'ajax',
          options: [],
          selectCode: '',
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
          required: true,
          disabled: false,
          label: '层',
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
        },
      ],
      showLabelData: {
        CITY_NAME: '',
        STORAGE_NAME: '',
        invArea: '',
        invRow: '',
        invColumn: '',
        invLevel: '',
      },
      storageParams: {
        bookIds: '',
        cityId: '',
        storageCode: '',
        invArea: '',
        invRow: '',
        invColumn: '',
        invLevel: '',
      },
      storageTransKey: {
        invArea: 'L_AREA',
        invRow: 'L_ROW',
        invColumn: 'L_COLUMN',
        invLevel: 'L_LEVEL',
      },
      msgWarring: false,
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
    batchStorage(rows) {
      if (rows.length) {
        const bookIds = rows.map(data => data.id);
        this.storageParams.bookIds = bookIds.join(',');
        this.storage.visible = true;
        return;
      }
      this.$message.warning(this.$t('请先勾选分册'));
    },
    // 批量删除
    batchRemove(rows) {
      if (rows.length) {
        // 如果删除的分册已经在appendCodes里, 仅仅清除appendCodes的分册
        rows.forEach((data) => {
          const index = this.appendCodes.indexOf(data.bookCode);
          if (index !== -1) {
            this.appendCodes.splice(index, 1);
          }
          if (!this.isRemoveDuplicationCode(data.bookCode)) {
            this.removeCodes.push(data.bookCode);
          }
        });
        this.appendSearchPara = Object.assign({}, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: this.appendCodes.join(',') });
        return;
      }
      this.$message.warning(this.$t('请先勾选分册'));
    },
    // 查看分册信息
    viewArchive(row) {
      this.record.dialogVisible = true;
      this.record.serialNum = row.bookCode;
      this.record.params = { bookId: row.id };
    },
    // 单册删除
    removeArchive(row) {
      // 如果删除的分册已经在appendCodes里, 仅仅清除appendCodes的分册
      const index = this.appendCodes.indexOf(row.bookCode);
      if (index !== -1) {
        this.appendCodes.splice(index, 1);
      }
      if (!this.isRemoveDuplicationCode(row.bookCode)) {
        this.removeCodes.push(row.bookCode);
      }
      this.appendSearchPara = Object.assign({}, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: this.appendCodes.join(',') });
    },
    // 分册追加
    keyPress(inputVal, datas) {
      this.volumeInput = inputVal;
      if (this.volumeInput.length > 0) {
        if (this.isDuplicationCode(datas)) {
          this.msgWarring = true;
          this.msgAlert = this.$t('分册已存在');
          // this.$message.warning(this.$t('分册已存在'));
          return;
        }
        const index = this.removeCodes.indexOf(this.volumeInput);
        if (index !== -1) {
          this.removeCodes.splice(index, 1);
        }
        const appendArr = this.appendCodes.concat();
        appendArr.push(this.volumeInput);
        const params = Object.assign({}, this.$refs.archiveInboundOperate.searchObj, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: appendArr.join(',') });
        this.$http.post('/archiveInbound/listToBeInbound', params).then(
          (res) => {
            res = res.data;
            if (res.ok) {
              this.appendCodes.push(this.volumeInput);
              this.appendSearchPara = Object.assign({}, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: this.appendCodes.join(',') });
            }
          },
          (err) => {
            this.msgAlert = err.data.message;
            this.msgWarring = true;
          },
        );
      }
    },
    // 不重复添加
    isDuplicationCode(datas) {
      // 是否在table中可查
      const isInTable = datas.some(item => item.bookCode === this.volumeInput);
      // 是否在追加分册中可查
      const isDuplicationAppdend = this.appendCodes.some(code => code === this.volumeInput);
      return isDuplicationAppdend || isInTable;
    },
    // 不重复删除
    isRemoveDuplicationCode(removeCode) {
      let isDuplication = false;
      isDuplication = this.removeCodes.some(code => code === removeCode);
      return isDuplication;
    },
    // table查询清空追加分册数据
    handleSubmitAction() {
      this.appendSearchPara = {};
      this.appendCodes = [];
      this.removeCodes = [];
      this.volumeInput = '';
      this.msgWarring = false;
      this.msgAlert = this.$t('请在分册编号框中输入打印分册上的号码，按回车键追加，谢谢');
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
    // 选择仓库,查询 区 行 层 列信息 ....
    storageOptionSelect(value, columnData) {
      this.setInboundReqParams(value, columnData);
      if (columnData.code === 'storageCode') {
        columnData.selectCode = value;
        this.$http.post('/storage/listDimentionByStorageCode', { storageCode: value }).then(
          (res) => {
            res = res.data;
            const dimentionList = res.list;
            // 选择仓库-清空区 行 区 层的数据
            this.clearRelateData();
            this.storageVolumeData.forEach((cloumn) => {
              dimentionList.forEach((row) => {
                if (row.libraryAtt === cloumn.mapkey) {
                  const data = {};
                  data[cloumn.code] = row[cloumn.showLabel];
                  const optionObjects = Object.assign({}, data, row);
                  cloumn.options.push(optionObjects);
                }
              });
              // 设置区.行.列.层非必填项目
              this.setRequiredOption();
            });
          },
        ).catch();
      }
    },
    // 1.选择城市-清空仓库.区.行.列.层的数据  2. 选择仓库-清空区.行.层.列的数据
    clearRelateData() {
      const keys = Object.keys(this.storageTransKey);
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
      const keys = Object.keys(this.storageTransKey);
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
      // 查询仓库
      columnData.options.forEach((row) => {
        if (columnData.code === 'storageCode' && row.storageCode === value) {
          this.storageParams.storageCode = row.storageCode;
        } else if (this.storageTransKey[columnData.code] === row.libraryAtt && row.libraryCode === value) {
          this.storageParams[columnData.code] = row.libraryCode;
        }
      });
    },
    // 提交入库
    submitToStorage() {
      this.$message.success(this.$t('入库成功'));
      this.$refs.archiveInboundOperate.getTableData();
      this.storage.visible = false;
      this.closeDialog();
    },
    closeDialog() {
      const keys = Object.keys(this.showLabelData);
      keys.forEach((key) => {
        this.showLabelData[key] = '';
      });
    },
    clear() {
      this.volumeInput = '';
    },
    search(form) {
      const bool = compare(form.beginBookCode, form.endBookCode);
      if (!bool) {
        this.$message.warning(this.$t('截止调拨编号不可小于起始调拨编号!'));
      }
    },
  },
};
</script>

<style lang="scss">
//@import "../../assets/scss/theme.scss";
.archiveInbound-operate  {
  .zte-table .content-body div {
    float: none;
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
