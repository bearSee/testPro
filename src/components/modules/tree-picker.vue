<template>
  <el-dialog
    width="35%"
    ref="treePicker"
    class="tree-picker"
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    append-to-body>
    <zte-tree
      ref="zteTree"
      height="300px"
      node-key="id"
      parentId="pid"
      label-prop="name"
      :data="data"
      :selected="selected"
      :clickExpand="clickExpand"
      :clickCheck="clickCheck"
      show-checkbox>
    </zte-tree>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSubmit">{{ $t('确认') }}</el-button>
      <el-button @click="closeDialog">{{ $t('关闭') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import zteTree from './zte-tree';

export default {
  name: 'treePicker',
  components: { zteTree },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    serivce: {
      type: String,
      default: 'base',
    },
    treeKey: String,
    title: String,
    params: Object,
    selected: String,
    leafOnly: {
      type: Boolean,
      default: true,
    },
    clickExpand: {
      type: Boolean,
      default: true,
    },
    clickCheck: {
      type: Boolean,
      default: true,
    },
    halfChecked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      data: [],
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      const params = Object.assign({ lovKey: this.treeKey }, this.params);
      this.$http.post(`/${this.serivce}/lov/findTree`, params).then(
        (res) => {
          res = res.data;
          if (res.code === 0) {
            this.data = res.tree;
          }
        },
      ).catch();
    },
    handleSubmit() {
      const checked = this.$refs.zteTree.getCheckedNodes(this.leafOnly);
      const halfChecked = this.halfChecked && this.$refs.zteTree.getHalfCheckedNodes();
      this.$emit('selectChange', checked, halfChecked);
      this.$emit('update:dialogVisible', false);
    },
    handleClose() {
      this.$emit('update:dialogVisible', false);
    },
    closeDialog() {
      this.$emit('update:dialogVisible', false);
    },
  },
};
</script>

<style lang="scss">
.tree-picker {}
</style>
