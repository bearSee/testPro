<template>
<el-dialog
  ref="tpicker"
  class="table-picker"
  :title="title"
  :visible.sync="dialogVisible"
  :before-close="handleClose"
  append-to-body
  :close-on-click-modal="false"
  :width="'70%'"
  top='1%'
  >
  <template v-if="mutiFlag && this.tableColumn.length">
    <zte-table
      class="muti-select-table"
      index-style="selection"
      :labelWidth="100"
      :search-info="searchInfo"
      :table-column="tableColumn"
      :request-url="requestUrl || '/lov/findDatas'"
      height="300px"
      :params="keyObj"
      :is-remenber="true"
      :checked-row.sync="selection"
      :page-size="5"
      :page-sizes="[5, 10, 50]"
      :total-size="10"
      :row-key="realKey">
      <!-- <list-table
        slot='picked'
        class="muti-list-table"
        height="298px"
        :table-column="tableColumn"
        :selected="selection"
        :row-key="realKey"
        @selectChange="selectChange"
      >
      </list-table> -->
    </zte-table>
  </template>
  <zte-table v-else-if="this.tableColumn.length"
    :labelWidth="100"
    :search-info="searchInfo"
    :table-column="tableColumn"
    :request-url="requestUrl || '/lov/findDatas'"
    :params='keyObj'
    :page-size="5"
    :page-sizes="[5, 10, 50]"
    :row-key="realKey"
    @row-select="handlerSelect"
    @dblclick="handlerPick">
  </zte-table>
  <span v-else></span>
  <span slot="footer" class="dialog-footer">
    <el-button size="mini" type="primary" @click="handleSubmit">{{ $t('提交') }}</el-button>
    <el-button size="mini" @click="closeDialog">{{ $t('取消') }}</el-button>
  </span>
</el-dialog>
</template>

<script>
import qs from 'qs';
import zteTable from './zte-table';
import listTable from './list-table';

export default {
  name: 'tablePicker',
  components: {
    listTable,
    zteTable,
  },
  props: {
    dialogVisible: {
      type: Boolean,
      required: true,
      default: false,
    },
    service: {
      type: String,
      default: 'base',
    },
    tableKey: {
      type: String,
      required: true, // 'boe.user.by.le_id'
    },
    rowKey: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    selected: {
      type: [String, Array],
    },
    isCache: {
      type: Boolean,
      default: true,
    },
    rowTrans: Array,
    params: {
      type: Object,
      default: () => null,
    },
    config: Object,
    requestUrl: String,
  },
  data() {
    return {
      mutiFlag: false,
      searchInfo: [],
      tableColumn: [],
      tableData: [],
      cache: [],
      singleSelected: [],
      selection: [],
      autoSearch: false,
    };
  },
  computed: {
    keyObj() {
      let keyObj = { lovKey: this.tableKey };
      if (this.params) {
        keyObj = Object.assign(keyObj, this.params);
      }
      return keyObj;
    },
    realKey() {
      if (this.rowTrans) {
        for (let i = 0; i < this.rowTrans.length; i++) {
          if (this.rowTrans[i].to === this.rowKey) {
            return this.rowTrans[i].from;
          }
        }
      }
      return this.rowKey;
    },
  },
  watch: {
    // selected() {
    //   this.selection = this.initSelection();
    // },
  },
  methods: {
    /**
     * @augments
     * data 需要转换的数据
     * transRule 转换规则
     * ex: {
     *       to: 'code',
     *       from: 'USER_CODE',
     *     }
     * to2from 转换方向
     * 默认 true
     *  true  将data的transRule.to属性 装换为 transRule.from属性；
     */
    transferData(data, transRule) {
      let finalData = [];
      if (data.length) {
        if (transRule) {
          finalData = data.map((item) => {
            const newItem = JSON.parse(JSON.stringify(item));
            for (let i = 0; i < transRule.length; i++) {
              newItem[transRule[i].to] = item[transRule[i].from];
            }
            return newItem;
          });
        } else {
          finalData = data;
        }
      }
      return finalData;
    },
    async initSelection() {
      const finalData = [];
      if (this.selected) {
        if (this.mutiFlag) {
          const inData = this.selected.split(',');
          if (inData.length) {
            const obj = {
              page: 1,
              limit: 9999,
              lovKey: this.tableKey,
            };
            obj[this.realKey] = this.selected;
            await this.$http.post('/lov/findDatas', qs.stringify(obj)).then(
              (res) => {
                this.selection = res.data.page.list;
              }).catch(() => {});
          }
        } else {
          this.selection = finalData.push(this.selected);
        }
      }
      // return finalData;
    },
    handleClose() {
      this.$emit('update:dialogVisible', false);
    },
    handlerSelect(row) {
      this.singleSelected = [row];
    },
    handlerPick(row) {
      this.handlerSelect(row);
      this.handleSubmit();
    },
    handleSubmit() {
      if (this.mutiFlag) {
        this.$emit('selectChange', this.transferData(this.selection, this.rowTrans, false));
      } else {
        this.$emit('singleSelectChange', this.transferData(this.singleSelected, this.rowTrans, false));
      }
      this.closeDialog();
    },
    closeDialog() {
      this.$emit('update:dialogVisible', false);
    },
    // keyFunc(row) {
    //   let key = '';
    //   if (this.rowTrans && this.rowTrans.length) {
    //     for (let i = 0; i < this.rowTrans.length; i++) {
    //       key += row[this.rowTrans[i].from];
    //     }
    //   }
    //   return key;
    // },
    selectChange(index) {
      if (index || index === 0) {
        this.selection.splice(index, 1);
      } else {
        this.selection = [];
      }
    },
    setConfig(config) {
      this.searchInfo = config.query;
      this.tableColumn = config.field;
      this.mutiFlag = config.singleGrid !== 'Y';
      this.autoSearch = config.autoQuery === 'Y';
    },
  },
  async created() {
    if (!this.config) {
      await this.$http.get(`/lov/getLovConfig?lovKey=${this.tableKey}`).then(
        (res) => {
          res = res.data;
          this.setConfig(res);
        },
      ).catch(() => { });
    } else {
      this.setConfig(this.config);
    }
    // await this.initSelection();
  },
};
</script>

<style lang="scss">
</style>

