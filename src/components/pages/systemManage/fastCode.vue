<template>
  <div class="fast-code">
    <zte-table
      ref="table"
      index-style="index"
      request-url="/lookup/list"
      :search-info="searchInfo"
      :table-column="tableColumn"
      :button-list="btnList"
      @add-row="handlerAdd">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native="handlerEdit(row)">{{ $t('编辑') }}</el-button>
      </template>
      <!-- <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native="handlerDelete(row)">{{ $t('删除') }}</el-button>
      </template> -->
    </zte-table>

    <el-dialog
      width="70%"
      :title="$t(codeTitle)"
      v-if="codeDialogVisible"
      :visible.sync="codeDialogVisible">
      <zte-form
        size="mini"
        :row-size="2"
        :item-info="itemInfo"
        :form="form"
        :cancelText="$t('关闭')"
        @submit="handlerSubmit"
        @reset="codeDialogVisible = false">
      </zte-form>
      <zte-table-local
        size="mini"
        ref="fastCode"
        index-style="index"
        isPagination
        :table-column="detailTableColumn"
        :table-data="detailData">
        <template slot="content">
          <el-button size="mini" icon="el-icon-plus" @click.native="handlerAddDetail">{{ $t('新增') }}</el-button>
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
  name: 'fastCode',
  data() {
    return {
      searchInfo: [
        {
          label: '编码',
          code: 'lookupType',
          type: 'text',
        },
        {
          label: '编码名称',
          code: 'description',
          type: 'text',
        },
      ],
      tableColumn: [
        {
          label: '操作',
          code: 'operate',
          temp: 'operate',
          width: 150,
        },
        {
          label: '编码',
          code: 'lookupType',
          width: 100,
        },
        {
          label: '编码名称',
          code: 'description',
        },
        {
          label: '编码类型',
          code: 'customizationLevel',
        },
        {
          label: '有效性',
          code: 'enabled',
        },
      ],
      btnList: {
        add: true,
      },
      codeTitle: '',
      codeDialogVisible: false,
      itemInfo: [],
      addItemInfo: [
        {
          label: '编码',
          code: 'lookupType',
          type: 'text',
          required: true,
        },
        {
          label: '编码名称',
          code: 'description',
          type: 'text',
          required: true,
        },
        {
          label: '编码类型',
          code: 'customizationLevel',
          type: 'select',
          options: [],
          fastCode: 'CUSTOMIZATIONLEVEL',
          required: true,
        },
        {
          label: '有效性',
          code: 'enabled',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
          required: true,
        },
      ],
      editItemInfo: [
        {
          label: '编码',
          code: 'lookupType',
          type: 'text',
          disabled: true,
        },
        {
          label: '编码名称',
          code: 'description',
          type: 'text',
          required: true,
        },
        {
          label: '编码类型',
          code: 'customizationLevel',
          type: 'select',
          options: [],
          fastCode: 'CUSTOMIZATIONLEVEL',
          required: true,
        },
      ],
      form: {},
      detailTableColumn: [
        {
          label: '编码',
          code: 'lookupCode',
        },
        {
          label: '编码名称',
          code: 'meaning',
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
      detailTitle: '',
      detailDialogVisible: false,
      detailItemInfo: [
        {
          label: '编码',
          code: 'lookupCode',
          type: 'text',
          required: true,
        },
        {
          label: '编码名称',
          code: 'meaning',
          type: 'text',
          required: true,
        },
        {
          label: '有效性',
          code: 'enabled',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
          required: true,
        },
      ],
      detailForm: {},
      editIndex: -1,
    };
  },
  methods: {
    getTableData() {
      this.$refs.table.getTableData();
    },
    handlerAdd() {
      this.codeTitle = '新增';
      this.itemInfo = this.addItemInfo;
      this.codeDialogVisible = true;
      this.form = { enabled: 'Y' };
      this.detailData = [];
    },
    handlerEdit(row) {
      this.codeTitle = '编辑';
      this.itemInfo = this.editItemInfo;
      this.codeDialogVisible = true;
      this.$http.post('/lookup/listTypeDetails', { id: row.id }).then(
        (res) => {
          res = res.data;
          this.form = res.typeDetail;
          this.detailData = res.valueList;
        },
        () => {},
      );
    },
    // handlerDelete(row) {
    //   this.$http.post('/lookup/deleteLookupType', { id: row.id }).then(
    //     () => {
    //       this.$message.success('删除成功');
    //       this.getTableData();
    //     },
    //     () => {},
    //   );
    // },
    handlerSubmit(form) {
      const params = {
        evsLookupTypesList: [form],
        evsLookupValuesList: this.detailData,
      };
      const config = {
        transformRequest: [
          data => JSON.stringify(data),
        ],
        headers: {
          'Content-Type': 'application/json',
        },
      };
      this.$http.post('/lookup/updateLookup', params, config).then(
        () => {
          this.$message.success(`${this.codeTitle}成功`);
          this.codeDialogVisible = false;
          this.getTableData();
        },
        () => {},
      );
    },
    handlerAddDetail() {
      this.detailTitle = '新增';
      this.detailDialogVisible = true;
      this.detailForm = { enabled: 'Y' };
    },
    handlerEditDetail(row, index) {
      this.detailTitle = '编辑';
      this.detailDialogVisible = true;
      this.editIndex = index;
      this.detailForm = JSON.parse(JSON.stringify(row));
    },
    handlerDeleteDetail(row, index) {
      if (row.id) {
        const params = {
          id: [row.id],
        };
        const config = {
          transformRequest: [
            data => JSON.stringify(data),
          ],
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.$http.post('/lookup/deleteLookupValues', params, config).then(
          () => {},
          () => {},
        );
      }
      const markNum = this.$refs.fastCode.pageSize * (this.$refs.fastCode.pageNum - 1);
      this.detailData.splice(markNum + index, 1);
      if (this.$refs.fastCode.pageNum > 1 && !(this.detailData.length - markNum)) {
        this.$refs.fastCode.pageNum -= 1;
      }
    },
    handlerSubmitDetail(form) {
      form.enabledMeaning = form.enabled === 'Y' ? this.$t('启用') : this.$t('禁用');
      form.lookupType = this.form.lookupType;
      if (this.detailTitle === '编辑') {
        this.detailData.splice(this.editIndex, 1, form);
      } else {
        this.detailData.push(form);
      }
      this.detailDialogVisible = false;
    },
  },
};
</script>

<style>
.fast-code {}
</style>
