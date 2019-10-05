
<template>

  <div class="zte-table-local">
     <div class="search-body" v-if="searchInfo.length">
      <el-form
        ref="searchForm"
        :size="size"
        :model="searchForm"
        :rules="rules"
        :label-width="labelWidth * (isCn ? 1 : 1.5) + 'px'"
        :label-position="lablePosition">
        <transition
          name="search-info-transition"
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          v-for="(info, index) of searchInfo"
          :key="info.code">
          <el-form-item
            v-if="info.show !== false"
            v-show="searchExpend || expendAll ? index < searchInfo.length : index < expendSize"
            :class="info.code"
            :style="'width:' + widthPercent + '%;'"
            :label="$t(info.label)"
            :prop="info.code">
            <zte-item v-if="!info.range"
              :props="info"
              :format="info.format"
              v-model="searchForm[info.code]"
              :show="searchForm[info.showLabel]"
              :params="Object.assign({}, info.params, info.code)"
              @show-change="showChange"
              @single-picker-change="pickerChange"
              @tree-pick-change="treeChange"
              @range-change="handlerRangeChange($event, info)"
              >
            </zte-item>
            <zte-item-range
              v-else
              :props="info"
              :format="info.format"
              :form="searchForm" />
          </el-form-item>
        </transition>
        <!-- 隐藏域input解决浏览器默认提交bug -->
        <input type="text" style="display: none" v-if="searchInfo.length === 1">
        <el-form-item v-if="!cancelSearch" class="button-list" :style="'width:' + widthPercent + '%;'">
          <div class="search-btn">
            <el-button type="primary" :size="size" @click.native="submitForm" icon="el-icon-search">{{$t('查询')}}</el-button>
            <el-button :size="size" @click.native="resetForm" icon="el-icon-refresh">{{$t('重置')}}</el-button>
          </div>
          <div class="search-slotBtn" v-if="$slots.moreOperate">
            <slot name="moreOperate"></slot>
          </div>
        </el-form-item>
      </el-form>
      <div class="more" v-if="seachIsMore && !expendAll" @click="searchExpend = !searchExpend">
        <i class="icon el-icon-arrow-up" v-if="searchExpend"></i>
        <i class="icon el-icon-arrow-down" v-else></i>
      </div>
    </div>
    <!-- 通过buttonList控制是否渲染这四个按钮 -->
    <div class="content-body" v-if="Object.keys(buttonList).length || $scopedSlots.content || $slots.content">
      <el-button icon="el-icon-plus" :size="size" v-if="buttonList.add" @click.native="handlerAddRow">{{$t('新增')}}</el-button>
      <el-button :size="size" v-if="buttonList.del" @click.native="handlerDeleteRow">{{$t('删除')}}</el-button>
      <el-button :size="size" v-if="buttonList.enable" @click.native="handlerSwitch('enable')">{{$t('启用')}}</el-button>
      <el-button :size="size" v-if="buttonList.disable" @click.native="handlerSwitch('disable')">{{$t('禁用')}}</el-button>
      <slot name="content" :rows="selectionRows"></slot>
      <!-- slot内容分发 -->
    </div>
    <div class="table-body">
      <el-table
        ref="table"
        :size="size"
        :data="currentData"
        stripe
        highlight-current-row
        :height="height"
        style="width: 100%;"
        :row-key="rowKey"
        @current-change="handlerRowSelect"
        @row-click="hanlerRowClick"
        @row-dblclick="handleDBclick"
        @selection-change="handlerRowCheck">
        <el-table-column
          v-if="indexStyle === 'selection' || indexStyle === 'index'"
          :type="indexStyle"
          :reserve-selection='!!rowKey'
          width="55">
        </el-table-column>

        <template v-for="column of tableColumn">
          <el-table-column
            v-if="column.type === 'date'"
            :key="column.code"
            :prop="column.code"
            :class-name="column.code"
            :label="$t(column.label)">
            <template slot-scope="{ row }">
              {{ row[column.code] | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column
            v-else
            :key="column.code"
            :class-name="column.code"
            :prop="column.code"
            :label="$t(column.label)"
            :width="column.width"
            :fixed="column.fixed"
            :show-overflow-tooltip="column.tips">
            <template slot-scope="scope">
              <slot
                v-if="column.temp"
                class="temp-column"
                :name="column.code"
                :row="scope.row"
                :column="scope.column"
                :$index="scope.$index">
              </slot>
              <template v-else>{{scope.row[column.code]}}</template>
            </template>
          </el-table-column>
        </template>

      </el-table>
      <el-pagination
        v-if="isPagination"
        background
        layout="total, prev, pager, next"
        :current-page="pageNum"
        :page-size="pageSize"
        :total="totalSize"
        @current-change="handlerPageChange">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import zteItem from './zte-item';

export default {
  name: 'zteTableLocal',
  components: {
    zteItem,
  },
  props: {
    searchInfo: {
      type: Array,
      default: () => ([]),
    },
    tableColumn: {
      type: Array,
      default: () => ([]),
    },
    tableData: {
      type: Array,
      default: () => ([]),
    },
    indexStyle: {
      type: String,
    },
    rowKey: {
      type: [String, Function],
    },
    rowSize: {
      type: Number,
      default: 3,
    },
    labelWidth: {
      type: Number,
      default: 100,
    },
    lablePosition: {
      type: String,
      default: 'left',
    },
    expendAll: {
      type: Boolean,
      default: false,
    },
    cancelSearch: {
      type: Boolean,
      default: false,
    },
    buttonList: {
      type: Object,
      default: () => ({}),
    },
    isPagination: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
    },
    size: String,
    rules: Object,
    total: Number,
  },
  data() {
    return {
      searchForm: {},
      searchExpend: false,
      defaultRow: 1,
      selectionRows: [],
      pageNum: 1,
      pageSize: 5,
    };
  },
  filters: {
    dateFormat(val) {
      if (val && typeof val === 'string') {
        return val.substring(0, 10);
      }
      return '';
    },
  },
  computed: {
    searchObj() {
      const searchObj = {};
      Object.keys(this.searchForm).forEach((key) => {
        if (this.searchForm[key]) {
          searchObj[key] = this.searchForm[key];
        }
      });
      return searchObj;
    },
    totalSize() {
      return this.total || this.tableData.length;
    },
    currentData() {
      const data = this.isPagination && !this.total
        ? this.tableData.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize)
        : this.tableData;
      return data;
    },
    widthPercent() {
      return (100 / this.rowSize).toFixed(2);
    },
    expendSize() {
      return this.rowSize * this.defaultRow - 1;
    },
    isCn() {
      return this.$i18n.locale === 'zh-CN';
    },
  },
  watch: {
    totalSize() {
      if (!this.currentData.length && this.pageNum > 1) this.pageNum--;
    },
  },
  created() {
  },
  mounted() {
  },
  methods: {
    handlerPageChange(currentPage) {
      this.pageNum = currentPage;
      this.$emit('page-change', this.pageNum);
    },
    handlerRowSelect(currentRow) {
      this.$emit('row-select', currentRow);
    },
    handleDBclick(row) {
      this.$emit('dblclick', row);
    },
    handlerRowCheck(selection) {
      this.selectionRows = selection;
      this.$emit('row-check', selection);
    },
    handlerAddRow() {
      this.$emit('add-row');
    },
    handlerDeleteRow() {
      if (!this.selectionRows.length) {
        this.$message.warning(this.$t('请选择一条数据'));
        return;
      }
      this.$emit('delete-row', this.selectionRows);
    },
    handlerSwitch(type) {
      if (!this.selectionRows.length) {
        this.$message.warning(this.$t('请选择一条数据'));
        return;
      }
      this.$emit('switch', this.selectionRows, type);
    },
    showChange(showLabel, value) {
      this.searchForm[showLabel] = value;
    },
    pickerChange(row) {
      const keys = Object.keys(row);
      keys.forEach((key) => {
        if (this.searchForm[key] !== undefined) {
          this.searchForm[key] = row[key];
        } else {
          this.$set(this.searchForm, key, row[key]);
        }
      });
    },
    treeChange(showLabel, checked, halfId, halfChecked) {
      this.searchForm[showLabel] = checked;
      this.searchForm[halfId] = halfChecked;
    },
    handlerRangeChange(val, info) {
      if (info.subCode && info.subCode.length === 2) {
        this.searchObj[info.subCode[0]] = val[0];
        this.searchObj[info.subCode[1]] = val[1];
      }
    },
    hanlerRowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    submitForm() {
      let valiFlag = true;
      if (this.rules) {
        this.$refs.searchForm.validate((valid) => {
          valiFlag = valid;
        });
      }
      if (!valiFlag) {
        return;
      }

      this.pageNum = 1;
      this.$emit('search', this.searchObj);
    },
    resetForm() {
      this.initForm();
    },
    initForm() {
      const form = {};
      this.searchInfo.forEach((info) => {
        if (info.value || info.value === '') {
          form[info.code] = info.value;
        }
      });
      this.searchForm = form;
    },
    seachIsMore() {
      return this.searchInfo.filter(item => item.show !== false).length > this.expendSize;
    },
    toggleSelection(rows, bool = true) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.table.toggleRowSelection(row, bool);
        });
        return;
      }
      this.$refs.table.clearSelection();
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";

