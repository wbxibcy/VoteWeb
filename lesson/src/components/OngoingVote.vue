<style scoped>
.el-menu {
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 24px;
  padding-right: 24px;
  color: #274C5B;
  position: fixed;
  /* 设置菜单固定定位 */
  top: 0;
  /* 距离页面顶部的距离为 0 */
  left: 0;
  /* 距离页面左侧的距离为 0 */
  width: 100%;
  /* 宽度占满整个页面 */
  z-index: 1000;
  /* 确保菜单在其他内容之上 */
  background-color: rgba(255, 255, 255, 0.9);
  /* 背景颜色 */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  /* 添加阴影效果 */
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
<el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" :ellipsis="false" @select="handleSelect">
    <div class="logo-title">
      <img src="../assets/logo.png" alt="Logo" class="logo" />
    </div>
    <div class="flex-grow" />
    <el-menu-item index="home" :style="{ color: '#274C5B' }">返回首页</el-menu-item>
  </el-menu>
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