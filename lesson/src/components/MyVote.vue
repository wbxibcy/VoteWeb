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
  color: #409EFF;
  border-radius: 15px;
  margin-top: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px; /* 调整与其他内容的间距 */
}

.custom-button {
  border: 2px solid white;
  background-color: transparent;
  color: white;
  font-weight: bold;
  border-radius: 4px; /* 可以根据需要调整 */
  margin: 20px; /* 增加按钮之间的间距 */
}


.chart-container-wrapper {
  display: flex;
  flex-direction: row; /* 横向排列 */
  flex-wrap: wrap; /* 换行 */
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.chart-container {
  width: 400px;
  height: 400px;
  margin: 10px;
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
    
    <div class="container">
      <div class="menu-extras">
      <p class="menu-text" style="color: #409EFF;font-weight: bold;">未完成投票</p>
    </div>
  <div class="button-container">
    <el-button
      class="rounded-rectangle custom-button"
      v-for="(vote, index) in votesToShow"
      :key="index"
      @click="goToOngoingVotes(vote.vote_id)"
    >
      {{ vote.vote_title }}
    </el-button>
    <el-button class="rounded-rectangle custom-button" @click="goToCreateVotes">创建投票</el-button>
  </div>
  <p class="menu-text" style="color: #409EFF; font-weight: bold;">已完成投票</p>
  <div class="chart-container-wrapper">
    <div v-for="(vote, index) in closedvotes" :key="index" :ref="el => chartRefs[index] = el" class="chart-container"></div>
  </div>
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
const userId = route.query.user_id;
const votes = ref([]); // Array to store ongoing vote objects
const closedvotes = ref([]); // Array to store closed vote objects
const chartRefs = ref([]); // Array to store chart refs

onMounted(() => {
  fetchTitlesAndVoteId();
});

const handleSelect = (index) => {
  activeIndex.value = index;
  router.push({ name: index, query: { user_id: userId } });
};

const goToCreateVotes = () => {
  router.push({ name: 'createvote', query: { user_id: userId } });
};

const goToOngoingVotes = (voteId) => {
  router.push({ name: 'ongoingvote', query: { user_id: userId, vote_id: voteId } });
};

const fetchTitlesAndVoteId = () => {
  axios.get(`http://localhost:3000/votes/user/${userId}`, {
    params: {
      fields: 'vote_title,vote_id,status', // Fetching vote_title, vote_id, and status
    }
  })
  .then(response => {
    // Separate ongoing and closed votes
    votes.value = response.data.filter(vote => vote.status !== 'closed').slice(0, 4);
    closedvotes.value = response.data.filter(vote => vote.status === 'closed').slice(0, 3);

    // Initialize chart refs array
    chartRefs.value = new Array(closedvotes.value.length);
    
    // Fetch results and draw charts for closed votes
    closedvotes.value.forEach((vote, index) => {
      fetchResultsAndDrawChart(vote.vote_id, vote.vote_title, index);
    });
  })
  .catch(error => {
    console.error('Error fetching vote titles and vote id:', error);
  });
};

const fetchResultsAndDrawChart = (voteId, voteTitle, index) => {
  axios.get(`http://localhost:3000/results/export/${voteId}`)
    .then(response => {
      const results = response.data.results;
      drawChart(index, results, voteTitle, voteId);
    })
    .catch(error => {
      console.error('Error fetching vote results:', error);
    });
};

const drawChart = (index, data, voteTitle, voteId) => {
  if (chartRefs.value[index]) {
    const chartInstance = echarts.init(chartRefs.value[index]);
    chartInstance.setOption({
      title: {
        text: voteTitle,
        left: 'center',
        textStyle: {
          // Customize text style here
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        bottom: 0,
        data: ['投票数']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.option_title),
        axisLabel: {
          rotate: 45,
          interval: 0
        },
        axisLine: {
          lineStyle: {
            // Customize axis line style here
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            // Customize axis line style here
          }
        }
      },
      series: [{
        name: '投票数',
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          // Customize item style here
        },
        label: {
          show: true,
          position: 'top'
        }
      }]
    });

    // Add click event listener
    chartInstance.on('click', () => {
      router.push({
        name: 'finishedvote',
        query: {
          vote_id: voteId,
          user_id: userId.value
        }
      });
    });
  }
};

const votesToShow = computed(() => votes.value.slice(0, 4));
</script>