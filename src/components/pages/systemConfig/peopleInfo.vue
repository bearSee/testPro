<template>
    <div class="people-info">
      <zte-table
          ref="peopleInfo"
          index-style="index"
          request-url="/employeeReport/list"
          :row-size="3"
          :search-info="searchConfig"
          :table-column="tableColumn"
          >
      </zte-table>
    </div>
</template>

<script type="text/javascript">

export default {
  name: 'person-info',
  data() {
    return {
      searchConfig: [
        {
          code: 'employeeNumber',
          label: '员工工号',
          type: 'text',
        },
        {
          code: 'employeeName',
          label: '员工姓名',
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
          code: 'companyName',
          label: '公司名称',
        },
        {
          code: 'deptName',
          label: '部门名称',
        },
        {
          code: 'leaderPositionName',
          label: '部门主管',
        },
        {
          code: 'enabledValue',
          label: '有效性',
        },
      ],
    };
  },
  methods: {},
};
</script>
