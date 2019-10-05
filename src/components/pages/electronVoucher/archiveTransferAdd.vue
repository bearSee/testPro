<template>
  <div class="archive-transfer-add">
    <zte-table
      ref="archiveTransferAdd"
      index-style="selection"
      :request-url="requestUrl"
      :row-size="3"
      :params="searchParams"
      :search-info="searchInfo"
      @search="search"
      :table-column="tableColumn"
      :buttonList="{ back: true }"
      @submitAction="handleSubmitAction"
      @page-back="$emit('back')">
      <div slot="content" slot-scope="{ rows, datas }">
        <volumeNumber
          ref="volumeAppend"
          :msgAlert="msgAlert"
          :volumeInput="volumeInput"
          :isWarring="msgWarring"
          clearable
          @bookCode-append="keyPress($event, datas)">
        </volumeNumber>
        <el-button size="mini" v-if="!searchInfo.length" icon="el-icon-arrow-left" @click.native="$emit('back')">{{ $t('返回') }}</el-button>
        <el-button size="mini" @click.native="handlerBatchTrans(rows)">{{ $t('批量调拨') }}</el-button>
        <el-button size="mini" @click.native="handlerBatchClear(rows)">{{ $t('批量移除') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native.stop="handlerView(row)">{{ $t('查看') }}</el-button>
        <el-button type="text" size="mini" @click.native="handlerClear(row)">{{ $t('移除') }}</el-button>
      </template>
    </zte-table>

    <el-dialog
      append-to-body
      width="80%"
      :title="$t('分册记录')"
      :visible.sync="record.dialogVisible">
      <archive-split-record
        :params="record.params"
        :recordSerialNum="record.serialNum">
      </archive-split-record>
    </el-dialog>

    <el-dialog
      class="transfer-storage"
      width="80%"
      :title="$t('公司地点')"
      :append-to-body="true"
      v-if="storage.visible"
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
import archiveSplitRecord from './archiveSplitRecord';
import archiveBatchStorage from './archiveBatchStorage';
import volumeNumber from './volumeNumber';
import compare from '../../../es/utils';

export default {
  name: 'archiveTransferAdd',
  components: {
    archiveSplitRecord,
    archiveBatchStorage,
    volumeNumber,
  },
  props: {
    // 是否新增调拨, 否就是编辑调拨单
    isAddAllot: {
      type: Boolean,
      default: true,
    },
    requestUrl: {
      type: String,
      default: '/archiveAllot/listToBeAllot',
    },
    allotIdParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      searchDatas: [
        {
          code: 'beginBookCode',
          label: '起始分册编码',
          type: 'text',
        },
        {
          code: 'endBookCode',
          label: '截止分册编码',
          type: 'text',
        },
        {
          code: 'bookEmployeeId',
          label: '分册人',
          showLabel: 'companyName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'companyName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'bookEmployeeId',
              from: 'EMPLOYEE_NUMBER',
            },
          ],
        },
        {
          code: 'beginBookDate',
          label: '起始分册日期',
          type: 'date',
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
      addTableData: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 100,
        },
        {
          code: 'bookCode',
          label: '分册编号',
          width: 200,
        },
        {
          code: 'companyName',
          label: '结算单位',
          width: 180,
        },
        {
          code: 'employeeName',
          label: '分册人',
          width: 150,
        },
        {
          code: 'periodName',
          label: '会计期间',
          width: 100,
        },
        {
          code: 'bookDate',
          label: '分册日期',
          width: 150,
        },
        {
          code: 'bookbookstatus',
          label: '状态',
          width: 100,
        },
      ],
      editTableData: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 100,
        },
        {
          code: 'bookCode',
          label: '分册编号',
          width: 200,
        },
        {
          code: 'companyName',
          label: '结算单位',
          width: 180,
        },
        {
          code: 'bookEmployeeName',
          label: '分册人',
          width: 140,
        },
        {
          code: 'periodName',
          label: '会计期间',
          width: 100,
        },
        {
          code: 'bookDate',
          label: '分册日期',
          width: 120,
        },
        {
          code: 'bookStatusValue',
          label: '状态',
          width: 100,
        },
      ],
      volumeInput: '',
      msgWarring: false,
      msgAlert: '请在分册编号框中输入打印分册上的号码，按回车键追加，谢谢!',
      appendCodes: [],
      removeCodes: [],
      appendSearchPara: {},
      selectedRows: [],
      // 查看分册凭证
      record: {
        dialogVisible: false,
        serialNum: '',
        params: {},
      },
      storage: {
        requestUrl: '/archiveAllot/allotBook',
        visible: false,
        title: ' ',
      },
      storageVolumeData: [
        {
          code: 'allotDesc',
          label: '调拨说明',
          showLabel: 'allotDesc',
          type: 'input',
        },
        // {
        //   code: 'companyId',
        //   label: '结算单位',
        //   showLabel: 'COMPANY_NAME',
        //   required: true,
        //   type: 'table',
        //   key: 'StorageComapanyLov.find',
        //   trans: [
        //     {
        //       to: 'companyId',
        //       from: 'ID',
        //     },
        //     {
        //       to: 'companyName',
        //       from: 'COMPANY_NAME',
        //     },
        //     {
        //       to: 'companyCode',
        //       from: 'COMPANY_CODE',
        //     },
        //   ],
        //   clearKeys: ['STORAGE_NAME', 'EMPLOYEE_NAME', 'storageCode', 'storageId', 'employeeNumber', 'receiveEmployeeId'],
        // },
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
          // code: 'receiveEmployeeId',
          // showLabel: 'EMPLOYEE_NAME',
          // required: true,
          // type: 'table',
          // key: 'StorageAdminLov.find',
          // trans: [
          //   {
          //     to: 'receiveEmployeeId',
          //     from: 'EMPLOYEE_NUMBER',
          //   },
          //   {
          //     to: 'employeeName',
          //     from: 'EMPLOYEE_NAME',
          //   },
          // ],
          // relatedParamKey: 'STORAGE_CODE', // 关联的lov请求参数的key
          // lovParams: {}, // 设置lov请求参数
          label: '接收人',
          code: 'EMPLOYEE_NAME',
          showLabel: 'EMPLOYEE_NAME',
          type: 'input',
          placeholder: '根据仓库信息自动匹配',
          disabled: true,
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
          allotDesc: '',
          companyId: '',
          receiveEmployeeId: '',
          cityId: '',
          storageCode: '',
          invArea: '',
          invRow: '',
          invColumn: '',
          invLevel: '',
          volumeQuantity: '',
        },
      ],
      showLabelData: {
        allotDesc: '',
        COMPANY_NAME: '',
        EMPLOYEE_NAME: '',
        CITY_NAME: '',
        STORAGE_NAME: '',
        invArea: '',
        invRow: '',
        invColumn: '',
        invLevel: '',
      },
      storageTransKey: [
        {
          ID: 'companyId',
          COMPANY_CODE: 'companyCode',
        },
        {
          ID: 'storageId',
          STORAGE_CODE: 'storageCode',
        },
        {
          ID: 'receiveEmployeeId',
          EMPLOYEE_NUMBER: 'employeeNumber',
        },
      ],
      inboundStorageTransKey: {
        invArea: 'L_AREA',
        invRow: 'L_ROW',
        invColumn: 'L_COLUMN',
        invLevel: 'L_LEVEL',
      },
      storageParams: {
        allotHeaderId: '',
        bookIds: '',
        allotDesc: '',
        companyId: '',
        companyCode: '',
        storageId: '',
        employeeNumber: '',
        receiveEmployeeId: '',
        bookId: '',
        cityId: '',
        storageCode: '',
        invArea: '',
        invRow: '',
        invColumn: '',
        invLevel: '',
      },
    };
  },
  computed: {
    searchInfo() {
      const emptyData = [];
      return this.isAddAllot ? this.searchDatas : emptyData;
    },
    searchParams() {
      return Object.assign({}, this.appendSearchPara, this.allotIdParams);
    },
    tableColumn() {
      // 新增或是编辑
      return this.isAddAllot ? this.addTableData : this.editTableData;
    },
  },
  created() {
    this.getStroageLabelTitle();
  },
  mounted() {
    if (this.allotIdParams.allotHeaderId) {
      this.storageParams.allotHeaderId = this.allotIdParams.allotHeaderId;
    }
  },
  methods: {
    handlerView(row) {
      this.record.dialogVisible = true;
      this.record.serialNum = row.bookCode;
      this.record.params = { bookId: row.id };
    },
    handlerClear(row) {
      // 如果删除的分册已经在appendCodes里, 仅仅清除appendCodes的分册
      const index = this.appendCodes.indexOf(row.bookCode);
      if (index !== -1) {
        this.appendCodes.splice(index, 1);
      }

      if (!this.isRemoveDuplicationCode(row.bookCode)) {
        this.removeCodes.push(row.bookCode);
      }
      if (this.isAddAllot) {
        this.appendSearchPara = Object.assign({}, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: this.appendCodes.join(',') });
      } else {
        const removeBookCodes = { bookIds: row.id };
        this.removeBookInfo(removeBookCodes);
      }
    },
    // 删除分册信息
    removeBookInfo(params) {
      this.$confirm(`${this.$t('此操作将永久删除入库分册')}?`, this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        this.$http.post('/archiveAllot/updateBookStatus', params).then(
          (res) => {
            res = res.data;
            if (res.ok) {
              this.$message.success(this.$t('删除成功'));
              // 重置查询参数,刷新页面
              this.appendSearchPara = Object.assign({}, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: this.appendCodes.join(',') });
            }
          },
          () => {},
        );
      });
    },
    handlerBatchTrans(rows) {
      if (rows.length) {
        const bookIds = rows.map(data => data.id);
        this.storageParams.bookIds = bookIds.join(',');
        this.storage.visible = true;
        return;
      }
      this.$message.warning(this.$t('请先勾选分册'));
    },
    handlerBatchClear(rows) {
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
        if (this.isAddAllot) {
          this.appendSearchPara = Object.assign({}, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: this.appendCodes.join(',') });
        } else {
          const ids = rows.map(data => data.id);
          const removeBookcodes = { bookIds: ids.join(',') };
          this.removeBookInfo(removeBookcodes);
        }
        return;
      }
      this.$message.warning(this.$t('请先勾选分册'));
    },
    // 分册追加
    keyPress(inputVal, datas) {
      this.volumeInput = inputVal;
      if (this.volumeInput.length > 0) {
        if (this.isDuplicationCode(datas)) {
          this.msgWarring = true;
          this.msgAlert = this.$t('分册已存在');
          return;
        }
        const index = this.removeCodes.indexOf(this.volumeInput);
        if (index !== -1) {
          this.removeCodes.splice(index, 1);
        }
        const appendArr = this.appendCodes.concat();
        appendArr.push(this.volumeInput);
        const params = Object.assign({}, this.$refs.archiveTransferAdd.searchObj, { removeBookCode: this.removeCodes.join(',') }, { appendBookCode: appendArr.join(',') });
        this.$http.post(this.requestUrl, params).then(
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
        //
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
      this.clearData();
    },
    storagePickerSelect(data) {
      let isDataChange = false;
      this.storageParams.cityId = data.CITY_ID;
      // 查询仓库
      const storageCodeItem = this.storageVolumeData.find(({ code }) => code === 'storageCode');
      storageCodeItem.params.cityId = data.CITY_ID;
      this.handlerAjaxReq(storageCodeItem);

      Object.keys(data).forEach((key) => {
        this.storageTransKey.forEach((transKeyItem) => {
          Object.keys(transKeyItem).forEach((transkey) => {
            if (key === transkey && key !== 'ID') {
              // 请求调拨时的仓库参数数据
              if (this.storageParams[transKeyItem.ID] !== data.ID) {
                this.storageParams[transKeyItem.ID] = data.ID;
                this.storageParams[transKeyItem[transkey]] = data[key];
                // 如果参数有变化, 清空相关联的参数
                isDataChange = true;
              }
            }
          });
        });
      });
      // 如果参数有变化, 清空相关联的参数
      if (isDataChange) {
        this.clearRelatedStoageData(data);
        // 选择城市-清空仓库.库.区.层的数据
        this.clearRelateData();
      }
    },
    // 清空相关联的仓库数据
    clearRelatedStoageData(data) {
      const keys = Object.keys(data);
      this.storageVolumeData.forEach((item) => {
        keys.forEach((key) => {
          if (item.showLabel === key) {
            if (item.clearKeys) {
              item.clearKeys.forEach((clearKey) => {
                if (clearKey in this.showLabelData) {
                  this.showLabelData[clearKey] = '';
                } else if (clearKey in this.storageParams) {
                  this.storageParams[clearKey] = '';
                }
              });
            }
          }
        });
      });
    },
    // 调拨成功
    submitToStorage() {
      this.$message.success(this.$t('调拨成功'));
      this.storage.visible = false;
      this.closeDialog();
      this.clearData();
      this.$emit('transfer-success');
    },
    back() {
      this.$router.go(-1);
    },
    // 关闭弹窗清空数据
    closeDialog() {
      const keys = Object.keys(this.showLabelData);
      keys.forEach((key) => {
        this.showLabelData[key] = '';
      });
    },
    clearData() {
      this.appendSearchPara = {};
      this.appendCodes = [];
      this.removeCodes = [];
      this.volumeInput = '';
      this.msgWarring = false;
      this.msgAlert = this.$t('请在分册编号框中输入打印分册上的号码，按回车键追加，谢谢');
    },
    // 入库 移植过来的代码，已经搞坨不清了------------------------------------------
    // 选择仓库, 查询 区  层 列信息 ....
    storageOptionSelect(value, columnData) {
      if (columnData.code === 'storageCode') {
        const { options } = columnData;
        const opt = options.find(({ storageCode }) => storageCode === value) || {};
        const { employeeId, employeeName, employeeNumber } = opt;
        this.showLabelData = Object.assign({}, this.showLabelData, { receiveEmployeeId: employeeId, EMPLOYEE_NAME: employeeName, employeeNumber });
      }
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
    // 通过城市查询仓库信息
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
.archive-transfer-add {
  .zte-table .content-body div {
    float: none;
  }
}
.transfer-storage {
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
        .cityId, .EMPLOYEE_NAME {
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
