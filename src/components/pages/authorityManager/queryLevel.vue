<template>
  <div class="query-level">
    <el-container>
      <el-aside width="260px">
        <div class="aside-box">
          <el-select v-model="posStructureCode" :placeholder="$t('请选择')">
            <el-option
                v-for="item in structureCodeList"
                :key="item.key"
                :label="item.value"
                :value="item.key">
            </el-option>
          </el-select>
          <el-tree
            :data="tree"
            :props="treeProps"
            @node-click="selectCompany">
          </el-tree>
          <el-checkbox v-model="enabled">{{ $t('包含已禁用的组织') }}</el-checkbox>
        </div>
      </el-aside>
      <el-main>
        <zte-form
          class="company-form"
          size="mini"
          :row-size="3"
          :item-info="itemInfo"
          :form="form"
          :is-cancel="false"
          :submit-text="$t('保存')"
          @submit="handlerSaveCompany">
          <template slot="moreOperate">
            <el-button icon="el-icon-plus" @click.native="clearCompanyInfo">{{$t('新增')}}</el-button>
          </template>
        </zte-form>
        <zte-table-local
          :table-column="tableColumn"
          :table-data="tableData"
          :isPagination="true">
          <template slot="content">
            <el-button size="small" icon="el-icon-plus" @click.native="addNewPeople">{{$t('新增人员')}}</el-button>
          </template>
          <template slot="operate" slot-scope="{ row, $index }">
            <el-button type="text" @click.native="handlerDeletePeople(row, $index)">{{ $t('删除') }}</el-button>
          </template>
        </zte-table-local>

        <!-- 新增结算单位 -->
        <el-dialog
          width="30%"
          :title="$t('新增')"
          :visible.sync="companyVisible">
          <zte-form
            :item-info="itemInfo"
            :cancel-text="$t('关闭')"
            @submit="handlerAddCompany"
            @reset="companyVisible = false">
          </zte-form>
        </el-dialog>

        <!-- 人员lov -->
        <table-picker
          v-if="pickerVisible"
          :dialogVisible.sync="pickerVisible"
          :table-key="picker.key"
          :title="$t(picker.label)"
          :row-key="picker.code"
          :row-trans="picker.trans"
          @selectChange ='pickerSelect'>
        </table-picker>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import zteTableLocal from '../../modules/zte-table-local';
import zteForm from '../../modules/zte-form';
import zteTree from '../../modules/zte-tree';
import tablePicker from '../../modules/table-picker';
import zteItem from '../../modules/zte-item';

