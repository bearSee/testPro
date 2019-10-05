
<template>
    <div class="borrow-dialog-view" ref="borrowDialogViewPage">
      <zte-form
        border
        size="mini"
        :row-size="rowSize"
        :labelWidth='150'
        :leftLabel="true"
        :isSubmit="false"
        :isCancel="false"
        :form='form'
        :itemInfo="itemInfo && itemInfo.length ? itemInfo : defItemInfo">
        <div v-if="closeBtn" class="moreBtn" slot="moreOperate">
          <el-button @click="closeDialog">{{$t('返回')}}</el-button>
        </div>
        <el-radio-group slot="applyType" slot-scope="scope" v-model="scope.form.applyType">
          <el-radio v-show="form.applyType === 'd'" label="d">{{$t('电子档案借阅')}}</el-radio>
          <el-radio v-show="form.applyType === 's'" label="s">{{$t('实物档案借阅')}}</el-radio>
        </el-radio-group>
      </zte-form>
      <!-- 借阅申请列表 -->
      <zte-table-local
        indexStyle="index"
        :tableColumn="tableColumn && tableColumn.length ? tableColumn : defTableColumn"
        :tableData="tableData">
        <div slot="content">
            <span size="small" class="headText">{{ $t('借阅申请列表') }}</span>
        </div>
      </zte-table-local>

      <!-- 附件列表table -->
      <zte-table-local
        v-if="closeBtn"
        class="uploadList"
        indexStyle="index"
        :tableColumn="uploadColumn || defUploadListColumn"
        :tableData="uploadData">
        <div slot="content">
            <span size="small" class="headText">{{ $t('附件信息') }}</span>
        </div>
        <template slot="operate" slot-scope="{ row, $index }">
          <el-button type="text" size="mini" @click.native="download(row, $index)">{{$t('下载')}}</el-button>
        </template>
      </zte-table-local>
    </div>
</template>

<script>
import qs from 'qs';
import axios from 'axios';
import zteItem from '../modules/zte-item';
import downloadFile from '../../es/download';


export default {
  name: 'borrowDialogViewPage',
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
    closeBtn: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      defItemInfo: [
        {
          code: 'applyNum',
          label: '申请单号',
          type: 'label',
        },
        {
          code: 'applyType',
          label: '借阅类型',
          type: 'temp',
        },
        {
          code: 'employeeName',
          label: '申请人',
          type: 'label',
        },
        {
          code: 'deptName',
          label: '部门',
          type: 'label',
        },
        {
          code: 'applyDesc',
          label: '申请说明',
          type: 'label',
        },
        {
          code: 'companyName',
          label: '结算单位',
          type: 'label',
        },
      ],
      defTableColumn: [
        // {
        //   code: 'companyName',
        //   label: '结算单位',
        // },
        {
          code: 'voucherNum',
          label: '申请借阅凭证',
        },
        {
          code: 'periodName',
          label: '会计期间',
        },
        {
          code: 'voucherTypeMeaning',
          label: '凭证类型',
        },
        {
          code: 'applyDateBegin',
          label: '借阅开始时间',
          type: 'date',
        },
        {
          code: 'applyDateEnd',
          label: '借阅结束时间',
          type: 'date',
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
    };
  },
  created() {
    this.Authorization = window.localStorage.getItem('Authorization');
  },
  computed: {},
  methods: {
    // 下载上传的文件
    download(row) {
      const params = qs.stringify({
        fullFileName: row.fullFileName,
        fileOrignName: row.fileOrignName,
      });
      const instance = axios.create({
        headers: {
          'Content-Type': 'application/json',
          Authorization: window.localStorage.getItem('Authorization'),
        },
        responseType: 'blob',
        transformRequest: [d => JSON.stringify(d)],
      });
      instance.get(`/borrowApply/download?${params}`).then((res) => {
        this.$message.success(this.$t('下载成功'));
        downloadFile(row.fileOrignName, res.data);
      }).catch(() => {});
    },
    // 返回
    closeDialog() {
      this.$emit('closeDialog');
    },
  },
};
</script>

<style>
.borrow-dialog-view {
  padding: 0px 30px 30px 30px;
}
.borrow-dialog-view .el-table {
  /* font-size: 12px; */
}
.borrow-dialog-view .zte-item .el-input__inner,
.cell .el-input__inner{
  width: 60%;
}
.borrow-dialog-view .headText {
  margin: 0 10px;
  color: #606266;
  font-size: 14px;
}
.borrow-dialog-view .el-radio{
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
.borrow-dialog-view .el-input__suffix-inner {
  display: none;
}
.uploadList {
  margin-top: 55px;
}
</style>
