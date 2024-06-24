<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/myvote.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-menu {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 24px;
  padding-right: 24px;
  color: #274C5B;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-title {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 45px;
  margin-right: 10px;
}

.flex-grow {
  flex-grow: 1;
}

</style>

<template>
  <div class="wrapper">
<el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" :ellipsis="false" @select="handleSelect">
    <div class="logo-title">
      <img src="../assets/logo.png" alt="Logo" class="logo" />
    </div>
    <div class="flex-grow" />
    <el-menu-item index="home" style="color: #409EFF;font-weight: bold;">返回首页</el-menu-item>
  </el-menu>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue';

const router = useRouter()
const activeIndex = ref('ongoingvote')

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index })
}
</script>