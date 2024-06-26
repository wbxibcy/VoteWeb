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


.login-form {
  width: 400px;
  background-color: white;
  padding: 32px;
  border-radius: 10px;
}
</style>

<template>
  <div class="wrapper">
    <div class="login-container">
      <el-form class="login-form" :model="loginForm" :rules="rules" label-width="80px" ref="loginFormRef">
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
          <el-button type="primary" @click="submitForm(loginFormRef)" style="width: 400px;">创建</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loginFormRef = ref(null);

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
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
  { pattern: /^[a-zA-Z0-9]{4,16}$/, message: '用户名必须为4到16位字母或数字', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' },
  { pattern: /^[A-Za-z\d]{6,20}$/, message: '密码必须为6到20位字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const submitForm = async (formRef) => {
  await formRef.validate(async (valid, fields) => {
    if (valid) {
      const response = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm.value),
      });

      if (response.ok) {
        console.log('注册成功!', loginForm.value);
        router.push({ name: 'login' });
      } else {
        const errorData = await response.json();
        console.log('注册失败:', errorData.message);
        ElMessage.error(errorData.message);
      }
    } else {
      console.log('表单验证失败:', fields);
    }
  });
};
</script>