<template>
  <div class="zte-item" :title="currentLabel || currentValue">
    <label v-if="disabled && props.type !== 'switch' || props.type === 'label'" class="label" :title="currentLabel">
      {{currentLabel || currentValue}}
    </label>
    <el-input
      :size="size"
      v-else-if="props.type === 'text'"
      :maxlength="props.maxlength"
      :prefix-icon="props.iconName"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请输入') + $t(props.label)) : $t('请输入')"
      :disabled="props.disabled"
      :readonly="props.readonly"
      v-model.trim="currentValue"
      @keyup.enter.native="enter"
      clearable>
    </el-input>
    <el-input
      :size="size"
      v-else-if="props.type === 'password'"
      :type="props.type"
      :maxlength="props.maxlength"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请输入') + $t(props.label)) : $t('请输入')"
      :disabled="props.disabled"
      v-model.trim="currentValue"
      @keyup.enter.native="enter"
      clearable>
    </el-input>
    <el-input
      v-else-if="props.type === 'number'"
      :type="props.type"
      :maxlength="props.maxlength"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请输入') + $t(props.label)) : $t('请输入')"
      :disabled="props.disabled"
      v-model.trim="currentValue"
      @keyup.enter.native="enter"
      clearable>
      <template v-if="props.append" slot="append">
        {{ props.append }}
      </template>
    </el-input>
    <!-- <el-input
      v-else-if="props.type === 'num'"
      :maxlength="props.maxlength"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请输入') + $t(props.label)) : $t('请输入')"
      :disabled="props.disabled"
      v-model.number="currentValue"
      clearable>
      <template v-if="props.append" slot="append">
        {{ props.append }}
      </template>
    </el-input> -->
    <input-range
      v-else-if="props.type === 'range'"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请输入') + $t(props.label)) : $t('请输入')"
      v-model="currentValue"
      :size="size"
      @keyup.enter.native="enter"
      clearable>
    </input-range>
    <el-input-number
      v-else-if="props.type === 'counter'"
      :min="props.min || 1"
      :max="props.max || 100"
      :disabled="props.disabled"
      v-model="currentValue"
      @keyup.enter.native="enter"
      clearable>
    </el-input-number>
    <el-select
      v-else-if="props.type === 'select'"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请选择') + $t(props.label)) : $t('请选择')"
      :disabled="props.disabled"
      v-model="currentValue"
      :multiple="props.multiple"
      @keyup.enter.native="enter"
      clearable
      :size="size"
      @change="handlerSelectChange">
      <el-option
        v-for="item in props.options"
        :key="item[optionProps.value]"
        :label="item[optionProps.label]"
        :value="item[optionProps.value]">
      </el-option>
    </el-select>
    <el-checkbox-group
      v-else-if="props.type === 'check'"
      :disabled="props.disabled"
      v-model="currentValue"
      @change="handlerCheckChange">
      <el-checkbox
        v-for="item in props.options"
        :key="item[optionProps.value]"
        :label="item[optionProps.value]"
        :disabled="props.disabled">
        {{item[optionProps.label]}}
      </el-checkbox>
    </el-checkbox-group>
    <el-date-picker
      v-else-if="props.type === 'date' || props.type === 'datetime' || props.type === 'daterange'"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请选择') + $t(props.label)) : $t('请选择')"
      :start-placeholder="$t('请选择')"
      :end-placeholder="$t('请选择')"
      :disabled="props.disabled"
      :type="props.type"
      v-model="currentValue"
      clearable
      :size="size"
      :picker-options="props.pickerOptions"
      :value-format="dateFormat">
    </el-date-picker>
    <el-switch
      v-else-if="props.type === 'switch'"
      :disabled="props.disabled"
      :active-value="props.on === undefined ? 'on' : props.on"
      :inactive-value="props.off === undefined ? 'off' : props.off"
      v-model="currentValue">
    </el-switch>
    <el-input
      ref="tableInput"
      v-else-if="props.type === 'table'"
      type="text"
      size="mini"
      :disabled="props.disabled"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请选择') + $t(props.label)) : $t('请选择')"
      :value="show"
      readonly
      clearable
      @clear="clear"
      @keyup.enter.native="enter"
      @click.native="!props.disabled && handlerTableClick($event)"
      prefix-icon="el-icon-search">
      <i slot="suffix" v-if="!props.disabled" class="el-input__icon el-icon-circle-close" @click="clear"></i>
    </el-input>
    <el-input
      :size="size"
      v-else-if="props.type === 'tree'"
      type="text"
      :maxlength="props.maxlength"
      :disabled="props.disabled"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请选择') + $t(props.label)) : $t('请选择')"
      :readonly="true"
      :value="show"
      clearable
      @clear="clear"
      @click.native="!props.disabled && handlerTreeClick($event)"
      prefix-icon="el-icon-search">
    </el-input>
    <el-input
      v-else-if="props.type === 'textarea'"
      type="textarea"
      :autosize="{ minRows: 4, maxRows: 8 }"
      :placeholder="isCn ? ($t(props.placeholder) || $t('请输入') + $t(props.label)) : $t('请输入')"
      :disabled="props.disabled"
      v-model="currentValue">
    </el-input>
    <el-upload
      v-else-if="props.type === 'upload'"
      :action="props.action || 'sys/file/upload'"
      :limit="props.limit"
      :on-success="uploadSuccess"
      :on-remove="uploadRemove"
      :file-list="currentValue">
      <el-button size="small" type="primary">{{$t('点击上传')}}</el-button>
      <div slot="tip" class="el-upload__tip">{{$t('只能上传jpg或png文件且不超过500kb')}}</div>
    </el-upload>
    <img class="image" v-else-if="props.type === 'image'">
    <div v-else-if="props.type === 'temp'">
      <slot :name="props.code"></slot>
    </div>
    <table-picker
      :size="size"
      v-if="props.type === 'table' && pickerVisible"
      :params="Object.assign({}, params, props.params)"
      :dialogVisible.sync="pickerVisible"
      :service="props.service"
      :table-key="props.key"
      :title="props.label"
      :selected="currentValue"
      :row-key="props.rowKey || props.code"
      :row-trans="props.trans"
      :config="props.config"
      :request-url="props.requestUrl"
      @selectChange='pickerSelect'
      @singleSelectChange='singlePickerSelect'>
    </table-picker>
    <tree-picker
      v-if="props.type === 'tree' && treeVisible"
      :params="Object.assign({}, params, props.params)"
      :dialogVisible.sync="treeVisible"
      :title="props.label"
      :service="props.service"
      :tree-key="props.key"
      :selected="currentValue"
      :click-expand="props.clickExpand"
      :click-check="props.clickCheck"
      :leaf-only="props.leafOnly"
      :half-checked="props.halfChecked"
      @selectChange='treePickerSelect'>
    </tree-picker>
  </div>
