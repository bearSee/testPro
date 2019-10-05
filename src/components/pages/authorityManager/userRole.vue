<template>
  <div class="user-role">
    <zte-table
      index-style="index"
      request-url="/role/listUserRole"
      :searchInfo="searchInfo"
      :tableColumn="tableColumn"
      :isSortable='false'>
    </zte-table>
  </div>
</template>

<script>

export default {
  name: 'userRole',
  components: {
  },
  data() {
    return {
      searchInfo: [
        {
          code: 'employeeNumber',
          label: '工号',
          type: 'text',
        },
        {
          code: 'employeeName',
          label: '姓名',
          type: 'text',
        },
      ],
      tableColumn: [
        {
          code: 'employeeNumber',
          label: '工号',
        },
        {
          code: 'employeeName',
          label: '姓名',
        },
        {
          code: 'roleName',
          label: '角色名称',
        },
      ],
    };
  },
};
</script>

<style>
.user-role {
}
</style>
