<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 150px;
}

.register-link {
  cursor: pointer;
  color: #409EFF;
  text-align: right;
  margin-bottom: 10px;
}

.login-form {
  width: 400px;
  background-color: white;
  padding: 32px;
  border-radius: 10px;
}

.el-form-item {
  text-align: right;
  width: 100%;
}
</style>

<template>
  <div class="wrapper">
    <div class="login-container">
      <img src="@/assets/logo.png" alt="Logo"
        style="width: 100px; margin-bottom: 10px; display: flex;align-items: flex-end; padding-right: 150px; ">
      <el-form class="login-form" :model="loginForm" :rules="rules" label-width="80px" ref="loginFormRef">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <p @click="goToCreate" class="register-link">没有账号？注册</p>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(loginFormRef)" style="width: 400px;">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

export default {
  setup() {
    const router = useRouter();
    const loginFormRef = ref(null);

    const loginForm = ref({
      username: '',
      password: ''
    });

    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    };

    const submitForm = async (formRef) => {
      await formRef.validate(async (valid, fields) => {
        if (valid) {
          try {
            const response = await axios.post('http://localhost:3000/users/login', {
              username: loginForm.value.username,
              password: loginForm.value.password
            });

            if (response.data.user_id && response.data.token) {
              console.log('登录成功，用户信息：', response.data);
              // Store token securely, e.g., in localStorage
              localStorage.setItem('token', response.data.token);

              // Navigate to home page with user_id and token as query parameters
              router.push({ name: 'home', query: { user_id: response.data.user_id, token: response.data.token } });
            } else {
              console.error('登录失败，账号或密码错误');
              ElMessageBox.alert('账号或密码错误，请重新输入', '登录失败', {
                confirmButtonText: '确定',
                type: 'error'
              });
            }
          } catch (error) {
            console.error('登录请求出错:', error);
            ElMessageBox.alert('账号或密码错误，请重新输入', '登录失败', {
              confirmButtonText: '确定',
              type: 'error'
            });
          }
        } else {
          console.log('表单验证未通过', fields);
        }
      });
    };

    const goToCreate = () => {
      router.push({ name: 'create' });
    };

    return {
      loginFormRef,
      loginForm,
      rules,
      submitForm,
      goToCreate
    };
  }
};
</script>