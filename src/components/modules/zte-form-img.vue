<template>
  <div class="zte-form-img">
    <el-form
      :model="currentForm"
      :rules="currentRules"
      ref="ruleForm"
      label-width="100px">
      <table>
        <tr v-for="col of columnSize" :key="col">
          <td
            v-for="row of rowSize"
            :key="row"
            :style="'width: ' + widthPercent + '%;'"
            :rowspan="itemInfo[(col - 1) * rowSize + (row - 1)].rowspan"
            :colspan="itemInfo[(col - 1) * rowSize + (row - 1)].colspan"
            v-if="itemInfo[(col - 1) * rowSize + (row - 1)]">
            <template v-if="(col - 1) * rowSize + (row - 1) < itemInfo.length">
              <el-form-item
                class="button-list"
                v-if="itemInfo[(col - 1) * rowSize + (row - 1)].code === 'btnSlot'">
                <el-button type="primary" @click.native="submitForm">确认</el-button>
                <el-button @click.native="resetForm">重置</el-button>
              </el-form-item>
              <el-form-item
                :class="itemInfo[(col - 1) * rowSize + (row - 1)].code"
                :label="$t(itemInfo[(col - 1) * rowSize + (row - 1)].label)"
                :prop="itemInfo[(col - 1) * rowSize + (row - 1)].code"
                v-else>
                <zte-item
                  :props="itemInfo[(col - 1) * rowSize + (row - 1)]"
                  v-model="currentForm[itemInfo[(col - 1) * rowSize + (row - 1)].code]">
                </zte-item>
              </el-form-item>
            </template>
          </td>
        </tr>
      </table>
      <!-- 隐藏域input解决浏览器默认提交bug -->
      <input type="text" style="display: none" v-if="itemInfo.length === 1">
    </el-form>
  </div>
</template>

<script>
import zteItem from './zte-item';

export default {
  name: 'zteFormImg',
  components: { zteItem },
  props: {
    itemInfo: {
      type: Array,
      default: () => ([]),
    },
    form: {
      type: Object,
      default: () => ({}),
    },
    rules: {
      type: Object,
      default: () => ({}),
    },
    rowSize: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    widthPercent() {
      return (100 / this.rowSize).toFixed(2);
    },
    columnSize() {
      const columnSize = Math.ceil(this.itemInfo.length / this.rowSize);
      return columnSize;
    },
  },
  data() {
    return {
      currentRules: {},
      currentForm: {},
    };
  },
  created() {
    this.initSelectOptions();
    this.initRules();
    this.initForm();
    this.initItemInfo();
  },
  watch: {
    form() {
      this.initForm();
    },
  },
  methods: {
    initItemInfo() {
      const index = this.itemInfo.findIndex(info => info.type === 'image');
      const rowspan = this.itemInfo[index].rowspan;
      for (let i = rowspan; i > 1; i--) {
        this.itemInfo.splice(index + i, 0, null);
      }
      const columnSize = Math.ceil((this.itemInfo.length + 1) / this.rowSize);
      this.itemInfo.push({
        code: 'btnSlot',
        colspan: columnSize * this.rowSize - this.itemInfo.length,
      });
    },
    initSelectOptions() {
      for (const info of this.itemInfo) {
        if (info && info.type === 'select' && info.params) {
          const ajax = info.ajax || 'dirctionary.ajax';
          this.$http.post(ajax, info.params).then(
            (res) => {
              res = res.data;
              this.$set(info, 'options', res);
            },
          ).catch(
            () => {
              this.$set(info, 'options', []);
            },
          );
        }
      }
    },
    initRules() {
      const rules = {};
      this.itemInfo.forEach((info) => {
        const rule = this.rules[info.code] || [];
        if (info.required) {
          rule.push({
            type: 'string',
            required: true,
            message: $t('请输入')+$t(info.label),
            trigger: ['blur', 'change'],
          });
        }
        if (rule.length) {
          rules[info.code] = rule;
        }
      });
      this.currentRules = rules;
    },
    initForm() {
      const form = {};
      this.itemInfo.forEach((info) => {
        form[info.code] = '';
      });
      this.currentForm = Object.assign({}, form, this.form);
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$emit('submit', this.form);
        } else {
          return false;
        }
        return true;
      });
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate();
      });
    },
  },
};
</script>

<style lang="scss">
.zte-form-img {
  .el-form-item {
    margin: 0;
    min-width: 350px;


    &.image .el-form-item__content {
      line-height: 1;
    }
  }
  .button-list {
    .el-form-item__content {
      text-align: right;
    }
  }
}
</style>
