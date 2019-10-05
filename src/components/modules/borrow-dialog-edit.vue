
<template>
    <div class="borrow-dialog-edit" ref="borrowDialogEditPage">
      <zte-form
        border
        size="mini"
        :row-size="rowSize"
        :labelWidth='150'
        :submitText="$t('提交')"
        :leftLabel="true"
        :isCancel="false"
        :form='form'
        :itemInfo="itemInfo"
        @submit='submit'
        @change='formDataChange'
        @pickChange="pickChange">
        <template class="moreOperate" slot="moreOperate" slot-scope="scope">
          <el-button type="primary" @click.native="storage(scope.currentForm)">{{$t('存为草稿')}}</el-button>
          <el-button @click.native="addLine">{{$t('新增行')}}</el-button>
          <el-button @click="closeDialog">{{$t('返回')}}</el-button>
        </template>
        <el-radio-group slot="applyType" slot-scope="scope" v-model="scope.form.applyType" @change="choseChange(scope.form.applyType)">
          <el-radio label="d">{{$t('电子档案借阅')}}</el-radio>
          <el-radio label="s">{{$t('实物档案借阅')}}</el-radio>
        </el-radio-group>
        <template slot="content" slot-scope="scope">
          <slot name="customItemInfo" :currentForm="scope.currentForm"></slot>
        </template>
      </zte-form>
      <!-- 借阅申请列表 -->
      <zte-table-local
        ref="table"
        indexStyle="selection"
        :tableColumn="tableColumn"
        :tableData="tableData">
        <div slot="content">
          <span size="small" class="headText">{{ $t('借阅申请列表') }}</span>
        </div>
        <!-- 会计期间 -->
        <template slot="periodName" slot-scope="{ row }">
          <zte-item class="slot-form"
            :props="periodNameInfo"
            v-model="row[periodNameInfo.code]"
            :show="row[periodNameInfo.showLabel]"
            :params="Object.assign({}, periodNameInfo.params)"
            @select-change="slotValueChange($event, row)">
          </zte-item>
        </template>
        <!-- 凭证类型 -->
        <template slot="voucherTypeMeaning" slot-scope="{ row }">
          <zte-item class="slot-form"
            :props="voucherTypeInfo"
            v-model="row[voucherTypeInfo.code]"
            :show="row[voucherTypeInfo.showLabel]"
            :params="Object.assign({}, voucherTypeInfo.params)"
            @select-change="slotValueChange($event, row)">
          </zte-item>
        </template>
        <!-- 申请借阅凭证 -->
        <template slot="voucherId" slot-scope="{ row }">
          <zte-item class="slot-form"
            :props="voucherIdInfo"
            v-model="row[voucherIdInfo.code]"
            :show="row[voucherIdInfo.showLabel]"
            :params="Object.assign({}, voucherIdInfo.params)"
            @click.native.stop="getParams(row)"
            @single-picker-change="voucherIdChange($event, row)">
          </zte-item>
        </template>
        <!-- 借阅开始时间 -->
        <template slot="applyDateBegin" slot-scope="{ row }">
          <zte-item
            size="mini"
            v-model="row[applyDateBeginInfo.code]"
            :props="applyDateBeginInfo"
            @click.native.stop>
          </zte-item>
        </template>
        <!-- 借阅结束时间 -->
        <template slot="applyDateEnd" slot-scope="{ row }">
          <zte-item
            size="mini"
            v-model="row[applyDateEndInfo.code]"
            :props="applyDateEndInfo"
            @click.native.stop>
          </zte-item>
        </template>
      </zte-table-local>

      <!-- 附件列表table -->
      <zte-table-local
        class="uploadList"
        indexStyle="index"
        :tableColumn="uploadColumn || defUploadListColumn"
        :tableData="uploadData">
        <div slot="content">
            <span size="small" class="headText">{{ $t('附件信息') }}</span>
        </div>
        <template slot="operate" slot-scope="{ row, $index }">
          <el-button type="text" size="mini" @click.native="delet(row, $index)">{{$t('删除')}}</el-button>
        </template>
      </zte-table-local>

      <!-- 附件列表文件上传 -->
      <zte-table-local
        class="fileInfoList uploadList"
        :tableColumn="uploadColumn || defUploadColumn"
        :tableData="[{}]">
        <!-- 标题输入框 -->
        <template slot="title">
          <el-input size="mini" v-model="fileInfo.uploadParams.title"></el-input>
        </template>
        <!-- 摘要输入框 -->
        <template slot="description">
          <el-input size="mini" v-model="fileInfo.uploadParams.description"></el-input>
        </template>
        <!-- 上传文件框 -->
        <template slot="file">
          <el-upload
            :disabled="uploadDisabled"
            :headers="{ Authorization: Authorization }"
            :data="fileInfo.uploadParams"
            :show-file-list="false"
            :action="fileInfo.action"
            :file-list="fileInfo.list"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess">
            <el-button size="small" :disabled="uploadDisabled" type="primary">{{$t('点击上传')}}</el-button>
            <span>{{$t(uploadTips)}}</span>
          </el-upload>
        </template>
      </zte-table-local>
    </div>
