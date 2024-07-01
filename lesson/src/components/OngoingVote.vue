<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100vh; /* 确保背景覆盖整个视窗高度 */
  background-image: url('@/assets/myvote.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: start;
  overflow: hidden; /* 确保背景不滚动 */
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
  position: relative;
  width: 90%;
  height: calc(100vh - 60px); 
  overflow-y: auto;
  padding: 20px;
}

.table {
  margin-top: 5px;
  width: 100%;
  display: flex;
  justify-content: start;
}

.el-button[disabled] {
  background-color: #ccc !important;
  color: #999 !important;
  cursor: not-allowed;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.cb-container {
  display: flex;
  flex-direction: column;
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
  <div class="wrapper">
    <div class="scrollable-content">
      <div class="cb-container">
        <div class="vote-details" v-if="voteData">
          <h1>{{ voteData.vote.vote_title }}</h1>
          <p>{{ voteData.vote.vote_description }}</p>
          <p>投票码： {{ voteData.vote.vote_code }}</p>
          <p>投票开始时间：{{ new Date(voteData.vote.start_time).toLocaleString() }}</p>
          <p>投票结束时间：{{ new Date(voteData.vote.end_time).toLocaleString() }}</p>
          <el-button v-if="canEdit === 1" @click="startEditing" type="primary" style="font-weight: bold;">
            编辑
          </el-button>
          <el-button v-else disabled type="primary" style="font-weight: bold;">
            编辑
          </el-button>
          <el-button @click="exportVoteData" style="font-weight: bold; background-color: #67C23A; color: white;">
            导出</el-button>
          <el-button v-if="canEdit === 1" @click="endVote"
            style="font-weight: bold; background-color: red; color: white;">提前结束</el-button>
          <el-button v-else disabled style="font-weight: bold; background-color: red; color: white;">提前结束</el-button>
          <div v-if="isEditing" style="color: #409EFF; font-weight: bold;">
            <label>
              投票名称:
              <input v-model="editVoteData.vote_title" />
            </label>
            <label>
              投票开始时间:
              <input v-model="editVoteData.start_time" type="datetime-local" />
            </label>
            <label>
              投票结束时间:
              <input v-model="editVoteData.end_time" type="datetime-local" />
            </label>
            <el-button @click="submitEdit"
              style="font-weight: bold; background-color: #409EFF; color: white;">确定</el-button>
            <el-button @click="cancelEdit"
              style="font-weight: bold; color: #409EFF; background-color: white;">取消</el-button>
          </div>
        </div>
        <el-table v-if="voteData" :data="voteData.options" style="width: 100%;">
          <el-table-column prop="option_title" label="投票选项" width="500"></el-table-column>
          <el-table-column prop="count" label="投票数量" width="500"> </el-table-column>
        </el-table>
        <div v-else>
          <p>加载中...</p>
        </div>
        <div class="charts-container">
          <div ref="bar" style="width: 450px; height: 450px;"></div>
          <div ref="line" style="width: 450px; height: 450px;"></div>
          <div ref="pie" style="width: 450px; height: 450px;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();
const userId = route.query.user_id;
const token = route.query.token;
const voteId = ref(route.query.vote_id);
const voteData = ref(null);
const isEditing = ref(false);
const canEdit = ref(Number(route.query.can_edit) || 0);
const isCreator = ref(false); // 创建者标识，默认为 false
const editVoteData = ref({});
const activeIndex = ref('ongoingvote');

const handleSelect = (index) => {
  activeIndex.value = index;
  router.push({ name: index, query: { user_id: userId, token: token } });
};

const fetchVoteData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/results/${userId}/${voteId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 200) {
      const responseData = response.data;
      voteData.value = {
        vote: responseData.vote,
        options: responseData.options.map(option => ({
          option_id: option.option_id,
          option_title: option.option_title,
          count: findCountForOption(option.option_id, responseData.results)
        }))
      };
      // 检查当前用户是否是创建者
      isCreator.value = responseData.vote.created_by === userId;
    } else {
      handleFetchError(response.statusText, response.status);
    }
  } catch (error) {
    handleFetchError(error.message);
  }
};

