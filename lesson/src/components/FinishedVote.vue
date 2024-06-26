<style>
body {
  margin: 0;
  padding: 0;
  height: 100vh; /* 占满整个视口高度 */
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

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  /* 使内容可垂直滚动 */
  padding-top: 100px;
  /* 确保内容不被顶部菜单遮挡 */
}


.vote-details h1 {
  font-size: 32px;
  color: #409EFF;
}

.vote-details p {
  font-size: 18px;
  font-weight: bold;
  color: whitesmoke;
}

.vote-details ul {
  list-style: none;
  padding: 0;
}

.vote-details li {
  font-size: 20px;
  margin: 10px 0;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  /* 间距 */
}

.cb-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  /* 添加内边距 */
}

.b-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: auto;
}
</style>

<template>
    <el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" :ellipsis="false" @select="handleSelect">
      <div class="logo-title">
        <img src="../assets/logo.png" alt="Logo" class="logo" />
      </div>
      <div class="flex-grow" />
      <el-menu-item index="home" style="color: #409EFF;font-weight: bold;">返回首页</el-menu-item>
    </el-menu>

    <div class="scrollable-content">  
  <div class="cb-container">
    <div class="vote-details" v-if="voteData">
        <h1>投票名称为{{ voteData.vote.vote_title }}</h1>
        <p>投票描述为{{ voteData.vote.vote_description }}</p>
        <p>投票状态为{{ voteData.vote.status }}</p>
        <p>投票开始时间为{{ voteData.vote.start_time }}</p>
        <p>投票结束时间为{{ voteData.vote.end_time }}</p>
      </div>
    <div class="b-container">
      <div style="width: 80%;">
        <el-table :data="optionData">
          <el-table-column prop="option_title" label="投票选项"></el-table-column>
        </el-table>
      </div>
      <div style="width: 80%;">
        <el-table :data="resultData">
          <el-table-column prop="count" label="投票数量"></el-table-column>
        </el-table>
      </div>
    </div>

    <div class="charts-container">
      <div ref="bar" style="width: 450px; height: 450px;"></div>
      <div ref="line" style="width: 450px; height: 450px;"></div>
      <div ref="pie" style="width: 450px; height: 450px;"></div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();
const voteId = ref(route.query.vote_id);
const userId = route.query.user_id;

const voteData = ref(null);
const optionData = ref([]);
const resultData = ref([]);
const activeIndex = ref('finishedvote')


const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index, query: { user_id: userId } })
}

const fetchVoteData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/votes/id/${voteId.value}`);
    if (response.status === 200) {
      voteData.value = response.data;
      optionData.value = response.data.options.map(option => ({
        option_id: option.option_id,
        option_title: option.option_title
      }));
      // formData.value.vote_title = data.vote_title;
      // formData.value.vote_status = data.status;
      // formData.value.start_time = data.start_time; // 不进行额外的格式化
      // formData.value.end_time = data.end_time; // 不进行额外的格式化
      // formData.value.vote_description = data.vote_description;
      await fetchResultsData(response.data.vote.vote_id);
    } else {
      throw new Error(`获取投票内容失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const fetchResultsData = async (voteId) => {
  try {
    const resultsResponse = await axios.get(`http://localhost:3000/results/${voteId}`);
    if (resultsResponse.status === 200) {
      resultData.value = resultsResponse.data.map(result => ({
        option_id: result.option_id,
        count: result.count
      }));
      console.log('成功获取投票结果数据:', resultData.value);
    } else {
      throw new Error(`获取投票结果失败: 状态码 ${resultsResponse.status}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const bar = ref(null);
const line = ref(null);
const pie = ref(null);

const createChart = (el, type) => {
  const chart = echarts.init(el);
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}: ${params.value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: optionData.value.map(option => option.option_title),
      axisLabel: {
        formatter: (value) => {
          if (value.length > 10) {
            return value.slice(0, 10) + '...';
          }
          return value;
        },
        tooltip: {
          show: true,
          formatter: (params) => params.value
        }
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: type,
      data: resultData.value.map(result => result.count)
    }]
  });
  return chart;
};

const createPieChart = (el) => {
  const chart = echarts.init(el);
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}: ${params.value}`;
      }
    },
    series: [{
      type: 'pie',
      data: resultData.value.map((result, index) => ({
        value: result.count,
        name: optionData.value[index].option_title
      }))
    }]
  });
  return chart;
};

onMounted(async () => {
  await fetchVoteData();

  // Create charts after data is fetched
  createChart(bar.value, 'bar');
  createChart(line.value, 'line');
  createPieChart(pie.value);

  // Initialize WebSocket
  initializeWebSocket();
});

// Watch optionData and resultData changes to update charts
watch([optionData, resultData], () => {
  createChart(bar.value, 'bar');
  createChart(line.value, 'line');
  createPieChart(pie.value);
});

const initializeWebSocket = () => {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onopen = () => {
    console.log('WebSocket 连接已建立');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.results) {
      fetchVoteData();
      console.log(resultData);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket 连接已关闭');
  };

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error);
  };
};
</script>
