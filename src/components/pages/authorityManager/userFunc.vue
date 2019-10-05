<template>
  <div class="user-func">
    <zte-table
      index-style="index"
      request-url="/role/listUserFunc"
      :searchInfo="searchInfo"
      :tableColumn="tableColumn"
      :isSortable='false'>
    </zte-table>
  </div>
</template>

<script>

export default {
  name: 'userFunc',
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
          code: 'funcName',
          label: '菜单名称',
        },
      ],
    };
  },
};
</script>

<style>
.user-funcn {
}
</style>
