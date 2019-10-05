<template>
  <div class="my-approval">
    <el-tabs v-model="info">
      <el-tab-pane :label="$t('待我审批')" name="approvaling" stretch='true'>
        <zte-table
          ref="approvaling"
          request-url="/myApproval/listToApprove"
          excelUrl="/myApproval/wdspExportExcel"
          :buttonList="buttonList"
          index-style="selection"
          :row-size="3"
          :search-info="searchConfig"
          :table-column="approvedTableColumn"
          @row-check="select">
          <template slot="operate" slot-scope="{ row }">
            <el-button type="text" size="mini" @click.native="view(row)">{{$t('查看')}}</el-button>
            <el-button type="text" size="mini" @click.native="handlerRecord(row)">{{$t('操作记录')}}</el-button>
            <el-button type="text" size="mini" @click.native="agree(row)">{{$t('同意')}}</el-button>
          </template>
          <!-- 表头按钮部分 -->
          <div slot="content">
            <el-button size="small" @click.native="allAgree">{{ $t('同意') }}</el-button>
            <el-button size="small" @click.native="allDisagree">{{ $t('不同意') }}</el-button>
          </div>
        </zte-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('我已审批')" name="approvaled">
        <zte-table
          ref="approvaled"
          request-url="/myApproval/listHasApproved"
          excelUrl="/myApproval/wyspExportExcel"
          :buttonList="buttonList"
          index-style="index"
          :row-size="3"
          :search-info="searchConfig"
          :table-column="approvedTableColumn">
          <template slot="operate" slot-scope="{ row }">
            <el-button type="text" size="mini" @click.native="view(row)">{{$t('查看')}}</el-button>
            <el-button type="text" size="mini" @click.native="handlerRecord(row)">{{$t('操作记录')}}</el-button>
          </template>
        </zte-table>
      </el-tab-pane>
    </el-tabs>
    <!-- 操作记录 弹窗 -->
    <el-dialog
      class="operationRecords"
      width="80%"
      v-if="operationRecords.visible"
      :title="$t('借阅单操作记录')"
      :visible.sync="operationRecords.visible">
      <p style="padding:15px 0 0 0">{{$t('借阅单号')}}：{{operationRecords.serialNum}}</p>
      <zte-table
        index-style="index"
        :request-url="operationRecords.requestUrl"
        :params="operationRecords.params"
        :table-column="operationRecords.tableColumn">
      </zte-table>
    </el-dialog>
    <!-- 查看 -->
    <el-dialog
      fullscreen
      :title="$t('借阅记录')"
      style="margin-bottom:20px;"
      :visible.sync="viewVisible"
      :close-on-press-escape="false">
      <borrow-dialog-view
        :rowSize='2'
        :form="viewData.form"
        :itemInfo="viewData.itemInfo"
        :tableColumn="viewData.tableColumn"
        :tableData="viewData.tableData"
        :uploadData="viewData.uploadData"
        @closeDialog="closeDialog">
      </borrow-dialog-view>
    </el-dialog>
    <el-dialog
      :title="$t('请输入审批意见')"
      v-if="approveDialogVisible"
      :visible.sync="approveDialogVisible">
      <div class="approve">
        {{$t('审批意见')}}
        <el-input
          type="textarea"
          placeholder="请输入内容"
          v-model="approveComment">
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click.native="handlerApprove()">{{$t('确认')}}</el-button>
        <el-button size="mini" @click.native="approveDialogVisible = false">{{$t('关闭')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type='text/javascript'>
import borrowDialogView from '../../modules/borrow-dialog-view';

export default {
  name: 'my-approval',
  components: {
    borrowDialogView,
  },
  data() {
    return {
      info: 'approvaling',
      // 搜索框信息
      searchConfig: [
        {
          code: 'applyNum',
          label: '申请单号',
          type: 'text',
        },
        {
          code: 'applyEmployeeId',
          label: '申请人',
          type: 'table',
          showLabel: 'applyEmployeeName',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'applyEmployeeName',
              from: 'EMPLOYEE_NAME',
            },
            {
              to: 'applyEmployeeId',
              from: 'ID',
            },
          ],
        },
        {
          code: 'applyDate',
          label: '申请起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'applyDateBegin',
          endCode: 'applyDateEnd',
          type: 'daterange',
        },
      ],
      approvedTableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 170,
        },
        {
          code: 'applyNum',
          label: '申请单号',
          width: 200,
        },
        {
          code: 'applyEmployeeName',
          label: '申请人',
          width: 90,
        },
        {
          code: 'applyDate',
          label: '申请日期',
          width: 150,
        },
        {
          code: 'applyDesc',
          label: '申请说明',
          width: 200,
        },
      ],
      // 导出excel弹窗部分数据
      buttonList: {
        excel: true,
      },
      // 操作记录弹窗数据
      operationRecords: {
        requestUrl: '/myApproval/getErsApplyHistorie',
        serialNum: '',
        params: {},
        visible: false,
        // 操作记录 表格表头
        tableColumn: [
          {
            code: 'employeeName',
            label: '处理人',
          },
          {
            code: 'approveDate',
            label: '处理时间',
          },
          {
            code: 'approveCommand',
            label: '处理类型',
          },
          {
            code: 'approveComment',
            label: '审批意见',
          },
        ],
      },
      // 查看弹窗的数据
      viewVisible: false,
      viewData: {
        itemInfo: [],
        form: {},
        tableColumn: [],
        tableData: [],
        uploadData: [],
      },
      // 不同意弹窗
      approveDialogVisible: false,
      approveComment: '',
      // 收集选中的行
      collectRow: [],
      collectId: [],
    };
  },
  mounted() {

  },
  methods: {
    // 封装遍历勾选到的数据并将其整合成对象的方法
    traverse(values) {
      return JSON.stringify({ keys: values.map(item => item.code) });
    },
    getArr(values) {
      return values.map(item => item.id);
    },
    // 通过子组件发射事件row-check获取选中的数据，并赋值给collectRow
    select(selection) {
      this.collectRow = this.traverse(selection);
      this.collectId = this.getArr(selection);
    },
    // 一键同意
    allAgree() {
      if (this.collectId.length) {
        const params = {
          archivesHeaderId: this.collectId.join(','),
          approveCommand: '1',
        };
        this.$http.post('/myApproval/doApprove', params).then(
          () => {
            this.$message.success(this.$t('操作成功'));
            this.$refs.approvaling.getTableData();
          },
          () => {},
        );
      } else {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
      }
    },
    // 一键不同意
    allDisagree() {
      if (this.collectId.length) {
        this.approveDialogVisible = true;
      } else {
        this.$message.warning(this.$t('请至少勾选一条数据!'));
      }
    },
    handlerApprove() {
      if (!this.approveComment) {
        this.$message.warning(this.$t('请输入复审意见'));
        return;
      }

      const params = {
        archivesHeaderId: this.collectId.join(','),
        approveCommand: '0',
        approveComment: this.approveComment,
      };

      this.$http.post('/myApproval/doApprove', params).then(
        () => {
          this.$message.success(this.$t('复审成功'));
          this.approveDialogVisible = false;
          this.approveComment = '';
          this.$refs.approvaling.getTableData();
        },
        () => {},
      );
    },
    // 查看按钮
    view(row) {
      const params = {
        employeeId: row.applyEmployeeId,
        applyNum: row.applyNum,
        id: row.id,
      };
      this.$http.post('/myApproval/getApplyDetail', params).then(
        (res) => {
          this.viewData.form = Object.assign({}, { applyNum: row.applyNum }, res.data);
          this.viewData.uploadData = res.data.applyFiles;
          this.viewData.tableData = res.data.applyDetails;
          this.viewVisible = true;
        },
        () => {},
      );
    },
    closeDialog() {
      this.viewVisible = false;
    },
    // 同意按钮
    agree(row) {
      const params = {
        archivesHeaderId: row.id,
        approveCommand: '1',
      };
      this.$http.post('/myApproval/doApprove', params).then(
        () => {
          this.$message.success(this.$t('操作成功'));
          this.$refs.approvaling.getTableData();
        },
        () => {},
      );
    },
    // 操作记录按钮
    handlerRecord(row) {
      this.operationRecords.params = {
        id: row.id,
      };
      this.operationRecords.serialNum = row.applyNum;
      this.operationRecords.visible = true;
    },
  },
};
</script>

<style lang='scss'>
.my-approval {
  // .applyDesc {
  //   width: 100%!important;
  // }
  .el-tabs{
    height: 100%;
    padding-top: 10px;
    .el-tabs__header{
      margin: 0;
      .el-tabs__nav-wrap {
        width: 180px;
      }
    }
    .search-body{
      padding-top: 20px !important;
    }
    .table-head {
      width: 100%;
      height: 30px;
      padding: 8px 10px 2px 10px;
      position: relative;
      top: 7px;
      .table-head-title {
        float: left;
        width: 100px;
      }
      .table-head-btn {
        float: right;
        .el-button {
          padding: 0;
        }
      }
    }
    .el-tabs__content{
      height: 93%;
      .el-tab-pane{
        height: 100%;
      }
    }
  }
  .el-tabs__nav::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: #E4E7ED;
    z-index: 0;
  }
  .el-tabs__nav-wrap::after {
    content:".";
    display:block;
    height:0;
    clear:both;
    visibility:hidden;
  }
}
</style>
