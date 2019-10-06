<template>
  <div class="index">
    <div class="index-head">
      <el-form inline size="small" :model="form" status-icon ref="form" label-width="100px" class="search-form">
        <template>
          <el-form-item v-for="(item, i) in searchInfo" :key="i" :label="item.label" :prop="item.code" class="form-item">
            <el-input v-if="item.type === 'text'" :type="item.type" v-model="form[item.code]" clearable></el-input>
            <el-select v-if="item.type === 'select'" v-model="form[item.code]" placeholder="请选择" clearable>
              <el-option
                v-for="d in item.options"
                :key="d.value"
                :label="d.label"
                :value="d.value">
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item class="btn-group">
          <el-button type="primary" size="mini" @click="getList">查询</el-button>
          <el-button size="mini" @click="resetForm">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="index-body">
      <el-table :data="tableData" class="table">
        <el-table-column
          label="操作"
          width="150">
          <template slot-scope="{ row }">
            <el-button type="text" @click="viewDetail(row)">查看</el-button>
          </template>
        </el-table-column>
        <template>
          <el-table-column
            v-for="(item, i) in tableColumn"
            :key="i"
            :prop="item.code"
            :label="item.label"
            :width="item.width || '150'">
          </el-table-column>
        </template>
      </el-table>
      <el-pagination
        class="foot-pagination"
        background
        layout="prev, pager, next"
        :total="total"
        @current-change="pageChange">
      </el-pagination>
    </div>
    <el-dialog
      title="列表详情"
      v-if="dialogVisible"
      :visible.sync="dialogVisible">
      <template>
        <div v-for="(item, i) in tableColumn" :key="i">
          <span>{{ item.label }}</span>:
          <span>{{ rowData[item.code] }}</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import qs from 'qs';

export default {
  name: 'index',
  data() {
    return {
      dialogVisible: false,
      searchInfo: [
        {
          label: '起始分册编号',
          code: 'beginBookCode',
          type: 'text',
        },
        {
          label: '截止分册编号',
          code: 'endBookCode',
          type: 'text',
        },
        {
          label: '会计期间',
          code: 'periodName',
          type: 'select',
          options: [
            {
              label: '201904',
              value: '201904',
            },
            {
              label: '201905',
              value: '201905',
            },
            {
              label: '201906',
              value: '201906',
            },
            {
              label: '201907',
              value: '201907',
            },
            {
              label: '201908',
              value: '201908',
            },
            {
              label: '201909',
              value: '201909',
            },
          ],
        },
      ],
      form: {},
      tableColumn: [
        {
          label: '分册编号',
          code: 'bookCode',
        },
        {
          label: '结算单位',
          code: 'companyName',
        },
        {
          label: '会计期间',
          code: 'periodName',
        },
        {
          label: '分册人',
          code: 'bookEmployeeName',
        },
      ],
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      rowData: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      // const { pageNum: a, pageSize: b } = this;
      const { pageNum, pageSize, form } = this;
      this.$http.post('archiveBook/list', qs.parse({ pageNum, pageSize, ...form })).then(
        ({ data }) => {
          this.tableData = data.list || [];
          this.total = data.total;
        },
        () => {},
      );
    },
    pageChange(pageNum) {
      this.pageNum = pageNum;
      this.getList();
    },
    resetForm() {

    },
    viewDetail(row) {
      this.dialogVisible = true;
      this.rowData = row;
    },
  },
};
</script>

<style lang="scss">
.index {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  .index-head {
    .form-item {
    }
    .btn-group {
      margin-left: 30px;
    }
  }
  .index-body {
    flex: 1 1 auto;
    overflow-y: auto;
    position: relative;
    .table {
      padding-bottom: 50px;
      .el-table__body-wrapper,.el-table__header-wrapper {
        table {
          width: 100%!important;
        }
      }
    }
    .foot-pagination {
      height: 50px;
      width: 100%;
      text-align: right;
      background: #fff;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 2;
    }
  }
}
</style>
