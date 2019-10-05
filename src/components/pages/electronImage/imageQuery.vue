<template>
  <div class="imageQuery">
    <zte-table
      ref="imageQuery"
      request-url="/imageQuery/list/page"
      index-style="index"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn"
      :autoSearch="true"
      :is-sortable="false">
      <div slot="content"></div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native="viewImage(row)">{{ $t('查看') }}</el-button>
      </template>
    </zte-table>
  </div>
</template>

<script type="text/javascript">
import zteTable from '../../modules/zte-table';

export default {
  name: 'imageQuery',
  components: {
    zteTable,
  },
  data() {
    return {
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
          code: 'operationTypeCode',
          label: '业务类型',
          showLabel: 'operationTypeName',
          type: 'table',
          key: 'OperationTypeLov.find',
          trans: [
            {
              to: 'operationTypeCode',
              from: 'OPERATION_TYPE_CODE',
            },
            {
              to: 'operationTypeName',
              from: 'OPERATION_TYPE_NAME',
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
        // {
        //   code: 'startUploadDate',
        //   label: '上传起始日期',
        //   type: 'date',
        // },
        // {
        //   code: 'endUploadDate',
        //   label: '上传截止日期',
        //   type: 'date',
        // },
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
          code: 'uploadEmployeeName',
          label: '上传人员',
          width: 150,
        },
        {
          code: 'uploadDate',
          label: '上传时间',
          width: 150,
        },
        {
          code: 'companyName',
          label: '公司名称',
          width: 250,
        },
        {
          code: 'imageStatus',
          label: '影像文件状态',
          width: 100,
        },
        {
          code: 'operationTypeName',
          label: '业务类型',
          // width: '60',
        },
        {
          code: 'imageCount',
          label: '影像数量',
          width: 100,
        },
      ],
      comment: {
        id: null,
        title: this.$t('评价记录'),
        isVisible: false,
      },
      // evsURL: `${window.location.protocol}//${window.location.host}/evssys/imageQuery/list/page`,
    };
  },
  methods: {
    viewImage(row) {
      window.open(`${window.location.pathname}#/imageView?imageInfoId=${row.id}&imageNumber=${row.imageNumber}&type=IMAGE&source=imageQurey`);
    },
  },
};
</script>
