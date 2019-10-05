<template>
<div class="zte-shuttle-tree">
  <div class="left-tree">
    <el-input
      placeholder="输入关键字进行过滤"
      v-model="leftFilterText">
    </el-input>
    <div class="tree-container">
      <el-scrollbar>
        <el-tree
          class="filter-tree"
          :data="vmData1"
          :props="defaultProps"
          :node-key="nodeKey"
          :expand-on-click-node="clickExpand"
          :default-expand-all="expandAll"
          :filter-node-method="leftFilterNode"
          show-checkbox
          ref="leftTree">
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
  <div class='middle-button'>
    <el-button @click='allPick'>
      全选
    </el-button>
    <el-button @click='append'>
      选取
    </el-button>
    <el-button @click='remove'>
      移除
    </el-button>
    <el-button @click='clear'>
      清空
    </el-button>
  </div>
  <div class='right-tree'>
    <el-input
      placeholder="输入关键字进行过滤"
      v-model="rightFilterText">
    </el-input>
    <div class="tree-container">
      <el-scrollbar>
        <el-tree
          class="filter-tree"
          :data="vmData2"
          :props="defaultProps"
          :node-key="nodeKey"
          :expand-on-click-node="clickExpand"
          :default-expand-all="expandAll"
          :filter-node-method="rightFilterNode"
          show-checkbox
          ref="rightTree">
        </el-tree>
      </el-scrollbar>
    </div>
</div>
</div>

</template>

<script>
import treeFilter from './mixins/treeFilter';

export default {
  name: 'zteShuttleTree',
  mixins: [treeFilter],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    initNode: {
      type: Array,
      default: () => [],
    },
    clickExpand: {
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
      default: 'pid',
    },
    childrenProp: {
      type: String,
      default: 'children',
    },
    labelProp: {
      type: String,
      default: 'label',
    },
    nodeClick: {
      type: Function,
      default: () => [],
    },
  },
  data() {
    return {
      vmData1: [],
      vmData2: [],
      leftFilterText: '',
      rightFilterText: '',
      defaultProps: {
        children: this.childrenProp,
        label: this.labelProp,
      },
      pickedNode: this.initNode,
    };
  },
  computed: {
  },
  watch: {
    leftFilterText(val) {
      this.filterTree(this.$refs.leftTree, this.vmData1, val);
    },
    rightFilterText(val) {
      this.filterTree(this.$refs.rightTree, this.vmData2, val);
    },
    pickedNode() {
      this.refreshTrees();
    },
    data(val) {
      this.initVmData(val);
    },
  },
  mounted() {
    this.initVmData(this.data);
  },
  methods: {
    initVmData(data) {
      this.vmData1 = JSON.parse(JSON.stringify(data));
      this.vmData2 = JSON.parse(JSON.stringify(data));
      this.$nextTick(() => {
        this.refreshTrees();
      });
    },
    refreshTrees() {
      this.filterTree(this.$refs.leftTree, this.vmData1, this.leftFilterText);
      this.filterTree(this.$refs.rightTree, this.vmData2, this.rightFilterText);
    },
    leftFilterNode(value, data) {
      const notInPicked = this.pickedNode.indexOf(data[this.nodeKey]) < 0;
      if (!value) {
        return notInPicked;
      }
      return this.matchNode(notInPicked, value, data);
    },
    rightFilterNode(value, data) {
      const inPicked = this.pickedNode.indexOf(data[this.nodeKey]) >= 0;
      if (!value) {
        return inPicked;
      }
      return this.matchNode(inPicked, value, data);
    },
    append() {
      this.pickedNode = this.pickedNode.concat(this.$refs.leftTree.getCheckedKeys());
      this.setCheckedEmpty('leftTree');
    },
    remove() {
      const removeArray = this.$refs.rightTree.getCheckedKeys();
      for (let i = 0; i < removeArray.length; i++) {
        const index = this.pickedNode.indexOf(removeArray[i]);
        if (index >= 0) {
          this.pickedNode.splice(index, 1);
        }
      }
      this.setCheckedEmpty('rightTree');
    },
    allPick() {
      this.pickedNode = this.pickedAllNodes();
      this.setCheckedEmpty('leftTree');
    },
    clear() {
      this.pickedNode = [];
      this.setCheckedEmpty('rightTree');
    },
    setCheckedEmpty(treeName) {
      const tree = this.$refs[treeName];
      tree.setCheckedKeys([]);
    },
    pickedAllNodes() {
      const nodes = [];
      const tree = this.$refs.leftTree;
      /* eslint-disable */
      for (let i = 0; i < tree.store._getAllNodes().length; i++){
        nodes.push(tree.store._getAllNodes()[i].data[this.nodeKey]);
      }
      /* eslint-enable */
      return nodes;
    },
    nodeOriginClick(data, node) {
      // 点击当前节点不触发
      if (this.currencyNode && node[this.nodeKey] === this.currencyNode[this.nodeKey]) return;
      // 检查上一节点是否处于未保存状态
      this.checkNodeUnsaved();
      if (this.unsaveFlag) return;
      // 将当前节点设置成传入节点
      this.currencyNode = node;
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";

.zte-shuttle-tree {
  display: flex;
  justify-content: space-around;
  .right-tree,.left-tree {
    width: calc(50% - 60px);
    .el-scrollbar {
      padding-top: 15px;
      height: calc(100vh - 180px);
      background-color: #fff;
      .el-scrollbar__wrap {
        overflow-x: auto;
        .el-tree{
          width: 100%;

          .custom-tree-node {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            padding-right: 8px;

            &.is-current{
              background-color: #ddd;
            }
          }
        }
        .el-tree>.el-tree-node{
          min-width: 100%;
          display: inline-block;
        }
      }
      .el-scrollbar__bar.is-horizontal{
        display: none !important;
      }
    }
  }

  .middle-button {
    display: flex;
    flex-direction: column;
    width: 80px;
    justify-content: center;

    .el-button + .el-button{
      margin-left: 0;
      margin-top: 10px;
    }

  }
}
</style>