export default {
  name: 'query-level',
  components: {
    zteTableLocal,
    zteForm,
    zteTree,
    tablePicker,
    zteItem,
  },
  data() {
    return {
      // 层次数据
      posStructureCode: '',
      structureCodeList: [],
      enabled: false,
      tree: [],
      treeProps: {
        label: 'companyName',
      },
      // 公司数据
      itemInfo: [
        {
          label: '结算单位',
          code: 'companyCode',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyCode',
              from: 'COMPANY_CODE',
            },
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
          ],
          required: true,
        },
        {
          label: '状态',
          code: 'enabled',
          type: 'select',
          options: [],
          fastCode: 'ENABLED',
          required: true,
        },
      ],
      form: { enabled: 'Y' },
      companyVisible: false,
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
        },
        {
          code: 'employeeNumber',
          label: '工号',
        },
        {
          code: 'employeeName',
          label: '姓名',
        },
        {
          code: 'deptName',
          label: '部门',
        },
      ],
      tableData: [],
      // 人员数据
      pickerVisible: false,
      picker: {
        code: 'employeeId',
        label: '新增人员',
        key: 'EmployeeMultiLov.find',
        trans: [
          {
            to: 'employeeId',
            from: 'ID',
          },
          {
            to: 'employeeName',
            from: 'EMPLOYEE_NAME',
          },
          {
            to: 'employeeNumber',
            from: 'EMPLOYEE_NUMBER',
          },
          {
            to: 'deptName',
            from: 'DEPT_NAME',
          },
        ],
      },
    };
  },
  created() {
    this.getCodeList();
  },
  computed: {
    treeParams() {
      const params = Object.assign({}, { posStructureCode: this.posStructureCode }, this.enabled ? {} : { enabled: 'Y' });
      return params;
    },
  },
  watch: {
    treeParams() {
      this.getStructureList();
    },
  },
  methods: {
    // 获取层次快速编码
    getCodeList() {
      this.$http.post('common/combo/list', { type: 'POSITION_HIERACHY' }).then(
        (res) => {
          res = res.data;
          this.structureCodeList = res.list;
        },
        () => {},
      );
    },
    // 层次查询
    getStructureList() {
      const params = this.treeParams;
      this.$http.post('/positionStructure/findPositionStructureList', params).then(
        (res) => {
          res = res.data;
          this.tree = res.list;
        },
        () => {},
      );
    },
    // 选择公司
    selectCompany(data) {
      this.form = data;
      this.queryEployeeInCompany();
    },
    // 查询公司员工
    queryEployeeInCompany() {
      const params = {
        posStruElementId: this.form.posStruElementId,
      };
      this.$http.post('/positionStructure/findPSEHolderList', params).then(
        (res) => {
          res = res.data;
          this.tableData = res.list || [];
        },
        () => {},
      );
    },
    // 清除公司信息, 用于重新新增公司
    clearCompanyInfo() {
      if (!this.posStructureCode) {
        this.$message.warning(this.$t('请选择一个层次'));
        return;
      }
      // 检测的参数变化, zte-form才会刷新表格
      this.form = { enabled: 'Y' };
      this.tableData = [];
    },
    // 新增人员
    addNewPeople() {
      if (!this.form || !this.form.posStruElementId) {
        this.$message.warning(this.$t('请选择一个结算位'));
        return;
      }
      this.pickerVisible = true;
    },
    // 新增公司
    handlerAddCompany(form) {
      const params = {
        posStructureCode: this.posStructureCode,
        determiner: form.companyCode,
        enabled: form.enabled,
      };
      this.$http.post('/positionStructure/savePositionStructure', params).then(
        (res) => {
          res = res.data;
          if (res.ok) {
            this.$message.success(this.$t('保存成功'));
            this.companyVisible = false;
            this.getStructureList();
          } else {
            this.$message.success(res.message);
          }
        },
        () => {},
      );
    },
    // 保存公司
    handlerSaveCompany(form) {
      if (!this.posStructureCode) {
        this.$message.warning(this.$t('请选择一个层次'));
        return;
      }
      const params = {
        posStructureCode: this.posStructureCode,
        determiner: form.companyCode,
        enabled: form.enabled,
        posStruElementId: form.posStruElementId,
      };
      this.$http.post('/positionStructure/savePositionStructure', params).then(
        () => {
          this.$message.success(this.$t('保存成功'));
          if (!this.form || !this.form.posStruElementId) {
            // 检测的参数变化, zte-form才会刷新表格
            this.form = { enabled: 'Y' };
          }
          this.getStructureList();
        },
        () => {},
      );
    },
    // 选择人员
    pickerSelect(row) {
      if (!row.length) {
        this.$message.warning(this.$t('请选择人员'));
        return;
      }
      const tableEmpolyeeArr = this.tableData.map(item => ({
        employeeId: item.employeeId,
        pseHolderId: item.pseHolderId,
      }));
      const addEmpolyeeArr = row.map(item => ({
        employeeId: item.employeeId,
      }));
      const params = {
        posStruElementId: this.form.posStruElementId,
        pseHolderList: JSON.stringify(tableEmpolyeeArr.concat(addEmpolyeeArr)),
      };
      this.savePeople(params);
    },
    // 删除人员
    handlerDeletePeople(row, index) {
      this.$confirm(this.$t('是否删除数据?'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        const params = {
          pseHolderId: row.pseHolderId,
        };
        this.$http.post('/positionStructure/removePSEHolders', params).then(
          () => {
            this.$message.success(this.$t('删除成功'));
            this.tableData.splice(index, 1);
          },
          () => {},
        );
      }).catch(() => {});
    },
    // 保存人员
    savePeople(params) {
      this.$http.post('/positionStructure/savePSEHolder', params).then(
        () => {
          this.queryEployeeInCompany();
          this.$message.success(this.$t('新增成功'));
        },
        () => {},
      );
    },
  },
};
</script>

<style lang="scss">
@import "../../../assets/scss/theme";
.query-level {
  .el-aside{
    border-right: 1px solid #eee;
    .aside-box{
      width: 100%;
      padding: 10px;
      padding-top: 5px;
      background-color: #fff;
      text-align: center;
      .el-select {
        width: 100%;
        margin: 10px 0;
      }
      .el-tree {
        height: calc(100% - 80px);
        overflow-y: auto;
        .el-tree__empty-block {
          font-size: 14px;
          .el-tree__empty-text {
            top: 30px;
          }
        }
      }
    }
  }
  .el-main{
    padding: 0;
    display: flex;
    flex-direction: column;
    .company-form {
      padding-top: 18px;
      .button-list {
        .el-form-item__content {
          padding-right: 20px;
        }
      }
    }
    .zte-table-local  {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      .table-body {
        display: flex;
        flex-direction: column;
        .el-table {
          flex: 1 0 auto;
          .el-table__header {
            th {
              padding: 6px 0;
            }
          }
          .el-table__body-wrapper {
            td {
              padding: 6px 0;
            }
          }
        }
      }
      .content-body {
        margin-top: 3px;
        .el-button {
          margin: 7px 0;
          margin-bottom: 10px;
          width: 100px;
          font-size: 12px;
        }
        .title {
          line-height: 46px;
          margin-left: 12px;
        }
      }
      .table-body {
        margin-top: 0px;
        height: 100%;
        .el-table__empty-text {
          font-size: 13px;
        }
        .el-button {
          font-size: 13px;
        }
        .el-table {
          div.cell {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
