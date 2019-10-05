<template>
  <div class="code-rule">
    <zte-table
      ref="table"
      index-style="index"
      request-url="codingrule/codingRuleList"
      :search-info="searchInfo"
      :table-column="tableColumn"
      :button-list="btnList"
      @add-row="handlerAdd">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native="handlerEdit(row)">{{ $t('编辑') }}</el-button>
      </template>
    </zte-table>

    <el-dialog
      width="70%"
      :title="$t(ruleTitle)"
      v-if="ruleDialogVisible"
      :visible.sync="ruleDialogVisible">
      <zte-form
        size="mini"
        :row-size="3"
        :item-info="itemInfo"
        :form="form"
        :cancel-text="$t('关闭')"
        @submit="handlerSubmit"
        @reset="ruleDialogVisible = false">
      </zte-form>
      <zte-table-local
        size="mini"
        ref="editRule"
        index-style="index"
        isPagination
        :table-column="detailTableColumn"
        :table-data="detailData">
        <template slot="content">
          <el-button icon="el-icon-plus" size="mini" @click.native="handlerAddDetail">{{ $t('新增') }}</el-button>
        </template>
        <template slot="operate" slot-scope="{ row, $index }">
          <el-button type="text" size="mini" @click.native="handlerEditDetail(row, $index)">{{ $t('编辑') }}</el-button>
          <el-button type="text" size="mini" @click.native="handlerDeleteDetail(row, $index)">{{ $t('删除') }}</el-button>
        </template>
      </zte-table-local>

      <el-dialog
        width="35%"
        append-to-body
        :title="$t(detailTitle)"
        :visible.sync="detailDialogVisible">
        <zte-form
          size="mini"
          :item-info="detailItemInfo"
          :form="detailForm"
          :cancel-text="$t('关闭')"
          @submit="handlerSubmitDetail"
          @reset="detailDialogVisible = false">
        </zte-form>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'codeRule',
  data() {
    const verifyName = async (rule, value, callback, form) => {
      const { numberRuleName, numberRuleCode } = form;
      if (!numberRuleName || !numberRuleCode) {
        return callback();
      }
      const params = {
        numberRuleName,
        numberRuleCode,
      };
      let repeatFlag = false;
      await this.$http.post('/codingrule/verifyName', params).then(
        (res) => {
          res = res.data;
          if (res.result > 0) {
            repeatFlag = true;
          }
        },
        () => {},
      );
      if (repeatFlag) {
        return callback('规则编号名称已存在');
      }
      return callback();
    };
    return {
      searchInfo: [
        {
          label: '规则编号',
          code: 'ruleCode',
          type: 'text',
        },
        {
          label: '规则名称',
          code: 'ruleName',
          type: 'text',
        },
        {
          label: '有效性',
          code: 'enabled',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
      ],
      tableColumn: [
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
          width: 120,
        },
        {
          label: '规则编号',
          code: 'rulecode',
        },
        {
          label: '规则名称',
          code: 'rulename',
        },
        {
          label: '适用单据',
          code: 'meaning',
        },
        {
          label: '起始日期',
          code: 'startDate',
          type: 'date',
          width: true,
        },
        {
          label: '终止日期',
          code: 'endDate',
          type: 'date',
          width: true,
        },
        {
          label: '有效性',
          code: 'enable',
        },
      ],
      ruleDialogVisible: false,
      ruleTitle: '',
      publicItemInfo: [
        {
          label: '适用单据',
          code: 'boeClassCode',
          type: 'select',
          options: [],
          fastCode: 'BOE_CLASS',
        },
        {
          label: '开始日期',
          code: 'startDate',
          type: 'date',
          required: true,
        },
        {
          label: '结束日期',
          code: 'endDate',
          type: 'date',
          required: true,
        },
        {
          label: '连接符',
          code: 'connectChar',
          type: 'select',
          options: [],
          fastCode: 'CONN_CHAR',
        },
      ],
      addItemInfo: [
        {
          label: '规则编号',
          code: 'numberRuleCode',
          type: 'text',
          required: true,
          validator: verifyName,
        },
        {
          label: '规则名称',
          code: 'numberRuleName',
          type: 'text',
          required: true,
          validator: verifyName,
        },
        {
          label: '有效性',
          code: 'enabled',
          type: 'select',
          required: true,
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
      ],
      editItemInfo: [
        {
          label: '规则编号',
          code: 'numberRuleCode',
          type: 'text',
          required: true,
          disabled: true,
        },
        {
          label: '规则名称',
          code: 'numberRuleName',
          required: true,
          type: 'text',
        },
      ],
      itemInfo: [],
      form: {},
      btnList: {
        add: true,
      },
      ruleId: '',
      detailTableColumn: [
        {
          label: '规则选项',
          code: 'ruleType',
        },
        {
          label: '选项值',
          code: 'ruleValue',
        },
        {
          label: '有效性',
          code: 'enabledMeaning',
        },
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
        },
      ],
      detailData: [],
      // total: 0,
      detailTitle: '',
      detailDialogVisible: false,
      detailItemInfo: [
        {
          label: '规则选项',
          code: 'ruleType',
          type: 'select',
          options: [],
          required: true,
          fastCode: 'RULE_TYPE',
        },
        {
          label: '选项值',
          required: true,
          code: 'ruleValue',
          type: 'text',
        },
        {
          label: '有效性',
          code: 'enabled',
          type: 'select',
          required: true,
          options: [],
          fastCode: 'ENABLED_FLAG',
        },
      ],
      detailForm: {},
    };
  },
  methods: {
    getTableData() {
      this.$refs.table.getTableData();
    },
    handlerAdd() {
      this.itemInfo = [...this.addItemInfo, ...this.publicItemInfo];
      this.ruleTitle = '新增';
      this.detailData = [];
      this.ruleDialogVisible = true;
      this.form = { enabled: 'Y' };
    },
    handlerEdit(row) {
      this.itemInfo = [...this.editItemInfo, ...this.publicItemInfo];
      this.ruleId = row.id;
      const params = {
        numberRuleID: row.id,
        // pageSize: 5,
        // pageNum: 1,
      };
      this.$http.post('/codingrule/codingRuleEdit', params).then(
        (res) => {
          res = res.data;
          this.form = res;
          this.detailData = res.resultDetail.list;
          // this.total = res.resultDetail.total;
          this.ruleTitle = '编辑';
          this.ruleDialogVisible = true;
        },
        () => {},
      );
    },
    handlerPageChange(pageNum) {
      const params = {
        numberRuleID: this.ruleId,
        pageSize: 5,
        pageNum,
      };
      this.$http.post('/codingrule/codingRuleEdit', params).then(
        (res) => {
          res = res.data;
          this.detailData = res.resultDetail.list;
          // this.total = res.resultDetail.total;
        },
        () => {},
      );
    },
    handlerSubmit(form) {
      const params = {
        ...form,
        codingRuleDetail: JSON.stringify(this.detailData),
      };
      const url = this.ruleTitle === '新增' ? '/codingrule/codRuleAdd' : '/codingrule/codRuleUpdate';
      this.$http.post(url, params).then(
        () => {
          this.$message.success(`${this.ruleTitle}成功`);
          this.ruleDialogVisible = false;
          this.getTableData();
        },
        () => {},
      );
    },
    handlerAddDetail() {
      this.detailTitle = this.$t('新增');
      this.detailDialogVisible = true;
      this.detailForm = { enabled: 'Y' };
    },
    handlerEditDetail(row, index) {
      this.detailTitle = this.$t('编辑');
      this.detailDialogVisible = true;
      this.editIndex = index;
      this.detailForm = JSON.parse(JSON.stringify(row));
    },
    handlerDeleteDetail(row, index) {
      if (row.id) {
        const params = {
          ruleDetailId: row.id,
        };
        this.$http.post('/codingrule/deleteNumberDetail', params).then(
          () => {},
          () => {},
        );
      }
      // this.total--;
      const markNum = this.$refs.editRule.pageSize * (this.$refs.editRule.pageNum - 1);
      this.detailData.splice(markNum + index, 1);
      if (this.$refs.editRule.pageNum > 1 && !(this.detailData.length - markNum)) {
        this.$refs.editRule.pageNum -= 1;
      }
    },
    handlerSubmitDetail(form) {
      form.enabledMeaning = form.enabled === 'Y' ? this.$t('启用') : this.$t('禁用');
      if (this.detailTitle === this.$t('编辑')) {
        this.detailData.splice(this.editIndex, 1, form);
      } else {
        this.detailData.push(form);
      }
      this.detailData.forEach((item, i) => {
        item.lineNum = i + 1;
      });
      // this.total++;
      this.detailDialogVisible = false;
    },
  },
};
</script>

<style>
.code-rule {}
</style>
