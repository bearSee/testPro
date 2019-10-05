<template>
  <div class="timer-manager">
    <zte-table
      ref="timerManager"
      index-style="index"
      request-url="/task/list"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn"
      >
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native="handlerEdit(row)">{{$t('修改')}}</el-button>
        <el-button type="text" size="mini" @click.native="handlerChangeStatus(row, 'N')" v-if="row.enabled === 'Y'">{{$t('暂挂')}}</el-button>
        <el-button type="text" size="mini" @click.native="handlerChangeStatus(row, 'Y')" v-if="row.enabled === 'N'">{{$t('运行')}}</el-button>
        <el-button type="text" size="mini" @click.native="handlerRightNow(row)" :disabled="row.status === 'Y' || runTaskCode === row.taskCode">{{$t('立即执行')}}</el-button>
      </template>
    </zte-table>

    <!-- dialog -->
    <el-dialog :title="$t('定时器')" width="70%" :visible.sync="dialogVisible">
      <zte-form
        border
        :item-info="itemInfo"
        :form="form"
        :row-size="2"
        :cancel-text="$t('关闭')"
        @submit="handlerSubmit"
        @reset="dialogVisible = false">
        <template slot="intervalTime" slot-scope="{ form }">
          <el-input size="mini" v-model="form.day"></el-input>&nbsp;{{$t('天')}}&nbsp;
          <el-input size="mini" v-model="form.hour"></el-input>&nbsp;{{$t('时')}}&nbsp;
          <el-input size="mini" v-model="form.minute"></el-input>&nbsp;{{$t('分')}}&nbsp;
        </template>
      </zte-form>
    </el-dialog>
  </div>

</template>

<script type="text/javascript">

export default {
  name: 'timer-manager',
  data() {
    return {
      dialogVisible: false,
      itemInfo: [
        {
          code: 'taskName',
          label: '任务名称',
          type: 'text',
          requried: true,
        },
        {
          code: 'runType',
          label: '运行',
          type: 'select',
          options: [],
          fastCode: 'TASK_RUN_TYPE',
        },
        {
          code: 'enabled',
          label: '状态',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
        {
          code: 'planStartTime',
          label: '计划开始',
          type: 'datetime',
        },
        {
          code: 'planEndTime',
          label: '计划结束',
          type: 'datetime',
        },
        {
          code: 'intervalTime',
          label: '计划间隔',
          type: 'temp',
        },
      ],
      form: {},
      searchConfig: [
        {
          code: 'taskNo',
          label: '任务编号',
          type: 'text',
        },
        {
          code: 'enabled',
          label: '状态',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
        {
          code: 'updatedDt',
          label: '更新起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'updatedStartDt',
          endCode: 'updatedEndDt',
          type: 'daterange',
        },
        // {
        //   code: 'updatedStartDt',
        //   label: '更新开始时间',
        //   type: 'date',
        // },
        // {
        //   code: 'updatedEndDt',
        //   label: '更新结束时间',
        //   type: 'date',
        // },
      ],
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 170,
        },
        {
          code: 'taskNo',
          label: '请求编号',
        },
        {
          code: 'taskName',
          label: '请求名称',
          width: 170,
        },
        {
          code: 'lastRunTime',
          label: '上次运行时间',
          width: 150,
        },
        {
          code: 'runResult',
          label: '上次运行结果',
        },
        {
          code: 'updatedDt',
          label: '提交日期',
          width: 150,
        },
        {
          code: 'statusValue',
          label: '运行状态',
        },
        {
          code: 'enabledValue',
          label: '状态',
        },
      ],
      runTaskCode: '',
    };
  },
  methods: {
    handlerEdit(row) {
      const [minute, hour, day] = row.intervalTimeValue.split(',');
      this.form = Object.assign({}, { minute, hour, day }, row);
      this.dialogVisible = true;
    },
    handlerSubmit(form) {
      const { minute, hour, day } = form;
      if (this.checkType(form.day) || this.checkType(form.hour) || this.checkType(form.minute)) {
        this.$message.warning(this.$t('输入值类型错误'));
        return;
      }
      const intervalTime = [minute, hour, day].join(',');
      const taskId = form.id;
      const {
        taskName,
        runType,
        enabled,
        planStartTime,
        planEndTime,
      } = form;

      const params = {
        taskId,
        taskName,
        runType,
        enabled,
        planStartTime,
        planEndTime,
        intervalTime,
      };
      this.$http.post('/task/update', params).then(
        () => {
          this.$message.success(this.$t('修改成功'));
          this.dialogVisible = false;
          this.$refs.timerManager.getTableData();
        },
        () => {},
      );
    },
    checkType(value) {
      if (isNaN(value)) {
        return true;
      }
      return false;
    },
    handlerChangeStatus(row, enabled) {
      const params = {
        taskId: row.id,
        enabled,
      };
      this.$http.post('/task/enable', params).then(
        () => {
          this.$message.success(this.$t('修改成功'));
          this.$refs.timerManager.getTableData();
        },
        () => {},
      );
    },
    handlerRightNow(row) {
      const { taskCode } = row;
      this.runTaskCode = taskCode;
      this.$http.post('/task/execute', { taskCode }).then(
        () => {
          this.$message.success('操作成功');
          this.$refs.timerManager.getTableData();
          this.runTaskCode = '';
        },
        () => {
          this.runTaskCode = '';
        },
      );
    },
  },
};
</script>

<style lang="scss">
.timer-manager {
  .zte-form .el-form {
    .el-form-item.intervalTime {
      .el-input {
        width: 20%;
      }
    }
  }
  .el-dialog__body {
    padding-bottom: 15px;
  }
}
</style>
