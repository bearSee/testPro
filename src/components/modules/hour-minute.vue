<template>
  <div class="hour-minute">
    <div class="hour">
      <el-select :value="hour" @input="hourChange">
        <el-option
          v-for="item in hours"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      时
    </div>
    <div class="minute">
      <el-select :value="minute" @input="minuteChange">
        <el-option
          v-for="item in minutes"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      分
    </div>
  </div>
</template>

<script>
export default {
  name: 'hourMinute',
  props: {
    hour: {
      type: String,
      default: '00',
    },
    minute: {
      type: String,
      default: '00',
    },
  },
  data() {
    return {
      hours: [],
      minutes: [],
    };
  },
  created() {
    this.hours = this.initOptions(24);
    this.minutes = this.initOptions(60);
    this.$emit('update:hour', this.hour);
    this.$emit('update:minute', this.minute);
  },
  methods: {
    initOptions(num) {
      const options = [];
      for (let i = 0; i < num; i++) {
        let str = String(i);
        if (str.length === 1) {
          str = `0${str}`;
        }
        options.push({
          label: str,
          value: str,
        });
      }
      return options;
    },
    hourChange(val) {
      this.$emit('update:hour', val);
    },
    minuteChange(val) {
      this.$emit('update:minute', val);
    },
  },
};
</script>

<style lang="scss">
.hour-minute {
  position: absolute;
  width: 100%;
  &>div {
    display: inline-block;
    // width: 49%;
    min-width: 100px;
    .el-select {
      width: 75px;
    }
  }
}
</style>
