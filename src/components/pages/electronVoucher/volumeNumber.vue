<template>
  <div class="volume-Append">
    <div class="volume-input">
      <div class="title"> {{ $t('分册编号:') }}</div>
      <el-input
        type="text"
        v-model="inputVal"
        clearable
        @keyup.enter.native="keyPress"
        @clear="clearAction">
      </el-input>
    </div>
    <div class="volume-input">
      <div class="title"> {{ $t('温馨提示:') }}</div>
      <el-alert :title="msgAlert" :type="isWarring ? 'error' : 'info'" style="padding:6px 8px" :closable="false"></el-alert>
    </div>
  </div>
</template>

<script>

export default {
  name: 'volumeNumber',
  props: {
    msgAlert: {
      type: String,
    },
    volumeInput: {
      type: String,
    },
    isWarring: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputVal: '',
    };
  },
  created() {
    this.inputVal = this.volumeInput;
  },
  methods: {
    keyPress() {
      this.$emit('bookCode-append', this.inputVal);
    },
    clearAction() {
      this.inputVal = '';
    },
  },
};
</script>

<style lang="scss">
  .volume-Append {
    background-color: #fff;
    padding: 20px;
    margin: 10px 0px;
    vertical-align: middle;
    font-size: 14px;
    color: #606266;

    .volume-input {
      display: flex;
      flex-flow: row nowrap;
      width: 50%;
      padding-bottom: 10px;
      .title {
        width: 80px;
        margin-top: 8px;
      }
      .el-input {
        .el-input__inner {
          height: 28px;
        }
      }
    }
  }
</style>
