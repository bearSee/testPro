<template>
    <div class="personal-info">
      <el-tabs v-model="tabs.activeName">
        <el-tab-pane :label="$t(tabs.tabsText[0])" name="info" stretch='true'>
        <zte-form
            ref="searchBlock"
            size="mini"
            :form='personalForm'
            :item-info="personal"
            :leftLabel='true'
            :isCancel="false"
            @submit="handlerChangeInfo"
        >
        </zte-form>
        </el-tab-pane>
        <el-tab-pane :label="$t(tabs.tabsText[1])" name="password">
        <zte-form
            ref="searchBlock"
            size="mini"
            :label-width="150"
            :leftLabel='true'
            :form='passwordForm'
            :item-info="password"
            @submit="changePwd"
        >
        </zte-form>
        </el-tab-pane>
      </el-tabs>
    </div>
</template>

<script type="text/javascript">
import zteForm from '../../modules/zte-form';

export default {
  name: 'personal-info',
  components: {
    zteForm,
  },
  data() {
    return {
      // 标题
      tabs: {
        activeName: 'info',
        tabsText: ['个人信息', '修改密码'],
      },
      personalForm: {},
      personal: [
        {
          code: 'employeeName',
          label: '姓名',
          type: 'text',
          disabled: true,
        },
        {
          code: 'employeeNumber',
          label: '工号',
          type: 'text',
          disabled: true,
        },
        {
          code: 'deptName',
          label: '组织',
          type: 'text',
          disabled: true,
        },
        {
          code: 'phone',
          label: '电话',
          type: 'text',
        },
        {
          code: 'emailAddress',
          label: '邮箱',
          type: 'text',
        },
        {
          code: 'mobilePhone',
          label: '手机号码',
          type: 'text',
        }],
      password: [
        {
          code: 'oldPwd',
          label: '旧密码',
          type: 'password',
          required: true,
        },
        {
          code: 'newPwd',
          label: '新密码',
          type: 'password',
          required: true,
        },
        {
          code: 'confirmPwd',
          label: '确认密码',
          type: 'password',
          required: true,
        },
      ],
      passwordForm: {},
    };
  },
  mounted() {
    if (this.searchConfig) {
      const count = this.searchConfig.length % 2 === 0 ? (this.searchConfig.length / 2) + 1 : this.searchConfig.length / 2;
      this.$refs.searchBlock.defaultRow = Math.ceil(count);
    }
    this.getUserinfo();
  },
  methods: {
    addRow(route) {
      this.$router.push(route);
    },
    getUserinfo() {
      this.$http.post('/personal/info').then(
        (res) => {
          this.personalForm = res.data;
        });
    },
    changePwd(form) {
      this.$http.post('/personal/updatePwd', form).then(
        () => {
          this.passwordForm = {};
        });
    },
    handlerChangeInfo(form) {
      this.$http.post('/personal/update', form).then(
        () => {
          this.getUserinfo();
        });
    },
  },
};
</script>
<style>
  .personal-info {
    background: #fff;
  }
  .personal-info .button-list{
    margin-top: 20px;
  }
  .personal-info .el-form-item__content{
    text-align: left!important;
  }
  .el-tabs {
    background-color: white;
    padding: 30px 30px 0 30px;
  }
  .personal-info .el-form {
    width: 35%;
    margin-top: 20px;
  }
</style>
