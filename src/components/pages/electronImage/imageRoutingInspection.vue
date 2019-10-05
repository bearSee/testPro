<template>
  <div class="imageQuery">
    <zte-table
      ref="imageQuery"
      request-url="/imageInspection/listImageInspectionList"
      excelUrl="/imageInspection/exportInspectionListExcel"
      :buttonList="buttonList"
      index-style="index"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn"
      @row-check="getSelectionChange"
      :is-sortable="false"
      >
      <template class="operate" slot="operate" slot-scope="scope">
        <el-button type="text" size="mini" @click.native.stop="viewImage(scope.row)">{{$t('查看')}}</el-button>
      </template>
      <div slot="content">
      </div>
    </zte-table>
  </div>
</template>
<script type="text/javascript">

export default {
  name: 'base-config',
  data() {
    return {
      tableCheckData: null,
      // 搜索框信息
      searchConfig: [
        {
          code: 'taskNum',
          label: '影像任务编号',
          type: 'text',
        },
        {
          code: 'imageStatus',
          label: '影像文件状态',
          type: 'select',
          options: [],
          fastCode: 'IMAGE_STATUS',
        },
        {
          code: 'companyCode',
          label: '公司名称',
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
          code: 'uploadEmployeeNumber',
          label: '上传人员',
          showLabel: 'employeeName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'uploadEmployeeNumber',
              from: 'EMPLOYEE_NUMBER',
            },
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          code: 'UploadDate',
          label: '上传起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'beginUploadDate',
          endCode: 'endUploadDate',
          type: 'daterange',
        },
        {
          code: 'appraiseEmployeeNumber',
          label: '评价人',
          showLabel: 'appraiseName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'appraiseEmployeeNumber',
              from: 'EMPLOYEE_NUMBER',
            },
            {
              to: 'appraiseName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          code: 'apprDate',
          label: '评价起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'beginApprDate',
          endCode: 'endApprDate',
          type: 'daterange',
        },
        {
          code: 'appraiseType',
          label: '评价类型',
          type: 'select',
        },
      ],
      // 页面table的表头信息
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 80,
        },
        {
          code: 'taskNum',
          label: '影像任务编号',
          width: 180,
        },
        {
          code: 'imageStatusName',
          label: '影像文件状态',
          width: 100,
        },
        {
          code: 'uploadEmployee',
          label: '上传人员',
          width: 150,
        },
        {
          code: 'uploadDate',
          label: '上传时间',
          width: 140,
        },
        {
          code: 'companyName',
          label: '公司名称',
          width: 230,
        },
        {
          code: 'operationTypeName',
          label: '业务类型',
          width: 100,
        },
        {
          code: 'imageCount',
          label: '影像数量',
          width: 100,
        },
        {
          code: 'appraiseTypeValue',
          label: '评价类型',
          width: 140,
        },
        {
          code: 'appraiseEmployee',
          label: '评价人',
          width: 150,
        },
        {
          code: 'appraiseDate',
          label: '评价时间',
          width: 140,
        },
        {
          code: 'appraiseName',
          label: '评价节点',
          // width: '110',
        },
        // {
        //   code: 'memo',
        //   label: '批注',
        //   width: 150,
        // },
      ],
      buttonList: {
        excel: true,
      },
      rules: {
        appraiseType: [
          { required: true, message: '请选择操作类型', trigger: 'change' },
        ],
        appraiseDesc: [
          { required: true, message: '请填写描述', trigger: 'blur' },
        ],
      },
      // evsURL: `${window.location.protocol}//${window.location.host}/evssys/imageInspection/listImageInspectionList`,
      // evsExcel: `${window.location.protocol}//${window.location.host}/evssys/imageInspection/exportInspectionListExcel`,
    };
  },
  created() {
    window.addEventListener('focus', this.pageFocus);
    this.init();
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.pageFocus);
  },
  mounted() {
    this.init();
  },
  methods: {
    pageFocus() {
      if (this.$cookies.get('myPage_cookies') === 'true') {
        this.$refs.imageQuery.getTableData();
      }
      this.$cookies.set('myPage_cookies', 'false', '1d', '/');
    },
    init() {
      this.insetOptions(this.searchConfig, 'appraiseType');
    },
    insetOptions(arr, code) {
      arr.forEach((item) => {
        if (item.code === code) {
          this.$set(item, 'options', this.getListAppraiseDeny());
        }
      });
    },
    addRow(route) {
      this.$router.push(route);
    },
    viewImage(row) {
      window.open(`${window.location.pathname}#/imageAudit?imageInfoId=${row.id}&imageNumber=${row.imageNumber}&type=IMAGE&source=imageAudit`);
    },
    getSelectionChange(values) {
      const ids = [];
      if (values && values.length) {
        this.tableData.btnGroup.batch.disabled = false;
        values.forEach((item) => {
          ids.push({ imageInfoId: item.id });
        });
      } else {
        this.tableData.btnGroup.batch.disabled = true;
      }
      this.tableCheckData = { list: ids };
    },
    getListAppraiseDeny() {
      const arr = [];
      this.$http.post('lookup/listAppraiseDeny').then((res) => {
        res.data.list.forEach((item) => {
          arr.push({ value: item.lookupCode, label: item.meaning });
        });
      }).catch((err) => {
        this.$message(err.message);
      });
      return arr;
    },
  },
};
</script>
<style  scoped>
   .right-btn button{
     padding: 0 20px;
   }
</style>
