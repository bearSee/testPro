<template>
  <div class="borrowApply">
      <zte-table
      ref="borrowApply"
      request-url="/borrowApply/listApply"
      excelUrl="/borrowApply/jysqExportExcel"
      :buttonList="buttonList"
      index-style="index"
      :row-size="3"
      :search-info="searchConfig"
      :table-column="tableColumn">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.stop.native="view(row)">{{$t('查看')}}</el-button>
        <el-button type="text" size="mini" :disabled="row.archivesStatus === 'ARCHIVES_AS_DRAFT' ? false : true" @click.stop.native="change(row)">{{$t('修改')}}</el-button>
        <el-button type="text" size="mini" :disabled="row.archivesStatus === 'ARCHIVES_AS_DRAFT' ? false : true" @click.stop.native="delet(row)">{{$t('删除')}}</el-button>
      </template>
      <!-- 表头按钮部分 -->
      <div class="moreBtn" slot="moreOperate">
        <el-button size="mini" icon="el-icon-plus" @click.native="addNew">{{ $t('新增') }}</el-button>
      </div>
    </zte-table>

    <!-- 查看 -->
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

    <!-- 修改/新增 -->
    <el-dialog
      fullscreen
      :title="$t(editTitle)"
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

<script type='text/javascript'>
import borrowDialogView from '../../modules/borrow-dialog-view';
import borrowDialogEdit from '../../modules/borrow-dialog-edit';

