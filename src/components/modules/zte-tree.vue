<template>
<div class="zte-tree">
  <el-input
    placeholder="输入关键字进行过滤"
    v-model="filterText">
  </el-input>
  <div class="tree-container">
    <el-scrollbar :style="heightObj">
      <el-tree
        ref="tree"
        class="filter-tree"
        :data="data"
        :indent='12'
        :show-checkbox="showCheckbox"
        :node-key="nodeKey"
        :props="defaultProps"
        :check-on-click-node="clickCheck"
        :expand-on-click-node="clickExpand"
        :default-expand-all="expandAll"
        :filter-node-method="filterNode"
        :highlight-current="highlight"
        @node-click="nodeOriginClick">
      </el-tree>
    </el-scrollbar>
  </div>
</div>
</template>

<script>
import treeFilter from './mixins/treeFilter';

export default {
  name: 'zteTree',
  mixins: [treeFilter],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    clickExpand: {
      type: Boolean,
      default: true,
    },
    clickCheck: {
      type: Boolean,
      default: true,
    },
    expandAll: {
      type: Boolean,
      default: true,
    },
    nodeKey: {
      type: String,
      default: 'id',
    },
    parentId: {
      type: String,
      default: 'parentId',
    },
    childrenProp: {
      type: String,
      default: 'children',
    },
    labelProp: {
      type: String,
      default: 'name',
    },
    highlight: {
      type: Boolean,
      default: false,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
    },
    selected: {
      type: String,
      default: '',
    },
    level: {
      type: Number,
    },
  },
  data() {
    return {
      filterText: '',
      defaultProps: {
        children: this.childrenProp,
        label: this.labelProp,
      },
      currencyNode: {},
    };
  },
  computed: {
    heightObj() {
      return this.height ? { height: this.height } : {};
    },
  },
  watch: {
    filterText(val) {
      this.filterTree(this.$refs.tree, this.data, val);
    },
    data() {
      this.$nextTick(() => {
        this.expandLevel(this.$refs.tree);
      });
    },
  },
  methods: {
    filterNode(value, data) {
      // 当过滤字段为空时不做任何处理
      if (!value) {
        return true;
      }
      return this.matchNode(true, value, data);
    },
    nodeOriginClick(data, node) {
      this.$emit('node-click', node);
    },
    getCheckedNodes(leafOnly) {
      return this.$refs.tree.getCheckedNodes(leafOnly);
    },
    getHalfCheckedNodes() {
      return this.$refs.tree.getHalfCheckedNodes();
    },
    setCheckedNodes(array) {
      this.$refs.tree.setCheckedNodes(array);
    },
    setCheckedkeys(array) {
      this.$refs.tree.setCheckedKeys(array);
    },
  },
  mounted() {
    if (this.selected) {
      this.setCheckedkeys(this.selected.split(','));
    }
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";
.zte-tree {
  background-color: #fff;
  .el-input {
    padding: 9px;
  }
  .el-scrollbar {
    height: calc(100vh - 200px);
    .el-scrollbar__wrap {
      overflow-x: auto;
      .el-scrollbar__view {
        min-width: 100%;
        // display: inline-block;
        .el-tree {
          min-width: 100%;
          display: inline-block;
          .el-tree-node {
            &.is-current>.el-tree-node__content {
              background-color:#f5f7fa;
            }
          }
        }
        .el-tree>.el-tree-node {
          min-width: 100%;
          display: inline-block;
        }
      }
    }
    .el-scrollbar__bar.is-horizontal{
      display: none !important;
    }
  }
}
</style>

