<template src="../../template/system-manager/system-log.html"></template>

<script type="text/javascript">
import axios from 'axios';
import downloadData from '@/es/download';
import table from '../../modules/zte-table';


export default {
  name: 'system-log',
  components: {
    'zte-table': table,
  },
  data() {
    return {
      exportExcelData: null,
      searchConfig: [
        {
          code: 'employeeNumber',
          label: '员工工号',
          type: 'text',
        },
        {
          code: 'employeeName',
          label: '员工姓名',
          type: 'text',
        },
        {
          code: 'logType',
          label: '日志类型',
          type: 'select',
          options: [],
          fastCode: 'LOG_TYPE',
        },
        {
          code: 'ip',
          label: '用户IP',
          type: 'text',
        },
        {
          code: 'createStartDt',
          label: '操作开始时间',
          type: 'date',
        },
        {
          code: 'createEndDt',
          label: '操作结束时间',
          type: 'date',
        },
      ],
      tableData: {
        tableHead: {
          value: '查询结果列表',
        },
        excelText: {
          value: '导出EXCEL',
        },
      },
      dialog: {
        excel: {
          visible: false,
          title: '请选择要导出的列',
          tableColumn: [
            {
              code: 'employeeNumber',
              label: '工号',
              attribute: 'employeeNumber',
            },
            {
              code: 'employeeName',
              label: '姓名',
              attribute: 'employeeName',
            },
            {
              code: 'ip',
              label: '用户IP',
              attribute: 'ip',
            },
            {
              code: 'logType',
              label: '日志类型',
              attribute: 'logType',
            },
            {
              code: 'createdDt',
              label: '操作时间',
              attribute: 'createdDt',
            },
            {
              code: 'descript',
              label: '操作内容',
              attribute: 'descript',
            },
          ],
        },
      },
      tableColumn: [
        {
          code: 'employeeNumber',
          label: '工号',
        },
        {
          code: 'employeeName',
          label: '姓名',
        },
        {
          code: 'ip',
          label: '用户IP',
        },
        {
          code: 'logType',
          label: '日志类型',
        },
        {
          code: 'createdDt',
          label: '操作时间',
        },
        {
          code: 'descript',
          label: '操作内容',
        },
      ],
    };
  },
  methods: {
    download(data) {
      if (!data) {
        return;
      }
      // 通过window.URL.createObjectURL(new Blob()) . indexOf(location.host) < 0 或 'msSaveOrOpenBlob' in navigator
      // 来检测是否是IE或早期生成Object URL不带域名的Edge。如果表达式返回true则时IE或Edge旧版本。
      if ('msSaveOrOpenBlob' in navigator) {
        // Microsoft Edge and Microsoft Internet Explorer 10-11
        window.navigator.msSaveOrOpenBlob(data, 'excel.xlsx');
      } else {
        // standard code for Google Chrome, Mozilla Firefox etc
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', 'excel.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    exportExcel() {
      const instance = axios.create({
        headers: {
          'Content-Type': 'application/json',
          Authorization: window.localStorage.getItem('Authorization'),
        },
        responseType: 'blob',
        transformRequest: [d => JSON.stringify(d)],
      });
      instance.post('log/exportExcel', this.exportExcelData).then((res) => {
        downloadData('系统日志.xlsx', res.data);
        this.dialog.excel.visible = false;
      }).catch(() => {});
    },
    selectable(row) {
      return row && row.imageModifyFlag;
    },
    getExcelChange(values) {
      const arr = [];
      values.forEach((item) => {
        arr.push(item.code);
      });
      // const str = arr.join(',');
      this.exportExcelData = Object.assign(this.$refs.systemLog.searchForm, { keys: arr });
    },
  },
};
</script>