export default {
  name: 'borrowApply',
  components: {
    borrowDialogView,
    borrowDialogEdit,
  },
  data() {
    return {
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
          code: 'companyId',
          label: '公司名称',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyId',
              from: 'ID',
            },
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
          ],
        },
        {
          code: 'applyDate',
          label: '创建起止日期',
          startPlaceholder: '起始日期',
          endPlaceholder: '截止日期',
          startCode: 'applyDateBegin',
          endCode: 'applyDateEnd',
          type: 'daterange',
        },
        // {
        //   code: 'applyDateBegin',
        //   label: '创建起始日期',
        //   type: 'date',
        // },
        // {
        //   code: 'applyDateEnd',
        //   label: '创建完成日期',
        //   type: 'date',
        // },
      ],
      // 页面table的表头信息
      tableColumn: [
        {
          code: 'operate',
          label: '操作',
          temp: 'operate',
          width: 150,
        },
        {
          code: 'meaning',
          label: '申请单状态',
          width: 150,
        },
        {
          code: 'applyNum',
          label: '申请单号',
          width: 250,
        },
        {
          code: 'createdDt',
          label: '创建日期',
          width: 150,
        },
        {
          code: 'applyEmployeeName',
          label: '申请人',
          width: 100,
        },
        {
          code: 'applyDate',
          label: '申请日期',
          width: 150,
        },
        {
          code: 'applyDesc',
          label: '申请说明',
          width: 150,
        },
        {
          code: 'companyName',
          label: '公司名称',
          width: 250,
        },
      ],
      buttonList: { excel: true },

      // 查看弹窗(不配置itemInfo、tableColumn会有默认值)
      viewVisible: false,
      viewData: {
        itemInfo: [],
        form: {},
        tableColumn: [],
        tableData: [],
        uploadData: [],
      },

      // 编辑、新增弹窗
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
            rowKey: 'ID',
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

      collectRow: [],
      id: '',
      editTitle: '借阅记录',
    };
  },
  mounted() {
  },
  methods: {
    // 新增按钮
    addNew() {
      const nowDate = this.getNowFormatDate();
      this.$http.post('/borrowApply/getcreateApplyData').then(
        (res) => {
          this.editData.form = Object.assign({}, res.data, { applyDate: nowDate, createdDt: nowDate, applyType: 'd' });
          this.editData.tableData = [
            {
              voucherNum: '',
              voucherId: '',
              periodName: '',
              voucherTypeMeaning: '',
              applyDateBegin: '',
              applyDateEnd: '',
            },
          ];
          this.editVisible = true;
          this.editTitle = '借阅申请';
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
      this.$http.post('/borrowApply/getApplyDetail', params).then(
        (res) => {
          this.viewData.form = Object.assign({}, { applyNum: row.applyNum }, res.data);
          this.viewData.uploadData = res.data.applyFiles;
          this.viewData.tableData = res.data.applyDetails;
          this.viewVisible = true;
        },
        () => {},
      );
    },
    // 修改按钮
    change(row) {
      this.id = row.id;
      const params = {
        employeeId: row.applyEmployeeId,
        applyNum: row.applyNum,
        id: row.id,
      };
      this.$http.post('/borrowApply/getApplyDetail', params).then(
        (res) => {
          this.editData.form = Object.assign({}, res.data, { applyNum: row.applyNum });
          this.editData.uploadData = res.data.applyFiles;
          this.editData.tableData = JSON.parse(JSON.stringify(res.data.applyDetails));
          this.editVisible = true;
          this.editTitle = '借阅记录';
        },
        () => {},
      );
    },
    // 新增 弹窗部分-----------------------------------------------
    closeDialog() {
      this.viewVisible = false;
      this.editVisible = false;
    },
    // 弹窗关闭前回调
    whenClosed() {
      this.editData.uploadData = [];
      this.editData.tableData = [];
      this.currentCompanyCode = '';
      this.$refs.borrowApply.getTableData();
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
          periodName: '',
          voucherTypeMeaning: '',
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
    // 新增/修改页面 -提交
    submit(form, rows, fileId) {
      this.submitForm('commit', form, rows, fileId);
    },
    // 新增、修改页面 -存草稿
    storage(form, rows, fileId) {
      this.submitForm('saveDraft', form, rows, fileId);
    },
    // 提交/存草稿封装方法
    submitForm(type, form, rows, fileId = []) {
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
          deptId: form.deptId,
          applyEmployeeId: form.applyEmployeeId,
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
        this.$http.post('/borrowApply/saveApply', params).then(
          () => {
            this.$message({
              type: 'success',
              message: this.$t('提交成功'),
            });
            this.$refs.borrowApply.getTableData();
            this.editVisible = false;
          },
          () => {},
        );
        return;
      }
      this.$message({
        type: 'warning',
        message: this.$t('请将信息填写完整'),
      });
    },
    // 删除按钮
    delet(row) {
      this.$confirm(`${this.$t('是否删除')}?`, this.$t('提示'), {
        confirmButtonText: this.$t('确认'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }).then(() => {
        const params = {
          id: row.id,
        };
        this.$http.post('/borrowApply/deleteApplyHeader', params).then(
          () => {
            this.$message.success(this.$t('删除成功'));
            this.$refs.borrowApply.getTableData();
          },
          () => {},
        );
      });
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
  },
};
</script>

<style lang='scss'>
    .el-dialog p{
        padding: 15px 0;
    }
    .moreBtn{
      float: right;
      margin-left: 10px;
    }
    .borrowApply {
      // .el-dialog {
      //   .applyDesc {
      //     width: 100%!important;
      //     height: 100px;
      //     .el-form-item__label {
      //       height: 100%;
      //       line-height: 100px!important;
      //     }
      //     .el-form-item__content {
      //       width: calc(100% - 150px);
      //       height: 100%!important;
      //       position: relative;
      //       .zte-item {
      //         width: calc(100% - 20px);
      //         position: absolute;
      //         top: 50%;
      //         left: 50%;
      //         transform: translate(-50%, -50%);
      //         .is-disabled textarea {
      //           border: 0;
      //           background: #fff;
      //           color: #222;
      //           padding: 5px 0;
      //           cursor: auto;
      //         }
      //       }
      //     }
      //   }
      // }
      // .companyCode {
      //   width: 100%!important;
      //   .zte-item {
      //     width: calc(50% - 85px);
      //   }
      // }
    }
</style>
