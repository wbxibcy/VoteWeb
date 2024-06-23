<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/choose.png');
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
    
  
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('home')

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
</script>