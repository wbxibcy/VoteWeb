<style scoped>
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  /* 占满整个视口高度 */
  background-image: url('@/assets/myvote.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: start;
  margin-top: 80px;
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

.table {
  margin-top: 5px;
  width: 100%;
  display: flex;
  justify-content: start;
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
  <div class="vote-details" v-if="voteData">
    <h1>{{ voteData.vote.vote_title }}</h1>
    <p>{{ voteData.vote.vote_description }}</p>
    <p>投票码： {{ voteData.vote.vote_code }}</p>
    <p>投票开始时间：{{ new Date(voteData.vote.start_time).toLocaleString() }}</p>
    <p>投票结束时间：{{ new Date(voteData.vote.end_time).toLocaleString() }}</p>
    <el-button @click="startEditing" style="font-weight: bold; background-color: #409EFF; color: white;">编辑</el-button>
    <el-button @click="exportVoteData" style="font-weight: bold; background-color: #67C23A; color: white;">
    导出</el-button>
    <el-button style="font-weight: bold; background-color: red; color: white;">提前结束</el-button>
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
      <el-button @click="submitEdit" style="font-weight: bold; background-color: #409EFF; color: white;">确定</el-button>
      <el-button @click="cancelEdit" style="font-weight: bold; color: #409EFF; background-color: white;">取消</el-button>
    </div>
  </div>
  <el-table v-if="voteData" :data="voteData.options" style="width: 100%;">
    <el-table-column prop="option_title" label="投票选项" width="500"></el-table-column>
    <el-table-column prop="count" label="投票数量" width="500"> </el-table-column>
  </el-table>
  <div v-else>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';

const route = useRoute();
const router = useRouter();
const userId = route.query.user_id;
const token = route.query.token;
const voteId = ref(route.query.vote_id);
const voteData = ref(null);
const isEditing = ref(false);
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
      voteData.value = {
        vote: response.data.vote,
        options: response.data.options.map(option => ({
          option_id: option.option_id,
          option_title: option.option_title,
          count: findCountForOption(option.option_id, response.data.results)
        }))
      };
    } else {
      console.error('获取投票内容失败:', response.statusText);
      if (response.status === 404) {
        ElMessageBox.alert('未找到匹配的投票码，请检查您的投票码是否正确', '错误');
      } else {
        ElMessageBox.alert('服务器遇到问题，请稍后再试', '错误');
      }
    }
  } catch (error) {
    console.error('获取投票内容失败:', error.message);
    ElMessageBox.alert('获取投票内容失败', '错误');
  }
};

const findCountForOption = (optionId, results) => {
  const result = results.find(result => result.option_id === optionId.toString());
  return result ? result.count : 0;
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

onMounted(() => {
  fetchVoteData();
});
</script>