const findCountForOption = (optionId, results) => {
  const result = results.find(result => result.option_id === optionId.toString());
  return result ? result.count : 0;
};

const handleFetchError = (errorMessage, statusCode) => {
  console.error('获取投票内容失败:', errorMessage);
  let alertMessage = '获取投票内容失败';
  if (statusCode === 404) {
    alertMessage = '未找到匹配的投票码，请检查您的投票码是否正确';
  } else {
    alertMessage = '服务器遇到问题，请稍后再试';
  }
  ElMessageBox.alert(alertMessage, '错误');
};

const startEditing = () => {
  editVoteData.value = { ...voteData.value.vote };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editVoteData.value = {};
};

const submitEdit = async () => {
  try {
    const startTime = new Date(editVoteData.value.start_time).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').replace(/, /g, ' ');
    const endTime = new Date(editVoteData.value.end_time).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').replace(/, /g, ' ');

    const response = await axios.put(`http://localhost:3000/votes/${voteId.value}`, {
      user_id: Number(userId),
      vote_title: editVoteData.value.vote_title,
      start_time: startTime,
      end_time: endTime
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      voteData.value.vote = { ...editVoteData.value }; // Update the original vote data
      isEditing.value = false;
      ElMessage.success('修改成功');
    } else {
      throw new Error(`修改失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error(error.message);
    ElMessage.error('修改失败');
  }
};

const exportVoteData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/results/${userId}/${voteId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 200) {
      const exportData = response.data;
      handleExportLogic(exportData);
    } else {
      throw new Error(`导出失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error('导出失败:', error.message);
    ElMessage.error(`导出失败: ${error.message}`);
  }
};

const handleExportLogic = (exportData) => {
  // 将数据转换为 XLSX 格式
  const worksheet = XLSX.utils.json_to_sheet(exportData.results.map(result => ({
    option_id: result.option_id,
    count: result.count,
    option_title: exportData.options.find(option => option.option_id.toString() === result.option_id)?.option_title
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '投票结果');
  const voteTitle = exportData.vote.vote_title.replace(/[/\\?%*:|"<>]/g, '-');
  XLSX.writeFile(workbook, `${voteTitle}.xlsx`);
};

const endVote = async () => {
  try {
    const response = await axios.put(`http://localhost:3000/votes/${voteId.value}`, {
      user_id: Number(userId),
      status: 'closed'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      ElMessage.success('投票已提前结束');
      router.push({ name: 'myvote', query: { user_id: userId, token: token } });
    } else {
      throw new Error(`更新投票失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error('更新投票失败:', error.message);
    ElMessage.error('更新投票失败');
  }
};

const bar = ref(null);
const line = ref(null);
const pie = ref(null);

const createChart = (el, type) => {
  if (!voteData.value || !voteData.value.options) {
    return; // 数据未加载完成时不渲染图表
  }

  const chart = echarts.init(el);
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => `${params[0].name}: ${params[0].value}`
    },
    xAxis: {
      type: 'category',
      data: voteData.value.options.map(option => option.option_title),
      axisLabel: {
        formatter: (value) => (value.length > 10 ? value.slice(0, 10) + '...' : value)
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type,
      data: voteData.value.options.map(option => option.count),
    }]
  });
  return chart;
};

const createPieChart = (el) => {
  if (!voteData.value || !voteData.value.options) {
    return; // 数据未加载完成时不渲染图表
  }

  const chart = echarts.init(el);
  const pieData = voteData.value.options.map(option => ({
    value: option.count,
    name: option.option_title,
  }));
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.name}: ${params.value}`
    },
    series: [{
      type: 'pie',
      data: pieData
    }]
  });
  return chart;
};

watch(voteData, () => {
  createChart(bar.value, 'bar');
  createChart(line.value, 'line');
  createPieChart(pie.value);
});

onMounted(() => {
  fetchVoteData();
  initializeWebSocket();
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