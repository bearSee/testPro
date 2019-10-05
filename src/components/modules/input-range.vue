<template>
  <div class="input-range">
    <el-col :span="11">
      <el-input
        :placeholder="placeholder"
        v-model="value[0]"
        style="width: 100%;">
      </el-input>
    </el-col>
    <el-col class="line" :span="2" style="text-align: center;">-</el-col>
    <el-col :span="11">
      <el-input
        :placeholder="placeholder"
        v-model="value[1]"
        style="width: 100%;">
      </el-input>
    </el-col>
 </div>
</template>

<script type="text/javascript">

export default {
  name: 'input-range',
  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
  },
  watch: {
    value: {
      deep: true,
      handler(val) {
        this.$emit('input', val);
      },
    },
  },
};
</script>

