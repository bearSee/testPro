<template>
  <div class="month-range">
    <el-col :span="11">
      <el-select
        :placeholder="placeholder"
        v-model="value[0]"
        style="width: 100%;">
        <el-option
          v-for="item in startMonth"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="item.disabled">
        </el-option>
      </el-select>
    </el-col>
    <el-col class="line" :span="2" style="text-align: center;">-</el-col>
    <el-col :span="11">
      <el-select
        :placeholder="placeholder"
        v-model="value[1]"
        style="width: 100%;">
        <el-option
          v-for="item in endMonth"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="item.disabled">
        </el-option>
      </el-select>
    </el-col>
 </div>
</template>

<script type="text/javascript">

export default {
  name: 'month-range',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
  },
  data() {
    const month = [
      {
        label: '1月',
        value: '1',
        disabled: false,
      },
      {
        label: '2月',
        value: '2',
        disabled: false,
      },
      {
        label: '3月',
        value: '3',
        disabled: false,
      },
      {
        label: '4月',
        value: '4',
        disabled: false,
      },
      {
        label: '5月',
        value: '5',
        disabled: false,
      },
      {
        label: '6月',
        value: '6',
        disabled: false,
      },
      {
        label: '7月',
        value: '7',
        disabled: false,
      },
      {
        label: '8月',
        value: '8',
        disabled: false,
      },
      {
        label: '9月',
        value: '9',
        disabled: false,
      },
      {
        label: '10月',
        value: '10',
        disabled: false,
      },
      {
        label: '11月',
        value: '11',
        disabled: false,
      },
      {
        label: '12月',
        value: '12',
        disabled: false,
      },
    ];
    return {
      month,
    };
  },
  computed: {
    startMonth() {
      const month = this.month.map((m) => {
        m = JSON.parse(JSON.stringify(m));
        m.disabled = parseInt(m.value) > parseInt(this.value[1]);
        return m;
      });
      return month;
    },
    endMonth() {
      const month = this.month.map((m) => {
        m = JSON.parse(JSON.stringify(m));
        m.disabled = parseInt(m.value) < parseInt(this.value[0]);
        return m;
      });
      return month;
    },
  },
  mounted() {
  },
  methods: {
  },
};
</script>

