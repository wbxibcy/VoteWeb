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

.rounded-rectangle {
  width: 200px;
  height: 100px;
  background-color: #409EFF;
  border-radius: 15px;
  margin-top: 20px;
}

.container {
  display: flex;
  justify-content: space-between;
  /* Adjust this property as needed */
  margin-top: 20px;
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
    <div class="menu-extras">
      <p class="menu-text" style="color: #409EFF;font-weight: bold;">未完成投票</p>
      <div class="container">
        <div class="rounded-rectangle">

        </div>
        <div class="rounded-rectangle">

        </div>
        <div class="rounded-rectangle">

        </div>
       
        <el-button class="rounded-rectangle" type="primary" @click="goToCreateVotes">创建投票</el-button>
      </div>
      <p class="menu-text" style="color: #409EFF;font-weight: bold;">已完成投票</p>
      <div ref="chartRef" style="width: 400px; height: 400px; margin-top: 10px;"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue'
import * as echarts from 'echarts'
import { onMounted } from "vue";

const router = useRouter()
const activeIndex = ref('myvote')
const route = useRoute();
const userId = route.query.user_id;

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index })
}


const chartRef = ref(null)

onMounted(() => {
  echarts.init(chartRef.value).setOption({
    xAxis: {
      type: 'category',
      data: ['A', 'B', 'C']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'line',
        data: [120, 200, 150],
      }
    ]
  });
});

const goToCreateVotes = () => {
  router.push({ name: 'createvote', query: { user_id: userId } });
};
</script>