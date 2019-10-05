<template>
  <el-popover
    popper-class="pop-table"
    ref="popTable"
    placement="bottom"
    width="300"
    trigger="click"
    v-model="visible">
    <template slot="reference">
      <el-input
        readonly
        :placeholder="placeholder"
        :icon="clearable ? 'circle-cross' : ''"
        v-model="label"
        :on-icon-click="clearInput">
      </el-input>
    </template>
    <div class="search">
      <el-input placeholder="请输入" v-model="search"></el-input>
    </div>
    <el-table :data="gridData" @row-click="hanldeRowClick">
        <el-table-column width="299" prop="label" label=""></el-table-column>
    </el-table>
    <el-pagination
        small
        layout="prev, pager, next"
        :page-size="pageSize"
        :total="filterData.length"
        @current-change="currentChange">
    </el-pagination>
  </el-popover>
</template>

<script>
export default {
  data() {
    return {
      label: '',
      pageNum: 1,
      pageSize: 5,
      search: null,
      visible: false,
    };
  },
  props: {
    placeholder: {
      type: String,
      default: '请输入',
    },
    value: {
      type: String,
      default: '',
      required: true,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => ([]),
    },
  },
  watch: {
    value(val) {
      const item = this.options.filter(op => op.value === val)[0];
      this.label = item && item.label || '';
    },
    options(val) {
      const item = val.filter(op => op.value === this.value)[0];
      this.label = item && item.label || '';
    },
  },
  computed: {
    filterData() {
      let data = this.options;
      if (this.search) {
        data = data.filter(item => item.label.indexOf(this.search) > -1);
      }
      return data;
    },
    gridData() {
      const startIndex = (this.pageNum - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const data = this.filterData.slice(startIndex, endIndex);
      return data;
    },
  },
  methods: {
    currentChange(currentPage) {
      this.pageNum = currentPage;
    },
    hanldeRowClick(row) {
      this.visible = false;
      // this.label = row.label;
      this.$emit('input', row.value);
      this.$emit('select', row);
    },
    clearInput() {
      this.$emit('input', '');
    },
  },
};
</script>

<style lang="scss">
.pop-table {
  .search {
    z-index: 2222;
    position: absolute;
    width: 299px;
    height: 40px;
    line-height: 40px;
    .el-input {
      input {
        border: none;
        background-color: transparent;
      }
    }
  }
}
</style>