</template>

<script>
import { setTimeout } from 'timers';
import qs from 'qs';
import zteItem from '../modules/zte-item';


export default {
  name: 'borrowDialogEditPage',
  components: { zteItem },
  props: {
    rowSize: {
      type: Number,
      default: 2,
    },
    itemInfo: {
      type: Array,
      default: () => ([]),
    },
    form: {
      type: Object,
      default: () => ({}),
    },
    tableColumn: {
      type: Array,
      default: () => ([]),
    },
    tableData: {
      type: Array,
      default: () => ([]),
    },
    uploadColumn: {
      type: Array,
      default: null,
    },
    uploadData: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    const date = new Date();
    const clearNum = s => (s > 9 ? `${s}` : `0${s}`);
    const disabledDate = time => `${time.getFullYear()}${clearNum(time.getMonth())}${clearNum(time.getDate())}` < `${date.getFullYear()}${clearNum(date.getMonth())}${clearNum(date.getDate())}`;
    return {
      Authorization: '',
      defUploadColumn: [
        {
          code: 'title',
          label: '标题',
          temp: 'title',
        },
        {
          code: 'description',
          label: '摘要',
          temp: 'description',
        },
        {
          code: 'file',
          label: '操作',
          temp: 'file',
        },
      ],
      defUploadListColumn: [
        {
          code: 'fileOrignName',
          label: '文件名',
        },
        {
          code: 'title',
          label: '标题',
        },
        {
          code: 'description',
          label: '摘要',
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
      uploadTips: '请先将标题摘要填写完整',
      uploadDisabled: true,
      fileInfo: {
        action: '/erssys/borrowApply/upload',
        list: [],
        uploadParams: { title: '', description: '' },
      },
      fileId: [],
      // 会计期间slot
      periodNameInfo: {
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
      // 凭证类型slot
      voucherTypeInfo: {
        code: 'voucherTypeMeaning',
        showLabel: 'voucherTypeMeaning',
        label: '凭证类型',
        required: true,
        type: 'select',
        options: [],
        fastCode: 'VOUCHER_TYPE',
      },
      // 申请借阅凭证slot
      voucherIdInfo: {
        code: 'voucherId',
        showLabel: 'voucherNum',
        label: '申请借阅凭证',
        params: { VOUCHER_STATUS: this.form.applyType === 's' ? '^WAREHOUSE' : 'WAREHOUSE^BOOKED^NOW_FLITTING' },
        type: 'table',
        key: 'ApplyVoucherLov.find',
        trans: [
          {
            to: 'voucherId',
            from: 'ID',
          },
          {
            to: 'voucherNum',
            from: 'VOUCHER_NUM',
          },
          {
            to: 'periodName',
            from: 'PERIOD_NAME',
          },
          {
            to: 'voucherTypeMeaning',
            from: 'VOUCHER_TYPE_NAME',
          },
        ],
      },
      // 借阅开始结束时间slot
      applyDateBeginInfo: {
        code: 'applyDateBegin',
        label: '借阅开始时间',
        type: 'date',
        pickerOptions: { disabledDate },
      },
      applyDateEndInfo: {
        code: 'applyDateEnd',
        label: '借阅结束时间',
        type: 'date',
        pickerOptions: { disabledDate },
      },
      currentForm: this.form,
      collectRows: [],
    };
  },
  created() {
    this.Authorization = window.localStorage.getItem('Authorization');
    this.getOptions(this.periodNameInfo);
    this.getOptions(this.voucherTypeInfo);
  },
  mounted() {
    const { tableData } = this;
    if (tableData.length) {
      this.$refs.table.toggleSelection(tableData, true);
      this.collectRows = tableData;
    }
  },
  watch: {
    fileInfo: {
      handler(val) {
        if (val.uploadParams.description === '' || val.uploadParams.title === '') {
          this.uploadTips = '请先将标题摘要填写完整';
          this.uploadDisabled = true;
          return;
        }
        this.uploadTips = '附件大小不能超过10M';
        this.uploadDisabled = false;
      },
      deep: true,
    },
    tableData: {
      handler(newVal, oldVal) {
        if (newVal.length !== oldVal.length && newVal.length) {
          // 改变tableData数据长度，已勾选selection会被重置，并且使勾选无效，添加倒计时器
          setTimeout(() => { this.$refs.table.toggleSelection(this.collectRows.concat(newVal[newVal.length - 1]), true); }, 300);
        }
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    // 电子、实物档案借阅选择
    choseChange(val) {
      if (val === 'd') this.voucherIdInfo.params.VOUCHER_STATUS = 'WAREHOUSE^BOOKED^NOW_FLITTING';
      if (val === 's') this.voucherIdInfo.params.VOUCHER_STATUS = '^WAREHOUSE';
    },
    // zte-form表单修改事件
    formDataChange(form) {
      this.currentForm = form;
    },
    pickChange(form, info) {
      if (info.code === 'companyCode') {
        const table = this.$refs.table;
        this.collectRows = table.$refs.table.selection;
        this.$emit('companyChanged', form, this.tableData);
        setTimeout(() => { this.$refs.table.toggleSelection(this.collectRows, true); }, 300);
      }
    },
    // slot
    slotValueChange(val, row) {
      row[this.voucherIdInfo.code] = '';
      row[this.voucherIdInfo.showLabel] = '';
    },
    getParams(row) {
      this.voucherIdInfo.params = Object.assign(this.voucherIdInfo.params, {
        voucherType: row[this.voucherTypeInfo.code],
        periodName: row[this.periodNameInfo.code],
        COMPANY_CODE: this.currentForm.companyCode,
      });
    },
    // voucherTypelov选择
    voucherIdChange(obj, row) {
      if (!this.currentForm.companyCode && obj.voucherId) {
        this.$message.warning(this.$t('请先选择结算单位'));
        return;
      }
      row[this.voucherIdInfo.code] = obj[this.voucherIdInfo.code];
      row[this.voucherIdInfo.showLabel] = obj[this.voucherIdInfo.showLabel];
      row[this.voucherTypeInfo.code] = obj[this.voucherTypeInfo.code];
      row[this.periodNameInfo.code] = obj[this.periodNameInfo.code];
    },
    // 提交
    submit(form) {
      const table = this.$refs.table;
      const collectRows = table.$refs.table.selection;
      if (this.checkApplyData(collectRows)) this.$emit('submit', form, collectRows, this.fileId);
    },
    // 存为草稿
    storage(form) {
      const table = this.$refs.table;
      const collectRows = table.$refs.table.selection;
      if (this.checkApplyData(collectRows)) this.$emit('storage', form, collectRows, this.fileId);
    },
    // 新增行
    addLine() {
      const table = this.$refs.table;
      this.collectRows = table.$refs.table.selection;
      this.$emit('addLine', this.tableData);
    },
    // 返回
    closeDialog() {
      this.fileInfo.uploadParams.title = '';
      this.fileInfo.uploadParams.description = '';
      this.fileId = [];
      this.$emit('closeDialog');
    },
    // 上传前
    beforeUpload(file) {
      if (!(this.fileInfo.uploadParams.title && this.fileInfo.uploadParams.description)) {
        this.$message.warning(this.$t('请将标题和摘要填写完整'));
        return false;
      }
      if (file.size > 10485760) {
        this.$message.warning(this.$t('附件大小不能超过10M'));
        return false;
      }
      return true;
    },
    // 上传成功
    uploadSuccess(res) {
      if (res.ok) {
        this.$message.success(this.$t('上传成功'));
        this.fileId.push(res.id);
        this.fileInfo = Object.assign(this.fileInfo, { uploadParams: { title: '', description: '' } });
        this.$emit('uploadSuc', res, this.uploadData);
      }
    },
    // 删除上传文件
    delet(row, $index) {
      const params = { id: row.id };
      this.$http.post('/borrowApply/deleteFileLog', params).then(
        () => {
          this.$message.warning(this.$t('删除成功'));
          this.$emit('deletFile', $index, this.uploadData);
        },
        () => {},
      );
    },
    // 获取下拉列表options
    getOptions(info, args) {
      if (info.type === 'select' || info.type === 'check') {
        if (!info.options) {
          this.$set(info, 'options', []);
        }
        if (info.ajax) {
          const params = Object.assign({}, info.params, args);
          this.$http.post(info.ajax, qs.stringify(params)).then(
            (res) => {
              res = res.data;
              info.options = res.list;
            },
          ).catch();
        } else if (info.fastCode) {
          this.$http.post('common/combo/list', { type: info.fastCode }).then(
            (res) => {
              res = res.data;
              info.options = res.list;
              info.optionProps = {
                label: 'value',
                value: 'key',
              };
            },
          ).catch();
        }
      }
    },
    // 勾选借阅申请列表数据时，判断申请借阅凭证是否有重复，开始时间是否大于结束时间
    checkApplyData(data) {
      if (!data.length) {
        this.$message({
          type: 'warning',
          message: this.$t('请至少勾选一条数据'),
        });
        return false;
      }
      let applyBool = true;
      let timeBool = true;
      data.forEach((item, index) => {
        if (item.applyDateBegin && item.applyDateEnd && (parseInt(item.applyDateBegin.replace(/[^0-9]/ig, '')) > parseInt(item.applyDateEnd.replace(/[^0-9]/ig, '')))) {
          applyBool = false;
        }
        for (let i = index + 1; i < data.length; i++) {
          if (item.voucherId && item.voucherId === data[i].voucherId) {
            timeBool = false;
            this.$message.warning(this.$t('不可同时选择相同的申请借阅凭证'));
          }
        }
      });
      if (!applyBool) {
        this.$message.warning(this.$t('借阅开始时间不可大于借阅结束时间'));
      }
      return applyBool && timeBool;
    },
  },
};
</script>

<style>
.borrow-dialog-edit {
  padding: 0px 30px 30px 30px;
}
.borrow-dialog-edit .el-table {
  /* font-size: 12px; */
}
.borrow-dialog-edit .zte-item .el-input__inner,
.cell .el-input__inner{
  /* width: 60%; */
}
.borrow-dialog-edit .headText {
  margin: 0 10px;
  color: #606266;
  font-size: 14px;
}
.borrow-dialog-edit .el-radio{
  margin: 0 30px 0 0!important;
}
.fileInfoList .el-upload .el-button {
  padding: 9px 15px!important;
}
.zte-form .el-form .content{
  margin-bottom: 0!important;
}
.zte-form .el-form .content .boxs{
  display: flex;
}
.borrow-dialog-edit .el-input__suffix-inner {
  display: none;
}
.uploadList {
  margin-top: 55px;
}
</style>
