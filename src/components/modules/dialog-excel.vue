<template>
    <!-- 导出excel弹窗 -->
    <el-dialog
        class="excel"
        width="70%"
        :append-to-body="true"
        :title="$t('请选择要导出的列')"
        :visible.sync="selfVisible"
        @close="close">
        <el-table
        :data="tableColumn"
        @selection-change="getExcelChange">
            <el-table-column type="selection" />
            <el-table-column
                :prop="labelCol"
                :label="$t('标题')">
                <template slot-scope="{ row }">
                  {{$t(row.label)}}
                </template>
            </el-table-column>
            <el-table-column
                :prop="codeCol"
                :label="$t('属性')">
            </el-table-column>
        </el-table>
        <div class="btn-group">
            <el-button type="primary" @click="exportExcel(path)">{{$t('导出Excel')}}</el-button>
            <el-button @click="close">{{$t('关闭')}}</el-button>
        </div>
    </el-dialog>
</template>

<script type='text/javascript'>
import axios from 'axios';

export default {
  name: 'dialogExcel',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tableColumn: {
      type: Array,
      default: () => ([]),
    },
    labelCol: {
      type: String,
      default: 'label',
    },
    codeCol: {
      type: String,
      default: 'code',
    },
    path: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      exportExcelData: [],
    };
  },
  computed: {
    selfVisible: {
      get() {
        return this.visible;
      },
      set() {},
    },
  },
  mounted() {
  },
  methods: {
    // 封装遍历勾选到的数据并将其整合成对象的方法
    traverse(values) {
      return { attributes: values.map(item => item.code) };
    },
    // 获取选中,并赋值给exportExcelData
    getExcelChange(values) {
      this.exportExcelData = this.traverse(values);
    },
    // 关闭
    close() {
      this.selfVisible = false;
      this.$emit('close', false);
    },
    // 点击导出Excel
    exportExcel(url) {
      const instance = axios.create({
        headers: {
          'Content-Type': 'application/json',
          Authorization: window.localStorage.getItem('Authorization'),
        },
        responseType: 'blob',
        transformRequest: [d => JSON.stringify(d)],
      });
      instance.get(url, this.exportExcelData).then((res) => {
        this.$message.success(this.$t('导出成功'));
        this.download(res.data);
        this.close();
      }).catch(() => {});
    },
    // 下载
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
  },
};
</script>

<style lang='scss'>
  .btn-group {
    margin: 20px 0;
  }
</style>
