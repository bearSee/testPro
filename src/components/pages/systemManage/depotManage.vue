<template>
  <div class="depot-manage">
    <zte-table
      ref="table"
      index-style="index"
      request-url="storage/listStorage"
      :search-info="searchInfo"
      :table-column="tableColumn"
      :button-list="btnList"
      @add-row="handlerAdd">
      <template slot="operate" slot-scope="{ row }">
        <el-button type="text" size="mini" @click.native="handlerEdit(row)">{{ $t('编辑') }}</el-button>
      </template>
    </zte-table>
    <el-dialog
      :title="$t(depotTitle)"
      v-if="depotDialogVisible"
      :visible.sync="depotDialogVisible">
      <zte-form
        size="mini"
        :row-size="2"
        :item-info="depotItemInfo"
        :form="depotForm"
        :cancel-text="$t('关闭')"
        @submit="handlerSubmit"
        @reset="depotDialogVisible = false">
      </zte-form>
      <zte-table-local
        size="mini"
        :table-column="detailColumn"
        :table-data="detailData"
        :button-list="detailButton"
        @add-row="handlerAddDetail"
        @edit-row="handlerEditDetail">
        <template slot="operate" slot-scope="{ row, $index }">
          <el-button type="text" size="mini" @click="handlerEditDetail(row, $index)">{{ $t('编辑') }}</el-button>
        </template>
        <template slot="enabled" slot-scope="{ row }">
          <span>{{ $t(status[row.enabled])}}</span>
        </template>
      </zte-table-local>

      <el-dialog
        append-to-body
        width="35%"
        :title="$t(detailTitle)"
        v-if="detailDialogVisible"
        :visible.sync="detailDialogVisible">
        <zte-form
          size="mini"
          :item-info="detailItemInfo"
          :form="detailForm"
          :cancel-text="$t('关闭')"
          @select-change="selectChange"
          @submit="handlerSubmitDetail"
          @reset="detailDialogVisible = false">
        </zte-form>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'depotManage',
  data() {
    return {
      searchInfo: [
        {
          label: '仓库编码',
          code: 'storageCode',
          type: 'text',
        },
        {
          label: '仓库名称',
          code: 'storageName',
          type: 'text',
        },
        {
          label: '所属公司',
          code: 'companyCode',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
            {
              to: 'companyCode',
              from: 'COMPANY_CODE',
            },
          ],
        },
        {
          label: '所属城市',
          code: 'cityId',
          showLabel: 'cityName',
          type: 'table',
          key: 'CityLov.find',
          trans: [
            {
              to: 'cityId',
              from: 'CITY_ID',
            },
            {
              to: 'cityName',
              from: 'CITY_NAME',
            },
          ],
        },
        {
          label: '仓库管理员',
          code: 'employeeId',
          showLabel: 'employeeName',
          type: 'table',
          key: 'StorageEmployeeLov.find',
          trans: [
            {
              to: 'employeeId',
              from: 'ID',
            },
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
          ],
        },
        {
          label: '状态',
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
          wdith: 50,
        },
        {
          label: '仓库编码',
          code: 'storageCode',
          width: 70,
        },
        {
          label: '仓库名称',
          code: 'storageName',
          width: 150,
        },
        {
          label: '所属公司',
          code: 'companyName',
          width: 180,
        },
        {
          label: '城市',
          code: 'cityName',
        },
        {
          label: '仓库管理员',
          code: 'employeeName',
        },
        {
          label: '状态',
          code: 'enabledValue',
        },
      ],
      btnList: {
        add: true,
      },
      status: {
        Y: '启用',
        N: '禁用',
      },
      depotTitle: '',
      depotDialogVisible: false,
      depotItemInfo: [
        {
          label: '仓库编码',
          code: 'storageCode',
          type: 'text',
          required: true,
        },
        {
          label: '仓库名称',
          code: 'storageName',
          type: 'text',
          required: true,
        },
        {
          label: '所属公司',
          code: 'companyCode',
          showLabel: 'companyName',
          type: 'table',
          key: 'ComapanyLov.find',
          trans: [
            {
              to: 'companyName',
              from: 'COMPANY_NAME',
            },
            {
              to: 'companyCode',
              from: 'COMPANY_CODE',
            },
          ],
          required: true,
        },
        {
          label: '城市',
          code: 'cityId',
          showLabel: 'cityName',
          type: 'table',
          key: 'CityLov.find',
          trans: [
            {
              to: 'cityId',
              from: 'CITY_ID',
            },
            {
              to: 'cityName',
              from: 'CITY_NAME',
            },
          ],
          required: true,
        },
        {
          label: '仓库管理员',
          code: 'employeeId',
          showLabel: 'employeeName',
          type: 'table',
          key: 'EmployeeLov.find',
          trans: [
            {
              to: 'employeeId',
              from: 'ID',
            },
            {
              to: 'employeeName',
              from: 'EMPLOYEE_NAME',
            },
          ],
          required: true,
        },
        {
          label: '状态',
          code: 'enabled',
          type: 'select',
          options: [],
          fastCode: 'ENABLED_FLAG',
          required: true,
        },
      ],
      depotForm: { enabled: 'Y' },
      detailColumn: [
        {
          label: '库位编码',
          code: 'libraryCode',
        },
        {
          label: '库位名称',
          code: 'libraryName',
        },
        {
          label: '属性',
          code: 'libraryAtt',
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
      detailButton: {
        add: true,
      },
      detailDialogVisible: false,
      detailTitle: '',
      detailItemInfo: [
        {
          label: '属性',
          code: 'libraryAtt',
          type: 'select',
          fastCode: 'ATTRIBUTE',
          options: [],
          required: true,
          relateCode: 'libraryName', // 库位名称需要根据属性的选择值, 动态更新快速编码请求
        },
        {
          label: '库位名称',
          code: 'libraryName',
          showLabel: 'libraryName',
          type: 'select',
          fastCode: '',
          options: [],
          required: true,
          next: { libraryCode: 'key' },
        },
        {
          label: '库位编码',
          code: 'libraryCode',
          type: 'text',
          disabled: true,
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
      detailIndex: -1,
      detailForm: { enabled: 'Y' },
    };
  },
  methods: {
    getTableData() {
      this.$refs.table.getTableData();
    },
    handlerAdd() {
      this.depotTitle = '新增仓库';
      this.depotItemInfo = this.depotItemInfo.map(item => Object.assign({}, item, { disabled: false }));
      this.depotDialogVisible = true;
      this.depotForm = { enabled: 'Y' };
      this.detailData = [];
    },
    async handlerEdit(row) {
      this.depotTitle = '编辑仓库';
      this.depotItemInfo = this.depotItemInfo.map((item) => {
        if (item.code === 'storageCode') return Object.assign({}, item, { disabled: true });
        return item;
      });
      await this.$http.post('/storage/findStorage', { id: row.id }).then(
        (res) => {
          res = res.data;
          this.depotForm = res;
        },
        () => {},
      );
      await this.$http.post('/storage/listStorageDetail', { storageCode: row.storageCode }).then(
        (res) => {
          res = res.data;
          this.detailData = res.list;
          this.depotDialogVisible = true;
        },
        () => {},
      );
    },
    handlerSubmit(form) {
      if (!this.detailData.length) {
        this.$message.warning(this.$t('请至少新增一条库位信息'));
        return;
      }
      const enabled = this.detailData.some(item => item.enabled === 'Y');
      // 请控制新增行里必须有一条启用的区行列层才可提交
      if (!enabled) {
        this.$message.warning(this.$t('库位信息不能全部禁用'));
        return;
      }
      const params = {
        storage: JSON.stringify(form),
        storageDetailList: JSON.stringify(this.detailData),
      };

      const url = this.depotTitle === '新增仓库' ? '/storage/saveStorage' : '/storage/updateStorage';
      this.$http.post(url, params).then(
        () => {
          this.$message.success(`${this.depotTitle}成功`);
          this.depotDialogVisible = false;
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
      this.detailIndex = index;
      this.detailForm = JSON.parse(JSON.stringify(row));
      this.selectChange(row.libraryAtt, { relateCode: 'libraryName' });
    },
    handlerSubmitDetail(row) {
      let isDuplication = false;
      if (this.detailTitle === '新增') {
        // 库位编码不能重复
        isDuplication = this.detailData.some(item => item.libraryCode === row.libraryCode);
        if (isDuplication) {
          this.$message.warning(this.$t('库位编码已存在'));
          return;
        }
        // 中文显示启用或禁用
        row.enabledMeaning = this.status[row.enabled];
        this.detailData.push(row);
      } else {
        // 库位编码不能重复, 但可以修改自身编码启用禁用
        isDuplication = this.detailData.some((item, index) => (item.libraryCode === row.libraryCode && index !== this.detailIndex));
        if (isDuplication) {
          this.$message.warning(this.$t('库位编码已存在'));
          return;
        }
        // 中文显示启用或禁用
        row.enabledMeaning = this.status[row.enabled];
        this.detailData[this.detailIndex] = row;
        this.detailData = [...this.detailData];
      }
      this.detailDialogVisible = false;
    },
    selectChange(val, info) {
      if (info.relateCode) {
        this.$http.post('common/combo/list', { type: val }).then(
          (res) => {
            res = res.data;
            this.detailItemInfo.forEach((item) => {
              if (item.code === info.relateCode) {
                item.options = res.list;
                item.optionProps = {
                  label: 'value',
                  value: 'value',
                };
              }
            });
          },
        ).catch();
      }
    },
  },
};
</script>

<style>
.depot-manage {}
</style>
