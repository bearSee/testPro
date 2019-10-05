<template>
  <div class="import-file">
    <el-form label-width="150px">
      <el-form-item :label="label">
        <el-input disabled v-model="fileName"></el-input>
        <div class="file-handle">
          <el-upload
            :action="importAction"
            ref="upload"
            :auto-upload="false"
            :show-file-list="false"
            name="importFile"
            accept=".xls,.xlsx"
            :on-change="fileSelected"
            :on-success="uploadSuccess">
            <el-button slot="trigger">添加文件</el-button>
            <el-button style="margin-left: 10px;" type="primary" @click.native="submitUpload">导入</el-button>
            <el-button style="margin-left: 10px;" type="primary" @click.native="download" v-if="downloadUrl">下载</el-button>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>
    <template v-for="(msg, index) in importRspData">
      <el-alert
        :key="index"
        :title="msg.msg"
        type="success"
        :closable="false"
        v-if="importRspMsg === 'S'">
      </el-alert>
      <el-alert
        :key="index"
        :title="msg.msg"
        type="error"
        :closable="false"
        v-else-if="importRspMsg === 'F'">
      </el-alert>
    </template>
  </div>
</template>

<script>
export default {
  name: 'importFile',
  props: {
    label: {
      type: String,
      default: '导入模版',
    },
    importUrl: {
      type: String,
    },
    downloadUrl: {
      type: String,
    },
    type: {
      type: String,
      default: 'static',
    },
  },
  data() {
    return {
      fileName: '',
      importRspMsg: '',
      importRspData: [],
    };
  },
  computed: {
    importAction() {
      return `${window.location.protocol}//${window.location.host}/CEM/${this.importUrl}`;
    },
  },
  methods: {
    // 选择文件
    fileSelected(file) {
      this.fileName = file.name;
      this.$refs.upload.uploadFiles = [];
      this.$refs.upload.uploadFiles.push(file);
    },
    // 导入事件
    submitUpload() {
      if (this.$refs.upload.uploadFiles.length) {
        this.$refs.upload.submit();
      } else {
        this.$message({
          message: '请选择文件！',
          type: 'warning',
        });
      }
    },
    uploadSuccess(res) {
      this.fileName = '';
      this.importRspData = res.rspData;
      this.importRspMsg = res.rspMsg;

      this.$emit('import-success', res);
    },
    // 下载模版
    download() {
      if (this.type === 'static') {
        window.open(`${window.location.protocol}//${window.location.host}/CEM/${this.downloadUrl}`);
      } else if (this.type === 'dynamic') {
        this.$http.post(this.downloadUrl).then(
          (res) => {
            res = res.body;
            window.open(`${window.location.protocol}//${window.location.host}${res.rspData}`);
          },
          () => { },
        );
      }
    },
  },
};
</script>

<style lang="scss">
.import-file {
  .el-form-item {
    margin-bottom: 0;
  }
  .el-form-item__content {
    display: flex;
    flex-flow: row nowrap;

    .file-handle {
      margin-left: 10px;
    }
    &>.el-input {
      width: 350px;
    }
  }

  .el-alert {
    margin-top: 10px;
  }
}
</style>
