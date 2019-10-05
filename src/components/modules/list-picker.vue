<template>
  <el-dialog
    width="35%"
    ref="listPicker"
    class="list-picker"
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    append-to-body>
    <el-checkbox
      :indeterminate="isIndeterminate"
      v-model="checkAll"
      @change="handleCheckAllChange">
      全选
    </el-checkbox>
    <div style="margin: 15px 0;"></div>
    <el-checkbox-group v-model="checked" @change="handleCheckedChange">
      <div
        v-for="d in data"
        :key="d[id]">
        <el-checkbox :label="d[id]">{{d.name}}</el-checkbox>
        <span v-if="$scopedSlots" class="content" :data-code="d[id]">
          <slot name="content" :scope="d"></slot>
        </span>
      </div>
    </el-checkbox-group>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSubmit">{{ $t('确认') }}</el-button>
      <el-button @click="handleClose">{{ $t('关闭') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import zteTree from './zte-tree';

export default {
  name: 'listPicker',
  components: { zteTree },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: 'id',
    },
    ajax: String,
    title: String,
    params: Object,
    selected: String,
  },
  data() {
    return {
      data: [],
      checked: this.selected && this.selected.split(',') || [],
      checkAll: false,
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.getData();
      }
    },
    selected(val) {
      this.checked = val && val.split(',') || [];
    },
  },
  computed: {
    isIndeterminate() {
      const isIndeterminate = this.checked.length > 0 && !this.checkAll;
      return isIndeterminate;
    },
  },
  methods: {
    getData() {
      this.$http.post(this.ajax, this.params).then(
        (res) => {
          res = res.data;
          if (res.code === 0) {
            this.data = res.list;
          }
        },
      ).catch();
    },
    handleCheckedChange(value) {
      this.checked = value;
      this.checkAll = this.checked.length === this.data.length;
    },
    handleCheckAllChange(val) {
      this.checked = val ? this.data.map(d => d[this.id]) : [];
    },
    handleSubmit() {
      this.$emit('submit', this.checked);
      this.$emit('update:dialogVisible', false);
    },
    handleClose() {
      this.$emit('update:dialogVisible', false);
    },
  },
};
</script>

<style lang="scss">
.list-picker {
  .el-checkbox-group {
    .content {
      float: right;
    }
  }
}
</style>
