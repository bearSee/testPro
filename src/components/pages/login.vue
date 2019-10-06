<template>
  <div class="login">
    <el-form :model="ruleForm" status-icon ref="ruleForm" label-width="100px" class="login-form">

      <el-form-item label="账号" prop="username">
        <el-input type="text" v-model="ruleForm.username" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="ruleForm.password" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item class="btn-group">
        <el-button type="primary" size="small" :loading="loading" @click="submitForm">登 陆</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script type="text/javascript">
import qs from 'qs';

export default {
  name: 'login',
  data() {
    return {
      ruleForm: {
        username: '',
        password: '',
      },
      loading: false,
    };
  },
  methods: {
    submitForm() {
      this.$http.post('init/login', qs.parse(this.ruleForm)).then(
        ({ data }) => {
          window.localStorage.setItem('Authorization', data.Authorization);
          this.$router.push('index');
        },
        () => {},
      );
    },
  },
};
</script>

<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  padding: 20px;
  position: relative;
  .login-form {
    width: 40%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .btn-group {
      text-align: center;
    }
  }
}
</style>
