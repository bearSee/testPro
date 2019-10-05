<template>
  <div class="list-table">
      <el-table
        ref="picktable"
        :data="selected"
        stripe
        highlight-current-row
        :height="height"
        style="width: 100%"
        :row-key="rowKey"
        @row-dbclick="handleDelete"
      >
        <el-table-column
          v-for="column of tableColumn"
          v-if="column.show !== false"
          :key="column.code"
          :class-name="column.code"
          :prop="column.code"
          :label="$t(column.label)"
          :width="column.width"
          :fixed="column.fixed"
          :show-overflow-tooltip="column.tips"
          :sortable="column.temp ? false : 'custom'">
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
        <el-table-column
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="handleDelete(scope.row)" type="text" >{{ $t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    <el-row>
      <el-button size="small" type="primary" @click="cleanPicker">{{ $t('清空') }}</el-button>
      <span>{{$t('共')}} {{$t('选择')}} {{this.selected.length || 0}} {{$t('行')}}</span>
    </el-row>
  </div>
</template>

<script>
import zteItem from './zte-item';

export default {
  name: 'listTable',
  components: { zteItem },
  props: {
    tableColumn: {
      type: Array,
      default: () => ([]),
    },
    selected: {
      type: Array,
      default: () => ([]),
    },
    rowKey: {
      type: [String, Function],
    },
    height: {
      type: String,
    },
  },
  data() {
    return {
      searchForm: {},
      searchExpend: false,
      pageNum: 1,
      orderField: '',
      order: '',
      defaultRow: 1,
    };
  },
  computed: {
    isCn() {
      return this.$i18n.locale === 'zh-CN';
    },
  },
  mounted() {},
  methods: {
    handlerRowCheck(selection) {
      this.$emit('row-check', selection);
    },
    // 根据checkRow的index取消掉当前表格内的内容
    handleDelete(row) {
      const pageIndex = this.indexOfRowKey(this.selected, row);
      if (pageIndex >= 0) {
        this.$emit('selectChange', pageIndex);
      }
    },
    cleanPicker() {
      this.$emit('selectChange');
    },
    // 根据rowkey查询index
    indexOfRowKey(array, row) {
      if (array.indexOf(row) >= 0) {
        return array.indexOf(row);
      }
      for (const temprow of array) {
        if ((typeof this.rowKey === 'string' &&
              temprow[this.rowKey] === row[this.rowKey])
            || (this.rowKey instanceof Function &&
              this.rowKey(temprow) === this.rowKey(row))
        ) {
          return array.indexOf(temprow);
        }
      }
      return -1;
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";

.list-table {
  .el-scrollbar{
    height: 300px;
    .el-scrollbar__wrap{
      overflow-x: hidden;
      td {
        .el-button {
          padding-top: 0;
          padding-bottom: 0;
        }
      }
    }
  }
  .el-row {
    padding: 9px;
    .el-button {
      float: right;
    }
    & > span {
      line-height: 30px;
    }
  }
}
</style>
