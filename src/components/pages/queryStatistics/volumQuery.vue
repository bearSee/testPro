<template>
  <div class="volumQuery">
    <el-container>
      <el-aside width="260px">
        <div class="aside-box">
          <div class="tree-head">公司列表</div>
          <el-tree
            lazy
            highlight-current
            :load="handlerLazyLoad"
            :data="tree"
            :props="treeProps"
            @node-click="selectCompany">
          </el-tree>
          <div class="enabled">
            <el-checkbox v-model="enabled">{{ $t('包含已禁用的组织') }}</el-checkbox>
          </div>
        </div>
      </el-aside>
      <el-main>
        <zte-table
          :request-url="deepArray[paramsList.length].requestUrl"
          :table-column="deepArray[paramsList.length].tableColumn"
          :params="params">
          <template slot="companyName" slot-scope="{ row }">
            <el-button type="text" size="small" @click.native="getVoucherByCompany(row.companyCode)">
              {{ row.companyName }}
            </el-button>
          </template>
          <template slot="periodYear" slot-scope="{ row }">
            <el-button type="text" size="small" @click.native="getVoucherByYear(row.periodYear)">
              {{ row.periodYear }}
            </el-button>
          </template>
          <template slot="periodMonth" slot-scope="{ row }">
            <el-button type="text" size="small" @click.native="getVoucherByMonth(row.periodMonth)">
              {{ row.periodMonth }}
            </el-button>
          </template>
          <template slot="comment">
            <el-button icon="el-icon-arrow-left" type="primary" size="small" @click.native="goback">
              {{ $t('返回') }}
            </el-button>
          </template>
        </zte-table>
      </el-main>
    </el-container>
  </div>
</template>

<script type='text/javascript'>

export default {
  name: 'volumQuery',
  data() {
    return {
      enabled: false,
      tree: [],
      treeProps: {
        label: 'label',
      },
      deepArray: [
        {
          requestUrl: '/bookQuery/statisticsVoucher',
          tableColumn: [
            {
              code: 'companyName',
              label: '公司',
              temp: 'companyName',
              width: 200,
            },
            {
              code: 'lastYearBookCount',
              label: '上年凭证册数',
            },
            {
              code: 'thisYearBookCount',
              label: '本年凭证册数',
            },
            {
              code: 'lastYearVoucherCount',
              label: '上年凭证号数',
            },
            {
              code: 'thisYearVoucherCount',
              label: '本年凭证号数',
            },
          ],
        },
        {
          requestUrl: '/bookQuery/statisticsVoucherByCompany',
          tableColumn: [
            {
              code: 'periodYear',
              label: '年份',
              temp: 'periodYear',
            },
            {
              code: 'voucherCount',
              label: '凭证总数',
            },
            {
              code: 'bookCount',
              label: '凭证总册数',
            },
            {
              code: 'noBookVoucherCount',
              label: '未分册凭证数',
            },
          ],
        },
        {
          requestUrl: '/bookQuery/statisticsVoucherByYear',
          tableColumn: [
            {
              code: 'periodMonth',
              label: '月份',
              temp: 'periodMonth',
            },
            {
              code: 'voucherCount',
              label: '凭证总数',
            },
            {
              code: 'bookCount',
              label: '凭证总册数',
            },
            {
              code: 'noBookVoucherCount',
              label: '未分册凭证数',
            },
          ],
        },
        {
          requestUrl: '/bookQuery/statisticsVoucherByMonth',
          tableColumn: [
            {
              code: 'voucherTypeName',
              label: '凭证类型',
            },
            {
              code: 'voucherCount',
              label: '凭证总数',
            },
            {
              code: 'bookCount',
              label: '凭证总册数',
            },
            {
              code: 'noBookVoucherCount',
              label: '未分册凭证数',
            },
          ],
        },
      ],
      paramsList: [],
      currentNode: '',
    };
  },
  computed: {
    params() {
      let params = {};
      this.paramsList.forEach((item) => {
        params = Object.assign(params, item);
      });
      return params;
    },
  },
  watch: {
    enabled() {
      this.getCompanyTree();
    },
  },
  methods: {
    getCompanyTree() {
      const params = this.enabled ? '' : {
        enabled: 'Y',
      };
      this.$http.post('/bookQuery/listCompany', params).then(
        (res) => {
          res = res.data;
          const list = res.list.map(item => ({
            label: item.companyName,
            ...item,
          }));
          this.tree = list;
        },
        () => {},
      );
    },
    // 选择公司
    selectCompany(data, node) {
      if (this.currentNode === node.id) {
        return;
      }
      this.currentNode = node.id;
      const paramsList = [];

      const findParams = (n) => {
        if (n.parent) {
          findParams(n.parent);
          paramsList.push(JSON.parse(JSON.stringify(n.data)));
        }
      };

      findParams(node);
      this.paramsList = paramsList;
    },
    getVoucherByCompany(companyCode) {
      this.paramsList.push({ companyCode });
    },
    getVoucherByYear(periodYear) {
      this.paramsList.push({ periodYear });
    },
    getVoucherByMonth(periodMonth) {
      this.paramsList.push({ periodMonth });
    },
    goback() {
      this.paramsList.pop();
    },
    // 懒加载树
    handlerLazyLoad(node, resolve) {
      const levelList = [
        {
          requestUrl: '/bookQuery/listCompany',
          params: this.enabled ? '' : { enabled: 'Y' },
          props: {
            label: 'companyName',
          },
        },
        {
          requestUrl: '/bookQuery/listYear',
          params: {
            companyCode: node.data.companyCode,
          },
          props: {
            label: 'periodYear',
          },
        },
        {
          requestUrl: '/bookQuery/listMonth',
          params: {
            periodYear: node.data.periodYear,
          },
          props: {
            label: 'periodMonth',
          },
        },
      ];
      const level = levelList[node.level];

      if (!level) {
        resolve([]);
        return;
      }

      this.$http.post(level.requestUrl, Object.assign({}, this.params, level.params)).then(
        (res) => {
          res = res.data;
          const list = res.list.map(item => ({
            label: item[level.props.label],
            ...item,
          }));
          resolve(list);
        },
        () => {},
      );
    },
  },
};
</script>

<style lang='scss'>
@import "../../../assets/scss/theme";
.volumQuery {
  background: #fff;
  .el-aside {
    border-right: 1px solid #eee;
    .aside-box {
      width: 100%;
      padding: 10px;
      padding-top: 0;
      background-color: #fff;
      text-align: center;
      position: relative;
      .tree-head {
        line-height: 36px;
        background: $tableHead;
        text-align: center;
        font-size: 14px;
        color: #888;
      }
      .el-tree{
        padding-bottom: 40px;
        padding-top: 10px;
      }
      .enabled {
        width: 223px;
        position: fixed;
        bottom: 39px;
      }
    }
  }
  .el-main{
    padding: 0;
    overflow: hidden;
    .zte-table {
      .table-body {
        margin-top: 0;
      }
    }
    .comment {
      padding: 0!important;
      margin-top: 2px;
    }
  }
}
</style>
