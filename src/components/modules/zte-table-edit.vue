<template>
  <div class="zte-table-edit">
    <div class="search-body" v-if="searchInfo.length">
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="100px">
        <transition
          name="search-info-transition"
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          v-for="info of searchInfo"
          :key="info.code">
          <el-form-item
            v-show="info.show"
            :style="'width: ' + widthPercent + '%;'"
            :label="$t(info.label)"
            :prop="info.code">
            <zte-item
              :props="info"
              v-model="searchForm[info.code]"
              :show="searchForm[info.showLabel]"
              @show-change="showChange">
            </zte-item>
          </el-form-item>
        </transition>
        <!-- 隐藏域input解决浏览器默认提交bug -->
        <input type="text" style="display: none" v-if="searchInfo.length === 1">
        <el-form-item class="button-list" :style="'width: ' + widthPercent + '%;'">
          <el-button type="primary" @click.native="submitForm" icon="el-icon-search">查询</el-button>
          <el-button @click.native="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="more" v-if="searchInfo.length > this.expendSize" @click="searchExpend = !searchExpend">
        <i class="icon el-icon-arrow-up" v-if="searchExpend"></i>
        <i class="icon el-icon-arrow-down" v-else></i>
      </div>
    </div>
    <div class="content-body">
      <el-button icon="el-icon-plus" @click.native="rowAdd">新增</el-button>
      <slot name="content"></slot>
    </div>
    <div class="table-body">
      <el-table
        :data="currentData"
        stripe
        highlight-current-row
        style="width: 100%"
        :row-class-name="tableRowClassName"
        @current-change="handlerRowSelect"
        @selection-change="handlerRowCheck">
        <el-table-column
          v-if="indexStyle === 'selection' || indexStyle === 'index'"
          :type="indexStyle"
          width="55">
        </el-table-column>
        <el-table-column
          v-for="column of tableColumn"
          :key="column.code"
          :class-name="column.code"
          :prop="column.code"
          :label="$t(column.label)"
          :min-width="column.type ? '200' : column.width"
          :fixed="column.fixed"
          :show-overflow-tooltip="column.tips">
          <template slot-scope="scope">
            <template v-if="editInline && column.type && scope.row.isEditInRow">
              <zte-item :props="column" v-model="editRow[column.code]"></zte-item>
            </template>
            <template v-else>{{scope.row[column.code]}}</template>
          </template>
        </el-table-column>
        <el-table-column
          v-if="editInline"
          class-name="operate"
          prop="operate"
          label="操作"
          min-width="120"
          fixed="right">
          <template slot-scope="scope">
            <template v-if="!scope.row.isEditInRow">
              <el-button type="text" @click.native="rowEdit(scope.row)">编辑</el-button>
              <el-button type="text" @click.native="rowDelect(scope.row, scope.$index)">删除</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click.native="rowSave(scope.row)">保存</el-button>
              <el-button type="text" @click.native="rowCancel(scope.row)">取消</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="isPagination"
        background
        layout="total, sizes, prev, pager, next"
        :current-page="pageNum"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        :total="totalSize"
        @size-change="handlerSizeChange"
        @current-change="handlerPageChange">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import qs from 'qs';
import zteItem from './zte-item';

