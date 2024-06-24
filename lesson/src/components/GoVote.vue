<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/govote.png');
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

.govote-wrapper {
  padding: 20px;
}

.vote-details {
  text-align: center;
}

.vote-details h1 {
  font-size: 32px;
  color: #409EFF;
}

.vote-details p {
  font-size: 18px;
  color: #333;
}

.vote-details ul {
  list-style: none;
  padding: 0;
}

.vote-details li {
  font-size: 20px;
  margin: 10px 0;
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
    <div class="govote-wrapper">
    <div class="vote-details" v-if="voteData">
      <h1>{{ voteData.vote.vote_title }}</h1>
      <p>{{ voteData.vote.vote_description }}</p>
      <ul>
        <li v-for="option in voteData.options" :key="option.option_id">
          <el-checkbox v-model="selectedOptions" :label="option.option_id">{{ option.option_title }}</el-checkbox>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>正在加载投票内容...</p>
    </div>
    <el-button type="primary" @click="submitVotes" style="width: 400px;">确定</el-button>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('myvote')

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index })
}

const route = useRoute();
const voteData = ref(null);

const fetchVoteData = async () => {
  try {
    console.log(`http://localhost:3000/votes/code/${route.params.voteCode}`)
    const response = await axios.get(`http://localhost:3000/votes/code/${route.params.voteCode}`);
    if (response.status === 200) {
      voteData.value = response.data;
    }
  } catch (error) {
    console.error('获取投票内容失败:', error.message);
  }
};

onMounted(() => {
  fetchVoteData();
});
</script>
