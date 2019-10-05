<template>
  <zte-form
    class="zte-form-lang"
    :item-info="langItemInfo"
    :form="form"
    :rules="rules"
    :row-size="rowSize"
    :label-width="labelWidth"
    :submit-text="submitText"
    :cancel-text="cancelText"
    :is-submit="isSubmit"
    :is-cancel="isCancel"
    @submit="handlerSubmit"
    @reset="handlerReset">
    <template v-for="(value, key) of $slots" :slot="key">
      <slot :name="key"></slot>
    </template>
  </zte-form>
</template>

<script>
import zteForm from './zte-form';
import i18n from '../../mixins/i18n';

export default {
  name: 'zteFormLang',
  components: { zteForm },
  mixins: [i18n],
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
    labelWidth: {
      type: Number,
      default: 100,
    },
    isSubmit: {
      type: Boolean,
      default: true,
    },
    isCancel: {
      type: Boolean,
      default: true,
    },
    submitText: {
      type: String,
      default: '',
    },
    cancelText: {
      type: String,
      default: '',
    },
    localRequire: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      langItemInfo: [],
    };
  },
  created() {
    this.langItemInfo = this.initItemInfo(this.itemInfo);
  },
  watch: {
    itemInfo(val) {
      this.langItemInfo = this.initItemInfo(val);
    },
  },
  methods: {
    initItemInfo(itemInfo) {
      const result = [];
      itemInfo.forEach((info) => {
        if (info.lang) {
          result.push(...this.langs.map(lang => ({
            ...info,
            code: `${info.code}_${lang.suffix}`,
            label: `${info.label}(${lang.label})`,
            required: (this.localRequire && lang.value !== this.$i18n.locale) ? false : info.required,
          })));
        } else {
          result.push(info);
        }
      });
      return result;
    },
    handlerSubmit(form) {
      const result = {
        lang: [],
      };
      this.langs.forEach((lang) => {
        const obj = {
          lang: lang.value,
        };
        this.itemInfo.forEach((info) => {
          if (!info.lang) {
            result[info.code] = form[info.code];
          } else {
            obj[info.code] = form[`${info.code}_${lang.value}`];
          }
        });
        result.lang.push(obj);
      });
      this.$emit('submit', result);
    },
    handlerReset() {
      this.$emit('reset');
    },
  },
};
</script>

<style lang="scss">
.zte-form-lang {}
</style>
