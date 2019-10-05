<template>
  <div class="zte-item-range">
    <template v-if="props.type === 'date'">
      <el-col :span="11">
        <el-date-picker
          v-model="form[props.start]"
          type="date"
          :format="format"
          :value-format="format"
          :placeholder="placeholder"
          :picker-options="startPickerOptions"
          style="width: 100%;">
        </el-date-picker>
      </el-col>
      <el-col class="line" :span="2" style="text-align: center;">-</el-col>
      <el-col :span="11">
        <el-date-picker
          :placeholder="placeholder"
          v-model="form[props.end]"
          :format="format"
          :value-format="format"
          type="date"
          :picker-options="endPickerOptions"
          style="width: 100%;"
          >
        </el-date-picker>
      </el-col>
    </template>
  </div>
</template>

<script>
export default {
  name: 'zteItemRange',
  props: {
    props: {
      type: Object,
      default: () => ({}),
    },
    form: Object,
    format: {
      type: String,
      default: 'yyyy-MM-dd',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
  },
  computed: {
    startPickerOptions() {
      return {
        disabledDate: this.startDisabledDate,
      };
    },
    endPickerOptions() {
      return {
        disabledDate: this.endDisabledDate,
      };
    },
  },
  methods: {
    startDisabledDate(time) {
      if (this.form[this.props.end]) {
        return time.getTime() > new Date(this.form[this.props.end]);
      }
      return false;
    },
    endDisabledDate(time) {
      if (this.form[this.props.start]) {
        return time.getTime() < new Date(this.form[this.props.start]);
      }
      return false;
    },
  },
};
</script>

<style lang="scss">
.zte-item-range {
  .el-input--prefix .el-input__inner {
    padding-left: 10px;
  }
  i.el-input__icon.el-icon-date {
    display: none;
  }
}
</style>

