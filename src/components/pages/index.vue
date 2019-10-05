<template>
  <div class="index">
    <div class="entry">
      <div class="title">{{$t('常用入口')}}</div>
      <ul class="entry-main">
        <li v-for="(item, index) of menu"
          @click="goPage(item)"
          :key="index">
          <div class="icon">
            <svg-icon :icon-class="item.iconName"></svg-icon>
          </div>
          <div class="text">{{$t(item.text)}}</div>
        </li>
      </ul>
    </div>
    <zte-table
      ref="myApply"
      index-style="index"
      request-url="/myApply/listMyApprove"
      excelUrl="/myApply/wdsqExportExcel"
      :row-size="3"
      :table-column="tableColumn">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" :disabled="!row.viewTag" size="mini" @click.native="watch(row)">{{$t('查看')}}</el-button>
        <el-button type="text" size="mini" @click.native="handlerRecord(row)">{{$t('操作记录')}}</el-button>
        <el-button type="text" size="mini" :disabled="!(row.archivesStatus === 'ARCHIVES_AS_DRAFT')" @click.native="change(row)">{{$t('修改')}}</el-button>
        <el-button type="text" size="mini" :disabled="!row.delTag" @click.native="undo(row)">{{$t('删除')}}</el-button>
      </template>
      <template slot="applyNum" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native="view(row)">{{row.applyNum}}</el-button>
      </template>
    </zte-table>
    <!-- 查看 弹窗 -->
    <el-dialog
      width="80%"
      :title="$t(viewArchives.title)"
      v-if="viewArchivesVisible"
      :visible.sync="viewArchivesVisible"
      @closed="whenClosed">
      <zte-table
        index-style="index"
        request-url="/myApply/getMyApplyDetail"
        :params="viewArchives.params"
        :table-column="viewArchives.tableColumn">
        <template slot="voucherNum" slot-scope="{ row }">
          <el-button :disabled="row.voucherId === '0'" type="text" size="mini" @click.native="viewVoucher(row, 'COVER')">{{row.voucherNum}}</el-button>
        </template>
        <template slot="imageNumber" slot-scope="{ row }">
          <el-button :disabled="row.voucherId === '0'" type="text" size="mini" @click.native="viewVoucher(row, 'IMAGE')">{{row.imageNumber}}</el-button>
        </template>
        <template slot="boeNum" slot-scope="{ row }">
          <el-button type="text" size="small" @click.native="gotoBas(row)">{{ row.boeNum }}</el-button>
        </template>
      </zte-table>
    </el-dialog>
    <!-- 操作记录 弹窗 -->
    <el-dialog
      class="operationRecords"
      width="80%"
      :title="$t('借阅单操作记录')"
      :visible.sync="operationRecords.visible">
      <p style="padding:15px 0 0 0">{{$t('借阅单号')}}：{{operationRecords.serialNum}}</p>
      <zte-table
        index-style="index"
        :request-url="operationRecords.requestUrl"
        :params="operationRecords.params"
        :table-column="operationRecords.tableColumn"
        :is-sortable="false">
      </zte-table>
    </el-dialog>
    <!-- 查看借阅申请 -->
    <el-dialog
      fullscreen
      style="margin-bottom:20px;"
      :title="$t('借阅记录')"
      :visible.sync="viewVisible"
      :close-on-press-escape="false"
      @closed="whenClosed">
      <borrow-dialog-view
        :rowSize="2"
        :itemInfo="viewData.itemInfo"
        :form="viewData.form"
        :tableColumn="viewData.tableColumn"
        :tableData="viewData.tableData"
        :uploadData="viewData.uploadData"
        @closeDialog="closeDialog">
      </borrow-dialog-view>
    </el-dialog>

    <!-- 修改 -->
    <el-dialog
      fullscreen
      :title="$t('借阅记录')"
      :close-on-press-escape="false"
      v-if="editVisible"
      :visible.sync="editVisible"
      @closed="whenClosed">
      <borrow-dialog-edit
        :rowSize="2"
        :itemInfo="editData.itemInfo"
        :form="editData.form"
        :tableColumn="editData.tableColumn"
        :tableData="editData.tableData"
        :uploadData="editData.uploadData"
        @companyChanged='companyChanged'
        @uploadSuc='uploadSuc'
        @deletFile='deletFile'
        @addLine='addLine'
        @submit='submit'
        @storage='storage'
        @closeDialog="closeDialog">
      </borrow-dialog-edit>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import mixins from '../../mixins/publicMethods';
