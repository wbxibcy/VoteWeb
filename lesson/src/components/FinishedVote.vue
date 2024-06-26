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
}

.b-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: auto;
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

    <div class="cb-container">
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
        <div ref="bar" style="width: 500px; height: 400px;"></div>
        <div ref="line" style="width: 500px; height: 400px;"></div>
        <div ref="pie" style="width: 500px; height: 400px;"></div>
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
  router.push({ name: index , query: { user_id: userId }})
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
});

// Watch optionData and resultData changes to update charts
watch([optionData, resultData], () => {
  createChart(bar.value, 'bar');
  createChart(line.value, 'line');
  createPieChart(pie.value);
});
</script>