.zte-table-local {
  [class$=-body] {
    margin-top: 15px;
    background-color: #fff;
  }
  .search-body {
    flex: 0 0 auto;
    padding: 10px 20px 5px 20px;
    margin: 0;
    box-shadow: 0 7px 9px rgba($theme, .04);

    .el-form {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;

      .el-form-item {
        margin-right: 0;
        min-width: 250px;
        margin-bottom:6px;
        .el-form-item__label {
          line-height: 36px;
        }
        .el-form-item__content {
          line-height: 35px;
          padding-right: 50px;
          .el-input__inner {
            // height: 35px;
          }
        }
      }
      .button-list {
        flex: 1 0 auto;
        text-align: right;
        margin-bottom:0px;
        .search-btn {
          float: right;
        }
        .search-slotBtn {
          float: right;
           margin-right: 12px;
        }
        .el-form-item__content {
            margin-left: 0 !important;
        }
      }
    }

    .more {
      text-align: center;
      padding:0 5px;
      cursor: pointer;

      &:hover .icon {
        color: $theme;
      }
    }
  }

  .content-body {
    background-color: transparent;
    .el-button {
      // border: 0;
      box-shadow: 0 7px 9px rgba($theme, .04);
    }
  }
  .table-body {
    box-shadow: 0 4px 9px rgba($theme, .08);
    th {
      // text-align: center;
    }
    td {
      .el-button {
        padding-top: 0;
        padding-bottom: 0;
      }
    }
    .el-table-column--selection {
      text-align: center;
      .is-indeterminate .el-checkbox__inner::before {
        transform: scale(0.5, 1);
      }
      .el-checkbox__inner::after {
        border-width: 2px;
        top: 0;
      }
    }
    .el-pagination {
      text-align: right;
      padding: 10px;
      font-weight: normal;
    }
  }
}
</style>