import borrowDialogView from '../modules/borrow-dialog-view';
import borrowDialogEdit from '../modules/borrow-dialog-edit';

export default {
  name: 'index',
  mixins: [mixins],
  components: {
    borrowDialogView,
    borrowDialogEdit,
  },
  data() {
    return {
      menu: [
        {
          iconName: 'menu-log',
          text: '我的申请',
          route: '/myApply',
        },
        {
          iconName: 'handle',
          text: '我的审批',
          route: '/myApproval',
        },
        {
          iconName: 'audit',
          text: '凭证匹配',
          route: '/voucherMatching',
        },
        {
          iconName: 'menu-reim',
          text: '凭证分册',
          route: '/archiveSplit',
        },
      ],
      // 页面table的表头信息
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 210,
        },
        {
          code: 'applyNum',
          label: '借阅单号',
          temp: 'applyNum',
          width: 250,
        },
        {
          code: 'companyName',
          label: '公司名称',
          width: 230,
        },
        {
          code: 'applyDate',
          label: '申请日期',
          width: 170,
        },
        {
          code: 'meaning',
          label: '审批状态',
          width: 150,
        },
        {
          code: 'applyType',
          label: '借阅类型',
          width: 120,
        },
      ],
      // 操作记录弹窗数据
      operationRecords: {
        requestUrl: '/myApply/getErsApplyHistorie',
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
        ],
      },
      // 查看按钮弹窗数据
      electronicArchives: {
        title: '电子档案借阅',
        tableColumn: [
          {
            code: 'bookCode',
            label: '分册编号',
            width: 180,
          },
          {
            label: '单据编号',
            code: 'boeNum',
            width: 200,
            temp: 'boeNum',
          },
          {
            code: 'voucherNum',
            label: '凭证编号',
            temp: 'voucherNum',
            width: 130,
          },
          {
            code: 'periodName',
            label: '会计年度',
            width: 100,
          },
          {
            code: 'voucherType',
            label: '凭证类别',
            width: 100,
          },
          {
            code: 'imageNumber',
            label: '影像编号',
            temp: 'imageNumber',
            width: 180,
          },
        ],
      },
      physicalArchives: {
        title: '实物档案借阅',
        tableColumn: [
          {
            code: 'bookCode',
            label: '分册编号',
            width: 180,
          },
          {
            label: '单据编号',
            code: 'boeNum',
            temp: 'boeNum',
            width: 200,
          },
          {
            code: 'voucherNum',
            label: '凭证编号',
            width: 130,
          },
          {
            code: 'periodName',
            label: '会计年度',
            width: 100,
          },
          {
            code: 'meaning',
            label: '凭证类别',
            width: 100,
          },
          {
            code: 'storageAddress',
            label: '存放地点',
            width: 200,
          },
          {
            code: 'employeeName',
            label: '操作人',
            width: 100,
          },
        ],
      },
      viewArchives: {},
      viewArchivesVisible: false,
      buttonList: { excel: true },
      // 查看借阅申请单 弹窗的数据
      viewVisible: false,
      viewData: {
        itemInfo: [],
        form: {},
        tableColumn: [],
        tableData: [],
        uploadData: [],
      },
      // 编辑借阅申请 弹窗
      editVisible: false,
      editData: {
        itemInfo: [
          {
            code: 'applyNum',
            label: '申请单号',
            type: 'label',
          },
          {
            code: 'applyType',
            label: '借阅类型',
            type: 'temp',
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
              {
                to: 'deptName',
                from: 'DEPT_NAME',
              },
              {
                to: 'deptId',
                from: 'DEPT_ID',
              },
            ],
            relateCode: 'deptName',
            required: true,
          },
          {
            code: 'deptName',
            label: '部门',
            type: 'label',
          },
          {
            code: 'applyDesc',
            label: '申请说明',
            type: 'text',
            // label: '实际借阅人信息',
            // type: 'textarea',
            required: true,
          },
          {
            code: 'companyCode',
            label: '结算单位',
            // label: '档案所属部门',
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
        ],
        form: {},
        tableColumn: [
          {
            code: 'periodName',
            label: '会计期间',
            temp: 'periodName',
          },
          {
            code: 'voucherTypeMeaning',
            label: '凭证类型',
            temp: 'voucherTypeMeaning',
          },
          {
            code: 'voucherId',
            label: '申请借阅凭证',
            temp: 'voucherId',
          },
          {
            code: 'applyDateBegin',
            label: '借阅开始时间',
            temp: 'applyDateBegin',
          },
          {
            code: 'applyDateEnd',
            label: '借阅结束时间',
            temp: 'applyDateEnd',
          },
        ],
        tableData: [],
        uploadData: [],
      },
      currentCompanyCode: '',
      id: '',
    };
  },
  mounted() {
  },
  methods: {
    goPage(item) {
      this.$router.push(item.route);
    },
    // 查看按钮
    watch(row) {
      if (row.atype === 'd') {
        this.viewArchives = JSON.parse(JSON.stringify(Object.assign({}, this.electronicArchives, { params: { id: row.id } })));
        this.viewArchivesVisible = true;
      } else {
        this.viewArchives = JSON.parse(JSON.stringify(Object.assign({}, this.physicalArchives, { params: { id: row.id } })));
        this.viewArchivesVisible = true;
      }
    },
    viewVoucher(row, str) {
      this.openUrl(row, str);
    },
    // 操作记录按钮
    handlerRecord(row) {
      this.operationRecords.params = {
        id: row.id,
      };
      this.operationRecords.serialNum = row.applyNum;
      this.operationRecords.visible = true;
    },
    // 删除按钮
    undo(row) {
      this.$confirm(`${this.$t('是否删除')}?`, this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        const params = {
          id: row.id,
        };
        this.$http.post('/myApply/deleteApplyHeader', params).then(
          () => {
            this.$message.success(this.$t('删除成功'));
            this.$refs.myApply.getTableData();
          },
          () => {},
        );
      });
    },

    // 查看借阅单弹窗
    view(row) {
      const params = {
        employeeId: row.applyEmployeeId,
        applyNum: row.applyNum,
        id: row.id,
      };
      this.$http.post('/myApply/getApplyDetail', params).then(
        (res) => {
          this.viewData.form = Object.assign({}, { applyNum: row.applyNum }, res.data);
          this.viewData.uploadData = res.data.applyFiles;
          this.viewData.tableData = res.data.applyDetails;
          this.viewVisible = true;
        },
        () => {},
      );
    },
    // 修改借阅单弹窗
    change(row) {
      this.id = row.id;
      const params = {
        employeeId: row.applyEmployeeId,
        applyNum: row.applyNum,
        id: row.id,
      };
      this.$http.post('/myApply/getApplyDetail', params).then(
        (res) => {
          this.editData.form = Object.assign({}, res.data, { applyNum: row.applyNum });
          this.editData.uploadData = res.data.applyFiles;
          this.editData.tableData = JSON.parse(JSON.stringify(res.data.applyDetails));
          this.editVisible = true;
        },
        () => {},
      );
    },
    // 新增弹窗页面表单内公司修改时重置借阅申请列表数据
    companyChanged(form, rows) {
      if (this.currentCompanyCode && form.companyCode && this.currentCompanyCode !== form.companyCode) {
        const tableData = rows.map(item => (Object.assign(item, {
          voucherId: '',
          voucherNum: '',
          voucherTypeMeaning: '',
          periodName: '',
        })));
        this.editData = Object.assign(this.editData, { tableData, form });
      }
      this.currentCompanyCode = form.companyCode;
    },
    // 新增行
    addLine(data) {
      const tableData = [
        ...data,
        {
          voucherId: '',
          voucherNum: '',
          applyDateBegin: '',
          applyDateEnd: '',
        },
      ];
      this.editData = Object.assign(this.editData, { tableData });
    },
    uploadSuc(res, rows) {
      const uploadData = [...rows, res];
      this.editData = Object.assign(this.editData, { uploadData });
    },
    deletFile(index, rows) {
      const uploadData = [...rows.splice(0, index), ...rows.splice(index + 1)];
      this.editData = Object.assign(this.editData, { uploadData });
    },
    // -提交
    submit(form, rows, fileId) {
      this.submitForm('commit', form, rows, fileId);
    },
    // -存草稿
    storage(form, rows, fileId) {
      this.submitForm('saveDraft', form, rows, fileId);
    },
    // 提交/存草稿封装方法
    submitForm(type, form, rows, fileId = []) {
      if (rows.length === 0) {
        this.$message({
          type: 'warning',
          message: this.$t('请至少勾选一条数据!'),
        });
        return;
      }
      const checkData = {
        applyDate: form.applyDate,
        applyDesc: form.applyDesc,
        applyType: form.applyType,
        createdDt: form.createdDt,
      };
      if (this.checkArr(rows) && this.checkForm(checkData)) {
        const params = {
          id: this.id,
          applyNum: form.applyNum,
          companyId: form.companyId,
          applyDate: form.applyDate,
          applyDesc: form.applyDesc,
          applyType: form.applyType,
          saveType: type,
          applyDetailList: JSON.stringify(rows.map(item => Object.assign({
            id: item.id,
            voucherId: item.voucherId,
            periodName: item.periodName,
            voucherTypeMeaning: item.voucherTypeMeaning,
            applyDateBegin: item.applyDateBegin,
            applyDateEnd: item.applyDateEnd,
          }))),
          applyFiles: JSON.stringify(fileId.map(item => Object.assign({ id: item }))),
        };
        this.$http.post('/myApply/saveApply', params).then(
          () => {
            this.$message({
              type: 'success',
              message: this.$t('提交成功'),
            });
            this.$refs.myApply.getTableData();
            this.viewVisible = false;
            this.editVisible = false;
          },
          () => {},
        );
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('请将信息填写完整'),
        });
      }
    },
    closeDialog() {
      this.viewVisible = false;
      this.editVisible = false;
    },
    // 弹窗关闭前回调
    whenClosed() {
      this.viewArchives = {};
      this.editData.uploadData = [];
      this.editData.tableData = [];
      this.currentCompanyCode = '';
      this.$refs.myApply.getTableData();
    },
    // 检查表单数据是否为空
    checkForm(form) {
      const arr = ['periodName', 'voucherType', 'applyDateBegin', 'applyDateEnd'];
      if (Object.keys(form).length) {
        for (const key in form) {
          if (form[key] === '' || (arr.indexOf(key) > -1) && !form[key]) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    // 检查数组内json对象每一个值是否为空
    checkArr(arr) {
      if (arr.length) {
        let bool = true;
        arr.forEach((item) => {
          if (!this.checkForm(item)) {
            bool = false;
          }
        });
        if (!bool) {
          return false;
        }
        return true;
      }
      return false;
    },
    // 获取当前时间，格式YYYY-MM-DD
    getNowFormatDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = this.handelTime(date.getMonth() + 1);
      const day = this.handelTime(date.getDate());
      const hour = this.handelTime(date.getHours());
      const minute = this.handelTime(date.getMinutes());
      const second = this.handelTime(date.getSeconds());
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    // 时间 返回两位数
    handelTime(time) {
      if (time >= 0 && time <= 9) {
        return `0${time}`;
      }
      return time;
    },
    gotoBas(row) {
      const { boeNum } = row;
      this.$http.post('/init/getEasSessionId', { boeNum, type: 'LOOK_BOE_NUM' }).then(
        ({ data }) => {
          const { language, userInfo, sessionId, lookBoeUrl } = data;
          this.$cookies.set('ZTESSCAUTH', sessionId, '0', '/');
          if (language) this.$cookies.set('user_language', language, '0', '/');
          if (userInfo) this.$cookies.set('userInfo', JSON.stringify(userInfo), '0', '/');
          window.open(lookBoeUrl);
        },
        () => {},
      );
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/scss/theme.scss";
.index {
  height: 98%!important;
  .entry {
    background-color: #fff;
    // box-shadow: 0 0 5px #bbb;
    font-size: 14px;
    .title {
      border-top: 1px #F2F6FC solid;
      margin-top: 3px;
      height: 40px;
      line-height: 40px;
      padding-left: 20px;
      color: #909399;
    }
    .entry-main {
      border-top: 1px #EBEEF5 solid;
      border-bottom: 1px #EBEEF5 solid;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100px;
      li {
        width: 25%;
        height: 100%;
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        border-right: 1px solid #EBEEF5;
        padding: 3px;
        cursor: pointer;
        &:last-child {
          border-right: none;
        }
        .svg-icon {
          font-size: 56px;
          fill: #fff;
          background-color: $light;
          border-radius: 5px;
          padding: 5px;
          margin-bottom: 5px;
        }
      }
    }
  }
  .zte-table {
    height: calc(100% - 130px);
    background-color: #fff;
    border-top: 15px #f9fcfe solid;
  }
}
</style>
