<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/create.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-form {
  width: 400px;
  background-color: white;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
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
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="loginForm.confirmPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="goToCreate">创建</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('create')

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index })
};

const goToCreate = () => {
  router.push({ name: 'login' });
};

const loginForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
});


const validateConfirmPassword = (rule, value, callback) => {
  if (value !== loginForm.value.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const submitForm = async (formRef) => {
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!', loginForm.value);
      router.push({ name: 'login' });
    } else {
      console.log('error submit!', fields);
    }
  });
};
</script>