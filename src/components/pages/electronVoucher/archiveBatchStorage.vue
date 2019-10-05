<template>
  <div class="archive-batchStorage">
    <el-form class="form"
      ref="ruleForm"
      :model="showData"
      :rules="currentRules">
      <template v-for="column of volumeData">
        <el-form-item
          align="left"
          :key="column.showLabel"
          :class="column.code"
          :prop="column.showLabel"
          :style="'width: ' + widthPercent + '%;'">
          <div class="title"><span v-show="column.required" style="color:#f56c6c">* </span>{{$t(column.label)}}</div>
          <el-input
            v-if="column.type === 'table'"
            type="text"
            prefix-icon="el-icon-search"
            :placeholder="column.placeholder || '请选择' + column.label"
            :disabled="column.disabled"
            clearable
            @click.native="handlerTableClick($event, column)"
            v-model="showData[column.showLabel]"
            @clear="clear">
          </el-input>
          <el-select
            v-else-if="column.type === 'ajax' || column.type === 'select'"
            :placeholder="$t('请选择') + ($t(column.label))"
            :disabled="column.disabled"
            v-model="showData[column.showLabel]"
            :multiple="column.multiple"
            clearable
            @clear="clear"
            @change="handlerSelectChange($event,column)">
            <el-option
              v-for="item in column.options"
              :key="item[column.optionProps.value]"
              :label="item[column.optionProps.label]"
              :value="item[column.optionProps.value]">
            </el-option>
          </el-select>
          <el-input
            v-else-if="column.type === 'input'"
            :disabled="column.disabled"
            :placeholder="column.placeholder || '请输入'"
            clearable
            v-model="showData[column.showLabel]">
          </el-input>
        </el-form-item>
      </template>
    </el-form>
    <div>
      <el-button class="enterBtn" type="primary" size="small" @click="submit()" :loading="loadingWait">{{$t('确认')}}</el-button>
    </div>
    <table-picker
      v-if="pickerVisible"
      :title="pickerData.label"
      :dialogVisible.sync="pickerVisible"
      :table-key="pickerData.key"
      :row-key="pickerData.code"
      :params="pickerData.lovParams"
      @singleSelectChange='singlePickerSelect'>
    </table-picker>
  </div>
</template>

<script>
import tablePicker from '../../modules/table-picker';

export default {
  name: 'archiveBatchStorage',
  components: {
    tablePicker,
  },
  props: {
    requestUrl: String,
    volumeData: {
      type: Array,
      default: () => ([]),
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    // 显示所选数据
    showData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    widthPercent() {
      return (100 / this.volumeData.length).toFixed(5);
    },
  },
  data() {
    return {
      pickerVisible: false,
      pickerData: {},
      currentRules: {},
      loadingWait: false,
    };
  },
  created() {
    this.initRules();
  },
  watch: {
    volumeData: {
      deep: true,
      handler() {
        this.initRules();
        this.$nextTick(() => {
          this.$refs.ruleForm.clearValidate();
        });
      },
    },
  },
  methods: {
    clear() {
    },
    // 初始化校验规则
    initRules() {
      const rules = {};
      const inputList = ['table', 'ajax', 'select'];
      this.volumeData.forEach((info) => {
        const rule = [];
        if (info.required) {
          const message = (inputList.indexOf(info.type) > -1 ? this.$t('请选择') : this.$t('请输入'));
          rule.push({
            type: 'string',
            required: info.required,
            message,
            trigger: ['blur', 'change'],
          });
        }
        if (rule.length) {
          rules[info.showLabel] = rule;
        }
      });
      this.currentRules = rules;
    },
    // 点击弹出table-piker
    handlerTableClick(e, column) {
      if (e.target.tagName === 'INPUT') {
        this.pickerData = column;
        this.pickerVisible = true;
      }
    },
    // 设置关联lov数据
    setRelateLovParams(rowData) {
      const keys = Object.keys(rowData);
      this.volumeData.forEach((item) => {
        keys.forEach((key) => {
          if (item.relatedParamKey && item.relatedParamKey === key) {
            item.lovParams[key] = rowData[item.relatedParamKey];
          }
        });
      });
    },
    // table-piker选择数据
    singlePickerSelect(row) {
      const rowData = row[0];
      this.setRelateLovParams(rowData);
      const keys = Object.keys(this.showData);
      keys.forEach((key) => {
        if (rowData[key]) {
          this.showData[key] = rowData[key];
        }
      });
      this.$emit('picker-change', rowData, this.pickerData);
    },
    // Option选择数据
    handlerSelectChange(val, column) {
      this.$emit('option-change', val, column);
    },
    // 提交申请
    submit() {
      // 校验规则
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.submitData();
        }
      });
    },
    submitData() {
      const keys = Object.keys(this.showData);
      const paramskeys = Object.keys(this.params);
      keys.forEach((key) => {
        paramskeys.forEach((paramskey) => {
          if (key === paramskey) {
            this.params[paramskey] = this.showData[key];
          }
        });
      });
      this.loadingWait = true;
      this.$http.post(this.requestUrl, this.params).then(
        (res) => {
          res = res.data;
          if (res.ok) {
            this.$emit('submit-success');
          }
          this.setloadingWaitTimeout();
        },
      ).catch(() => {
        this.setloadingWaitTimeout();
      });
    },
    setloadingWaitTimeout() {
      setTimeout(() => {
        this.loadingWait = false;
      }, 2000);
    },
  },
};
</script>

<style lang="scss">
.archive-batchStorage {
  .form {
    .title {
        text-align: center;
        border-bottom: 1px solid #dcdfe6;
    }
    .el-form-item {
      float: left;
      // width: 16.666%;
      border-bottom: 1px solid #dcdfe6;
      border-left: 1px solid #dcdfe6;
      border-top: 1px solid #dcdfe6;
      .el-select {
        width: 100%;
      }
      .el-input {
        padding: 5px 8px;
        .el-input__prefix {
          left: 10px;
        }
        .el-input__suffix {
          right: 10px;
        }
      }
    }
  }
  .el-form-item:last-child {
    border-right: 1px solid #dcdfe6;
  }
  .el-dialog {
    width: 60%;
  }
  .enterBtn {
    margin-top: 10px;
    float: right;
    margin-bottom: 10px;
  }
}
</style>
