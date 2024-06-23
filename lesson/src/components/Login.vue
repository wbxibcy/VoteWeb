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
          <el-form class="login-form" ref="loginFormRef" :model="loginForm" :rules="rules" label-width="80px">
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
                  <el-button type="primary" @click="goToHome" style="width: 400px;">登录</el-button>
              </el-form-item>
          </el-form>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('login')

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index })
};

const goToCreate = () => {
  router.push({ name: 'create' });
};

const goToHome = () => {
  router.push({ name: 'home' });
};

const loginForm = ref({
  username: '',
  password: ''
});

const loginFormRef = ref(null);

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const submitForm = async (formRef) => {
  await formRef.value.validate((valid, fields) => {
      if (valid) {
          console.log('submit!', loginForm.value);
      } else {
          console.log('error submit!', fields);
      }
  });
};
</script>
