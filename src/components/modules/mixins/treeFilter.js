export default {
  data() {
    return {
      expandNode: [],
    };
  },
  methods: {
    filterTree(tree, data, val) {
      this.expandNode = [];
      data.map((item) => {
        item.filterFlag = false;
        return item;
      });
      tree.filter(val);
      /**
       * 当筛选条件为空,直接中断
       * 当默认需要展开的节点为空，直接中断
      */
      if (!val || !this.expandNode.length) {
        this.setTreeExpand(tree, this.expandAll);
        return;
      }
      /**
       * 当有需要展开的节点,将节点开始展开，
       * 并判断展开的节点是否存在父节点，
       * 若存在父节点，将父节点推入展开节点的array
       * 直到展开节点长度为0
       */
      this.setTreeExpand(tree, false);
      // eslint-disable-next-line
      const allNode = tree.store._getAllNodes();
      while (this.expandNode.length) {
        for (let i = 0; i < allNode.length; i++) {
          const node = allNode[i];
          const index = this.expandNode.indexOf(node.data[this.nodeKey]);
          if (index >= 0) { // 判断节点是否在需要展开的数组内
            node.expanded = true; // 展开节点
            node.data.disabled = true;
            this.expandNode.splice(index, 1); // 需要展开数组内删除该节点
            if (node.data[this.parentId]
                && !(node.data[this.parentId] === '0' || node.data[this.parentId] === '-1') // 全系统约定id为0和-1的都是顶级节点，这些节点为虚拟节点
                && this.expandNode.indexOf(node.data[this.parentId]) < 0) {
              this.expandNode.push(node.data[this.parentId]); // 若父节点不存在于展开数组内，加入展开数组
            } else if (node.data[this.nodeKey] === '0' || node.data[this.nodeKey] === '-1') {
              node.expanded = true;
            }
          }
        }
      }
    },
    expandLevel(tree) {
      if (!this.level) return;
      // eslint-disable-next-line
      const allNode = tree.store._getAllNodes();
      for (let i = 0; i < allNode.length; i++) {
        const node = allNode[i];
        if (node.level >= this.level) { // 判断节点是否在需要展开的数组内
          node.expanded = false; // 收起节点
        } else {
          node.expanded = true;
        }
      }
    },
    setChildVisable(data, flag) {
      if (data[this.childrenProp] && data[this.childrenProp].length) {
        data[this.childrenProp].map((item) => {
          item.filterFlag = flag;
          return item;
        });
      }
    },
    matchNode(flag, value, data) {
      const match = data[this.labelProp].indexOf(value) !== -1;
      const rule = match || data.filterFlag === true;
      // 当当前节点符合过滤条件，则标记其子节点可以通过过滤
      if (flag && rule) {
        if (match) {
          const pid = data[this.parentId];
          if (pid && this.expandNode.indexOf(pid) < 0) {
            this.expandNode.push(pid);
          }
        }
        this.setChildVisable(data, true);
        return true;
      }
      this.setChildVisable(data, false);
      return false;
    },
    setTreeExpand(tree, flag) {
      // eslint-disable-next-line
      const nodes = tree.store._getAllNodes();
      for (let i = 0; i < nodes.length; i++) {
        if (!('disabled' in nodes[i].data)) {
          this.$set(nodes[i].data, 'disabled', false);
        } else {
          nodes[i].data.disabled = false;
        }
        nodes[i].expanded = flag;
      }
    },
  },
};
