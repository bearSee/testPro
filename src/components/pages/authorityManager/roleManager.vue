<template>
  <div class="role-manager">
    <zte-table
      ref="table"
      request-url="/role/list"
      index-style="index"
      :search-info="searchConfig"
      :table-column="tableColumn"
      :is-sortable="false">
      <div slot="content">
        <el-button size="small" @click.native="addRow">{{ $t('新增行') }}</el-button>
      </div>
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="small" @click.native.stop="handlerEdit(row)">{{$t('修改')}}</el-button>
        <el-button type="text" size="small" @click.native.stop="handlerResource(row)">{{$t('角色资源')}}</el-button>
        <el-button type="text" size="small" @click.native.stop="handlerPeople(row)">{{$t('角色成员')}}</el-button>
      </template>
      <template slot="enabled" slot-scope="{ row }">
        <span>{{ $t(status[row.enabled])}}</span>
      </template>
    </zte-table>

    <!-- 角色新增 dialog -->
    <el-dialog class="dialog" :title="$t(dialog.title)" width="40%" :visible.sync="dialog.visible" @close='dialogClose'>
      <zte-form border :leftLabel="true" :item-info="itemInfo" :form="roleForm" :row-size="1" @submit="handlerAddRole"></zte-form>
    </el-dialog>

    <!-- 角色资源 -->
    <el-dialog :title="$t('角色资源')" v-if="treeVisible" :visible.sync="treeVisible">
      <zte-tree
        ref="tree"
        height="500"
        :data="roleResource"
        label-prop="funcName"
        :selected="selectRole"
        :showCheckbox="true">
      </zte-tree>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click.native="handleSubmitRole">{{ $t('确认') }}</el-button>
        <el-button @click.native="closeDialog">{{ $t('关闭') }}</el-button>
      </span>
    </el-dialog>
    <!-- 角色成员 -->
    <el-dialog :title="$t('角色成员')" v-if="memberVisible" :visible.sync="memberVisible">
      <zte-table
        ref="memberTable"
        :labelWidth="50"
        :search-info="memberItemInfo"
        :table-column="memberTableColumn"
        :is-sortable="false"
        request-url="/role/listUsersByRole"
        :params="{ roleId: currentRole.id }">
        <div slot="content">
          <el-button size="small" icon="el-icon-plus" @click.native="handlerAddMember">{{ $t('新增') }}</el-button>
        </div>
        <template slot="operate" slot-scope="{ row }">
          <el-button type="text" @click.native.stop="handlerDelMember(row)">{{$t('删除')}}</el-button>
        </template>
      </zte-table>
    </el-dialog>
    <!-- 添加用户 -->
    <table-picker
      v-if="pickerVisible"
      :dialogVisible.sync="pickerVisible"
      table-key="RoleEmployeeLov.find"
      :title="$t('添加用户')"
      row-key="ID"
      @selectChange='selectChange'
      :params="{ params: currentRole.id }">
    </table-picker>
  </div>
</template>

<script type="text/javascript">
import arrayToTree from '../../../es/arrayToTree';
import zteTree from '../../modules/zte-tree';
import tablePicker from '../../modules/table-picker';

