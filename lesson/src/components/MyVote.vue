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
        <el-button-group>
          <el-button class="rounded-rectangle" v-for="(title, index) in titlesToShow" :key="index" @click="goToOngoingVotes">{{ title }}</el-button>
        </el-button-group>
       
        <el-button class="rounded-rectangle" type="primary" @click="goToCreateVotes">创建投票</el-button>
      </div>
      <p class="menu-text" style="color: #409EFF;font-weight: bold;">已完成投票</p>
      <div ref="chartRef" style="width: 400px; height: 400px; margin-top: 10px;"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();
const activeIndex = ref('myvote');
const chartRef = ref(null);
const userId = route.query.user_id;
const voteCode = ref('');
const titles = ref([]);

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

  fetchTitlesAndVoteId();
});

const handleSelect = (index) => {
  activeIndex.value = index;
  router.push({ name: index, query: { user_id: userId } });
};

const goToCreateVotes = () => {
  router.push({ name: 'createvote', query: { user_id: userId } });
};

const goToOngoingVotes = () => {
  router.push({ name: 'ongoingvote', params: { voteCode: voteCode.value }, query: { user_id: userId,voteCode: voteCode.value } });
};

const fetchTitlesAndVoteId = () => {
  axios.get(`http://localhost:3000/votes/user/${userId}`, {
    params: {
      fields: 'vote_title,vote_code,status', // Fetching vote_title, vote_code, and status
    }
  })
  .then(response => {
    // Filter out titles where status is not 'closed' and map to titles
    titles.value = response.data.filter(vote => vote.status !== 'closed').slice(0, 4).map(vote => vote.vote_title);
    // Find and set the first vote_code that is not 'closed'
    const firstVote = response.data.find(vote => vote.status !== 'closed');
    if (firstVote) {
      voteCode.value = firstVote.vote_code;
    }
  })
  .catch(error => {
    console.error('Error fetching vote titles and vote code:', error);
  });
};

// Computed property to limit titles to show
const titlesToShow = computed(() => titles.value.slice(0, 4));
</script>
