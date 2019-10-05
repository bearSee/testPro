<template>
  <!-- <div class="login" :style="{ 'background-image': 'url(' + this.cdn+'/login-back.jpg)' }"> -->
  <div class="login">
    <img class="logo" :src="cdn+'/login-text-log.png'">
    <img :src="cdn+'/login-back-img.png'"
          class="mobile-fallback"
          alt="">
    <div class="login-pad">
      <img :src="cdn+'/login-logo.png'">
      <div class="login-form">
        <el-form  :model="ruleForm"
                  :rules="rules"
                  ref="ruleForm"
                  label-width="0px"
                  class="demo-ruleForm" >
          <el-form-item class="item-line" prop="username">
            <span :class="{ 'is-cn': isCn }">{{ $t('帐号') }}</span>
            <input
                  class="el-input__inner"
                  type="text"
                  :placeholder="$t('帐号')"
                  v-model="ruleForm.username"
                  auto-complete="off"
                  @keyup.enter="submitForm('ruleForm')">
          </el-form-item>
          <el-form-item class="item-line" prop="password">
            <span :class="{ 'is-cn': isCn }">{{ $t('密码') }}</span>
            <input
              class="el-input__inner"
              type="password"
              :placeholder="$t('密码')"
              v-model="ruleForm.password"
              auto-complete="off"
              @keyup.enter="submitForm('ruleForm')">
          </el-form-item>
          <el-form-item>
            <span :class="{ 'is-cn': isCn }">{{ $t('语言') }}</span>
            <el-select class="master-lang" v-model="lang" >
              <el-option v-for='lang in langs' :key="lang.value" :label="lang.label" :value="lang.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-top: 40px">
            <el-button type="primary"
                      :loading="submitLoading"
                      @click="submitForm('ruleForm')">{{ $t('登录') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
// import qs from 'qs';
import { mapMutations } from 'vuex';
import i18n from '../../mixins/i18n';

export default {
  name: 'login',
  mixins: [i18n],
  data() {
    return {
      cdn: `${window.location.protocol}//${window.location.host}/image`,
      root: `${window.location.protocol}//${window.location.host}/`,
      lang: this.$i18n.locale,
      ruleForm: {
        username: '',
        password: '',
      },
      rules: {
        // username: [
        //   { required: true, message: '请输入账户名称', trigger: 'blur,change' },
        // ],
        // password: [
        //   { required: true, message: '请输入密码', trigger: 'blur,change' },
        // ],
        // validateCode: [
        //   { required: true, message: '请输入验证码', trigger: 'blur' },
        //   { min: 4, max: 4, message: '验证码长度为 4 个字符', trigger: 'blur' },
        // ],
      },
      submitLoading: false,
      validateCode: false,
    };
  },
  computed: {
    isCn() {
      return this.lang === 'zh-CN';
    },
  },
  watch: {
    lang() {
      this.toSwitchLanguage(this.lang);
    },
  },
  methods: {
    ...mapMutations([
      'setLogin',
      'setUser',
    ]),
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.submitLoading = true;
          await this.loginAction();
        }
      });
    },
    async loginAction() {
      // qs.stringify(params)
      const params = Object.assign({}, this.ruleForm, { language: this.lang });
      // this.$router.push('/index');
      await this.$http.post('init/login', params).then(
        ({ data }) => {
          const user = data && data.user || {};
          window.localStorage.setItem('Authorization', data.Authorization);
          window.localStorage.setItem('userInfo', JSON.stringify(user));
          window.localStorage.setItem('groupId', user.groupId);
          window.localStorage.setItem('employeeNumber', user.employeeNumber);
          window.localStorage.setItem('userName', user.employeeName);
          this.setLogin();
          this.$router.push('/index');
          this.submitLoading = false;
        },
        () => {
          this.submitLoading = false;
        },
      );
    },
  },
  mounted() {
    this.toSwitchLanguage(this.lang);
  },
};
</script>


<style lang="scss">
@import "../../assets/scss/theme.scss";
$font: #999;

.login{
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  text-align: center;
  background-image: radial-gradient(circle, #0086d1, #0068b6);
  // background-color: #006ebc;
  // background-size: cover;
  // background-repeat: no-repeat;
  .mobile-fallback{
    height: 480px;
    width: 479px;
    position:absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10%;
  }
  .logo {
    position:absolute;
    top: 35px;
    left: 35px;
  }
  .login-pad{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10%;
    z-index: 1;
    width: 400px;
    height: 450px;
    display: flex;
    flex-direction: column;
    background-color: #006596;
    border-radius: 5px;

    .login-form{
      padding: 30px 57px;
      background-color: #fff;
      .demo-ruleForm{
        .el-form-item__content{
          display: flex;
          flex-direction: row;
          border-bottom: #f1f1f1 solid 1px;
          span{
            min-width: 5em;
            text-align: left;
            color: $font;
            font-weight: bold;
          }
          span.is-cn{
            min-width: 3em;
            text-align: left;
            color: $font;
            font-weight: bold;
          }
          input {
            border-width: 0px;
            height: 40px;
            font-weight: lighter;
          }
        }

        & .el-form-item {
          .el-form-item__content{
            .el-button{
              width:100%;
              height: 40px;
              font-size: 18px;
              span{
                color: #fff;
              }
            }
          }
        }
      }
    }
  }
}
</style>
