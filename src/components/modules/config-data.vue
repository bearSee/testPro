<template>
  <div class="config-data">
    <zte-table
      ref="talbe"
      :request-url="requestUrl + '/page'"
      :search-info="searchInfo"
      :table-column="tableColumn"
      :button-list="buttonList"
      :params="params"
      @add-row="handlerAdd"
      @delete-row="handlerDelete"
      @edit-row="handlerEdit"
      @switch-status="handlerSwitch">
      <template
        v-for="col of tableColumn"
        v-if="col.temp"
        :slot="col.code"
        slot-scope="{ row, column }">
        <slot
          :name="col.code"
          :row="row"
          :column="column">
        </slot>
      </template>
    </zte-table>

    <el-dialog
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :title="title"
      :visible.sync="dialogVisible">
      <zte-form
        :row-size="3"
        :is-language="isLanguage"
        :item-info="itemInfo"
        :form="form"
        :cancel-text="$t('关闭')"
        @submit="handlerSubmit"
        @reset="dialogVisible = false">
      </zte-form>
    </el-dialog>
  </div>
</template>

<script>
import zteTable from './zte-table';
import zteForm from './zte-form';

export default {
  name: 'configData',
  components: { zteTable, zteForm },
  props: {
    requestUrl: {
      type: String,
      required: true,
    },
    searchInfo: Array,
    tableColumn: Array,
    buttonList: {
      type: Object,
      default: () => ({ add: true, del: true, edit: true, enable: true, disable: true }),
    },
    itemInfo: Array,
    title: String,
    params: Object,
  },
  data() {
    return {
      dialogVisible: false,
      form: {},
    };
  },
  computed: {
    isLanguage() {
      const isLanguage = this.itemInfo.some(item => item.lang);
      return isLanguage;
    },
  },
  methods: {
    getTableData() {
      this.$refs.talbe.getTableData();
    },
    handlerAdd() {
      this.form = {};
      this.itemInfo.forEach((item) => {
        if (item.value) {
          this.form[item.code] = item.value;
        }
      });
      this.dialogVisible = true;
    },
    handlerEdit(row) {
      this.$http.get(`${this.requestUrl}/${row.id}`).then(
        (res) => {
          res = res.data;
          this.form = res.data;
          this.dialogVisible = true;
        },
      ).catch();
    },
    handlerDelete(rows) {
      this.$http.delete(this.requestUrl, { data: rows.map(row => row.id) }).then(
        (res) => {
          res = res.data;
          if (res.code === 0) {
            this.$message.success(this.$t('删除成功'));
            this.getTableData();
          }
        },
      ).catch();
    },
    handlerSwitch(rows, type) {
      this.$http.put(`${this.requestUrl}/${type}`, rows.map(row => row.id)).then(
        () => {
          this.$message.success(this.$t('状态修改成功'));
          this.getTableData();
        },
      ).catch();
    },
    handlerSubmit(form) {
      const requestType = form.id ? 'put' : 'post';
      this.$http[requestType](this.requestUrl, form).then(
        () => {
          this.$message.success(this.$t('保存成功'));
          this.dialogVisible = false;
          this.getTableData();
        },
      ).catch();
    },
  },
};
</script>

<style lang="scss">
.config-data {}
</style>