export default {
  name: 'roleManager',
  components: {
    zteTree,
    tablePicker,
  },
  data() {
    return {
      dialog: {
        visible: false,
        title: '新增角色',
      },
      searchConfig: [
        {
          code: 'roleName',
          label: '角色名称',
          type: 'text',
        },
        {
          code: 'enabled',
          label: '状态',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 180,
        },
        {
          code: 'roleCode',
          label: '角色编码',
          width: 120,
        },
        {
          code: 'roleName',
          label: '角色名称',
          width: 150,
        },
        {
          code: 'enabled',
          label: '状态',
          temp: 'enabled',
        },
        {
          code: 'remark',
          label: '备注',
          width: 220,
        },
      ],
      itemInfo: [
        {
          code: 'roleCode',
          label: '角色编码',
          type: 'text',
          required: true,
          disabled: false,
        },
        {
          code: 'roleName',
          label: '角色名称',
          required: true,
          type: 'text',
        },
        {
          code: 'remark',
          label: '备注',
          type: 'text',
        },
        {
          code: 'enabled',
          label: '有效性',
          type: 'select',
          required: true,
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
      ],
      roleForm: { enabled: 'Y' },
      roleResource: [],
      status: {
        Y: '启用',
        N: '禁用',
      },
      currentRole: {},
      treeVisible: false,
      selectRole: [],
      memberItemInfo: [
        {
          label: '工号',
          code: 'employeeNumber',
          type: 'text',
        },
        {
          label: '姓名',
          code: 'employeeName',
          type: 'text',
        },
      ],
      memberVisible: false,
      memberForm: {},
      memberTableColumn: [
        {
          label: '工号',
          code: 'employeeNumber',
        },
        {
          label: '姓名',
          code: 'employeeName',
        },
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
        },
      ],
      pickerVisible: false,
    };
  },
  mounted() {
  },
  methods: {
    addRow() {
      this.dialog.visible = true;
      this.dialog.title = '新增角色';
      this.itemInfo[0].disabled = false;
    },
    getRoleResource() {
      this.$http.post('/role/listRoleFunc', { roleId: this.currentRole.id }).then(
        (res) => {
          const selectRole = res.data.roleFuncList;
          this.roleResource = arrayToTree(res.data.list, 'parentId', 'id', 'children', 'F000000');
          if (Array.isArray(selectRole)) {
            this.selectRole = selectRole.map(item => item.id).join(',');
          }
          this.treeVisible = true;
        });
    },
    handlerAddRole(fom) {
      const path = fom.id ? '/role/update' : '/role/save';
      if (fom.id) {
        fom.roleId = fom.id;
      }
      this.$http.post(path, fom).then(
        () => {
          this.dialog.visible = false;
          this.$refs.table.getTableData();
        });
    },
    dialogClose() {
      this.roleForm = { enabled: 'Y' };
    },
    handlerEdit(row) {
      this.roleForm = row;
      this.dialog.visible = true;
      this.dialog.title = '修改角色';
      this.itemInfo[0].disabled = true;
    },
    handlerResource(row) {
      this.currentRole = row;
      this.getRoleResource();
    },
    handlerPeople(row) {
      this.currentRole = row;
      this.memberVisible = true;
    },
    closeDialog() {
      this.treeVisible = false;
    },
    // 删除成员
    handlerDelMember(row) {
      const params = {
        roleId: this.currentRole.id,
        userId: row.id,
      };
      this.$confirm(this.$t('是否删除数据?'), this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        this.$http.post('/role/deleteUserByRole', params).then(
          () => {
            this.getMemberTableData();
            this.$message.success(this.$t('删除成功'));
          });
      }).catch();
    },
    handleSubmitRole() {
      const checked = this.$refs.tree.getCheckedNodes(false);
      const halfchecked = this.$refs.tree.getHalfCheckedNodes(false);
      const select = [];
      halfchecked.forEach((item) => {
        if (item.children) {
          delete item.children;
        }
        select.push(item);
      });
      checked.forEach((item) => {
        if (item.children) {
          delete item.children;
        }
        select.push(item);
      });
      const params = {};
      params.funcIds = select.map(item => item.id).join(',');
      params.roleId = this.currentRole.id;
      this.$http.post('/role/saveRoleFunc', params).then(
        () => {
          this.treeVisible = false;
          this.$message.success(this.$t('保存成功'));
        });
    },
    // 新增成员
    handlerAddMember() {
      this.pickerVisible = true;
    },
    // 确认选中
    selectChange(select) {
      const params = {
        roleId: this.currentRole.id,
        userIds: select.map(item => item.ID).join(','),
      };
      this.$http.post('/role/saveUsersByRole', params)
        .then(() => {
          this.addMemberVisible = false;
          this.getMemberTableData();
          this.$message.success(this.$t('保存成功'));
        });
    },
    getMemberTableData() {
      this.$refs.memberTable.getTableData();
    },
  },
};
</script>

<style lang="scss">
.role-manager {
  .zte-tree {
    .el-scrollbar {
      height: calc(100vh - 300px);
      max-height: 500px;
    }
  }
  .dialog {
    .el-dialog__body {
      padding-bottom: 10px;
    }
  }
}
</style>