</template>

<script>
import Emitter from '../../mixins/emitter';
import inputRange from './input-range';

export default {
  name: 'zteItem',
  components: {
    inputRange,
    tablePicker: () => import('./table-picker'),
    treePicker: () => import('./tree-picker'),
  },
  mixins: [Emitter],
  props: {
    props: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: [String, Number, Array, Date],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    show: {
      type: String,
    },
    params: {
      type: Object,
    },
    size: {
      type: String,
      default: 'mini',
    },
  },
  computed: {
    isCn() {
      return this.$i18n.locale === 'zh-CN';
    },
    optionProps() {
      const optionProps = Object.assign({ label: 'label', value: 'value' }, this.props.optionProps);
      return optionProps;
    },
    currentLabel() {
      let label = '';
      if (this.props.type === 'select' && this.props.options) {
        const option = this.props.options.filter(opt => opt[this.optionProps.value] === this.currentValue)[0];
        label = option && option[this.optionProps.label];
      }
      if (this.props.type === 'table' || this.props.type === 'tree') {
        label = this.show;
      }
      return label;
    },
    dateFormat() {
      let format = '';
      if (this.props.type === 'date') {
        format = 'yyyy-MM-dd';
      }
      if (this.props.type === 'datetime') {
        format = 'yyyy-MM-dd HH:mm:ss';
      }
      if (this.props.type === 'daterange') {
        format = 'yyyy-MM-dd';
      }
      if (this.props.dateFormat) {
        format = this.props.dateFormat;
      }
      if (this.props.dateFormat === 'date') {
        format = null;
      }
      return format;
    },
    isMultiple() {
      const isMultiple =
        this.props.type === 'check' ||
        (this.props.type === 'select' && this.props.multiple === true);
      return isMultiple;
    },
  },
  data() {
    return {
      currentValue: (this.props.type === 'check' || this.isMultiple) ? (this.value && this.value.split(',') || []) : this.value,
      pickerVisible: false,
      treeVisible: false,
      editorOption: {
        placeholder: this.$t('请输入'),
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
          ],
          // syntax: {
          //   highlight: text => hljs.highlightAuto(text).value,
          // },
        },
      },
      prevParams: null,
    };
  },
  watch: {
    value(val) {
      this.currentValue = (this.props.type === 'check' || this.isMultiple) ? (val && val.split(',') || []) : val;
      this.dispatch('ElFormItem', 'el.form.change', [val]);
    },
    currentValue(val) {
      const value = (this.props.type === 'check' || this.isMultiple) ? val.join(',') : val;
      this.$emit('input', value);
      if (this.props.type === 'range') this.$emit('range-change', value);
    },
    params: {
      deep: true,
      handler() {
        if (this.props.prev
        && Object.keys(this.params).length > 0
        && this.checkPrev(this.params, this.prevParams)) {
          this.prevParams = this.params;
          this.clear();
        }
      },
    },
    fileList(val) {
      this.currentValue = val.map(file => file.url).join(',');
    },
  },
  methods: {
    enter() {
      this.$emit('enter');
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    uploadSuccess(res) {
      if (res.code === 0) {
        res.name = res.filename;
        this.currentValue.push(res);
      }
    },
    uploadRemove(file) {
      const index = this.currentValue.indexOf(file);
      this.currentValue.splice(index, 1);
    },
    ctnChange(val) {
      this.currentValue = val;
    },
    handlerTableClick(e) {
      if (this.checkPrevParams() && e.target.tagName === 'INPUT') {
        this.pickerVisible = true;
      }
    },
    handlerTreeClick(e) {
      if (this.checkPrevParams() && e.target.tagName === 'INPUT') {
        this.treeVisible = true;
      }
    },
    showLabel(value) {
      let showLabel = '';
      if (value) {
        if (value.label) {
          showLabel = value[this.props.showLabel];
        } else if (value.length) {
          showLabel = value.map(item => item[this.props.showLabel]).join(',');
        }
      }
      return showLabel;
    },
    bindKey(rows) {
      if (this.props.type === 'table' && rows) {
        return rows.map(item => item[this.props.code]).join(',');
      }
      return '';
    },
    pickerSelect(rows) {
      this.$refs.tableInput.focus();
      const obj = {
        showLabel: this.props.showLabel,
        value: this.showLabel(rows),
      };
      this.$emit('show-change', obj);
      this.currentValue = this.bindKey(rows);
    },
    singlePickerSelect(row) {
      this.$refs.tableInput.focus();
      this.$emit('single-picker-change', row[0], this.props);
    },
    treePickerSelect(checked, halfChecked) {
      if (halfChecked) {
        this.$emit('tree-pick-change',
          this.props.showLabel, checked.map(d => d.name).join(','),
          this.props.halfId, halfChecked.map(d => d.id).join(','));
      } else {
        this.$emit('tree-pick-change',
          this.props.showLabel, checked.map(d => d.name).join(','));
      }
      this.currentValue = checked.map(d => d.id).join(',');
    },
    handlerSelectChange(val) {
      this.$emit('select-change', val);
    },
    handlerCheckChange(val) {
      this.$emit('check-change', val);
    },
    checkPrev(newObj, oldObj) {
      for (const key of Object.keys(newObj)) {
        if (!oldObj[key] || newObj[key] !== oldObj[key]) {
          return true;
        }
      }
      return false;
    },
    checkPrevParams() {
      if (this.props.prev && Object.keys(this.props.prev).length > 0) {
        for (const key of Object.keys(this.props.prev)) {
          if (!this.prevParams[this.props.prev[key]]
          || this.prevParams[this.props.prev[key]] === '') {
            this.$emit('prev-need', key);
            return false;
          }
        }
      }
      return true;
    },
    clear() {
      if (this.props.type === 'table') {
        const obj = {};
        if (this.props.trans instanceof Array) {
          this.props.trans.forEach((el) => {
            obj[el.to] = '';
          });
        }
        this.$emit('single-picker-change', obj);
      }
      this.currentValue = '';
    },
  },
  created() {
    this.prevParams = this.params;
  },
};
</script>

<style lang="scss">
.zte-item {
  position: relative;
  background-color: transparent;
  .label {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .el-select {
    display: block;
  }
  .el-input {
    width: 100%;
    .el-input__icon {
      cursor: pointer;
    }
  }
  .image {
    width: 120px;
    height: 162px;
    position: relative;
    margin-left: 50%;
    transform: translateX(-50%);
  }
  .quill-editor {
    strong {
      font-weight: 700;
    }
  }
}
</style>