export default {
  name: 'zteTableEdit',
  components: { zteItem },
  props: {
    searchInfo: {
      type: Array,
      default: () => ([]),
    },
    tableColumn: {
      type: Array,
      default: () => ([]),
    },
    requestUrl: {
      type: String,
      required: true,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    autoSearch: {
      type: Boolean,
      default: true,
    },
    indexStyle: {
      type: String,
    },
    rowKey: {
      type: String,
    },
    editInline: {
      type: Boolean,
      default: false,
    },
    isPagination: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      tableData: [{ id: 1 }],
      totalSize: 0,
      searchForm: {},
      searchExpend: false,
      currentData: [],
      editRow: {},
      pageNum: 1,
      pageSize: 10,
      rowSize: 4,
      defaultRow: 1,
    };
  },
  computed: {
    searchObj() {
      const { pageSize, pageNum } = this;
      const searchObj = Object.assign({ pageSize, pageNum }, this.searchForm);
      return searchObj;
    },
    widthPercent() {
      return (100 / this.rowSize).toFixed(2);
    },
    expendSize() {
      return this.rowSize * this.defaultRow - 1;
    },
    seachIsMore() {
      return this.searchInfo.length > this.expendSize;
    },
  },
  watch: {
    searchExpend(val) {
      this.searchInfo.forEach((info, index) => {
        info.show = index < this.expendSize || val;
      });
    },
    tableData(val) {
      this.initData(val);
    },
  },
  created() {
    this.initData(this.tableData);
    this.initForm();
    this.initSelectOptions();
    if (this.editInline) {
      this.columnSelectOptions();
    }
  },
  mounted() {
    if (this.autoSearch) {
      this.$emit('search', this.searchObj);
    }
  },
  methods: {
    getTableData() {
      const params = Object.assign({}, this.searchObj, this.params);
      this.$http.post(this.requestUrl, qs.stringify(params)).then(
        (res) => {
          res = res.data;
          if (res.code === 0) {
            this.tableData = res.page.list;
            this.totalSize = res.page.totalCount;
          }
        },
      ).catch();
    },
    initData(val) {
      const data = val.map((row) => {
        if (this.editInline) this.$set(row, 'isEditInRow', false);
        return row;
      });
      this.currentData = data;
    },
    initForm() {
      const form = {};
      this.searchInfo.forEach((info, index) => {
        info.show = index < this.expendSize;
        if (info.value) {
          form[info.code] = info.value;
        }
      });
      this.searchForm = form;
    },
    initSelectOptions() {
      for (const info of this.searchInfo) {
        if (info.type === 'select' && info.params) {
          const ajax = info.ajax || 'dirctionary.ajax';
          this.$http.post(ajax, info.params).then(
            (res) => {
              res = res.data;
              this.$set(info, 'options', res);
            },
          ).catch(
            () => {
              this.$set(info, 'options', []);
            },
          );
        }
      }
    },
    submitForm() {
      this.pageNum = 1;
      this.$emit('search', this.searchObj);
    },
    resetForm() {
      this.initForm();
    },
    handlerSizeChange(currentSize) {
      this.pageSize = currentSize;
      this.pageNum = 1;
      this.$emit('search', this.searchObj);
    },
    handlerPageChange(currentPage) {
      this.pageNum = currentPage;
      this.$emit('search', this.searchObj);
    },
    handlerRowSelect(currentRow) {
      this.$emit('row-select', currentRow);
    },
    handlerRowCheck(selection) {
      this.$emit('row-check', selection);
    },
    // 行内编辑事件
    tableRowClassName({ row }) {
      const className = row.isEditInRow ? 'is-edit' : 'is-view';
      return className;
    },
    columnSelectOptions() {
      for (const info of this.tableColumn) {
        if (info.type === 'select' && info.ajax) {
          const ajax = info.ajax;
          this.$http.get(ajax).then(
            (res) => {
              res = res.data;
              if (res.code === 0 && res.page && res.page.list) {
                this.$set(info, 'options', res.page.list);
              } else {
                this.$set(info, 'options', []);
              }
            },
          ).catch(
            () => {
              this.$set(info, 'options', []);
            },
          );
        }
      }
    },
    rowAdd() {
      if (this.currentData.some(data => data.isEditInRow)) {
        this.$message.warning('请先保存数据');
        return;
      }
      const row = { isEditInRow: true };
      this.tableColumn.forEach((col) => {
        row[col.code] = '';
      });
      this.editRow = row;
      this.currentData.push(row);
    },
    rowEdit(row) {
      if (this.currentData.some(data => data.isEditInRow)) {
        this.$message.warning('请先保存数据');
        return;
      }

      this.editRow = JSON.parse(JSON.stringify(row));
      this.currentData = this.currentData.map((data) => {
        data.isEditInRow = row === data;
        return data;
      });
      this.$emit('row-edit', row);
    },
    rowDelect(row, index) {
      this.currentData.splice(index, 1);
      this.$emit('row-delete', row);
    },
    rowSave(row) {
      row.isEditInRow = false;
      for (const key in this.editRow) {
        row[key] = this.editRow[key];
      }
      this.$emit('row-save', row);
    },
    rowCancel(row) {
      this.editRow = {};
      this.currentData = this.currentData
        .map((data) => {
          data.isEditInRow = false;
          return data;
        });
      this.$emit('row-cancel', row);
    },
    showChange(showLabel, value) {
      this.currentForm[showLabel] = value;
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";

.zte-table-edit {
  [class$=-body] {
    margin-top: 15px;
    background-color: #fff;
  }

  .search-body {
    padding: 15px 20px 0 20px;
    margin: 0;

    .el-form {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;

      .el-form-item {
        margin-right: 0;
        min-width: 250px;
      }
      .button-list {
        flex: 1 0 auto;
        text-align: right;
      }
    }

    .more {
      text-align: center;
      padding: 5px;
      cursor: pointer;

      &:hover .icon {
        color: $theme;
      }
    }
  }

  .content-body {
    padding: 10px;
  }

  .table-body {
    td {
      .el-button {
        padding-top: 0;
        padding-bottom: 0;
      }
    }
    tr.is-edit td {
      padding: 4px 0;
    }
    td.operate {
      text-align: center;
    }
    .el-pagination {
      text-align: right;
      padding: 10px;
      font-weight: normal;
    }
  }
}
</style>
