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
        <div v-if="!isEditing">
          <h1>投票名称为{{ voteData.vote.vote_title }}</h1>
          <p style="color: #409EFF ;">投票描述为{{ voteData.vote.vote_description }}</p>
          <p style="color: #409EFF ;">投票开始时间为{{ voteData.vote.start_time }}</p>
          <p style="color: #409EFF ;">投票结束时间为{{ voteData.vote.end_time }}</p>
          <el-button @click="startEditing" style="font-weight: bold; background-color: #409EFF; color: white;">编辑</el-button>
          <el-button @click="exportVoteData" style="font-weight: bold; background-color: #67C23A; color: white;">导出</el-button>
          <el-button @click="deleteVote" style="font-weight: bold; color: white; background-color: red;">删除</el-button>
        </div>
        <div v-else style="color: #409EFF;font-weight: bold;">
          <label>
            投票名称:
            <input v-model="editVoteData.vote_title" />
          </label>
          <label>
            投票描述:
            <input v-model="editVoteData.vote_description" />
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
      <div class="b-container">
        <div style="width: 80%;">
          <el-table :data="optionData" style="width: 580px;">
            <el-table-column prop="option_title" label="投票选项"></el-table-column>
          </el-table>
        </div>
        <div style="width: 80%;">
          <el-table :data="resultData" style="width: 580px;">
            <el-table-column prop="count" label="投票数量"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';

const route = useRoute();
const router = useRouter();
const voteId = ref(route.query.vote_id);
const userId = route.query.user_id;

const voteData = ref(null);
const optionData = ref([]);
const resultData = ref([]);
const activeIndex = ref('finishedvote');

const handleSelect = (index) => {
  activeIndex.value = index;
  router.push({ name: index, query: { user_id: userId } });
};

const isEditing = ref(false);
const editVoteData = ref({});

const fetchVoteData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/votes/id/${voteId.value}`);
    if (response.status === 200) {
      voteData.value = response.data;
      optionData.value = response.data.options.map(option => ({
        option_id: option.option_id,
        option_title: option.option_title,
      }));
      await fetchResultsData(response.data.vote.vote_id);
    } else {
      throw new Error(`获取投票内容失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const startEditing = () => {
  editVoteData.value = { ...voteData.value.vote }; // Clone the vote data
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editVoteData.value = {}; // Clear the edit data
};

const submitEdit = async () => {
  try {
    const response = await axios.put(`http://localhost:3000/votes/${voteId.value}`, {
      vote_title: editVoteData.value.vote_title,
      vote_description: editVoteData.value.vote_description,
      start_time: editVoteData.value.start_time,
      end_time: editVoteData.value.end_time,
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

const fetchResultsData = async (voteId) => {
  try {
    const resultsResponse = await axios.get(`http://localhost:3000/results/${voteId}`);
    if (resultsResponse.status === 200) {
      resultData.value = resultsResponse.data.map(result => ({
        option_id: result.option_id,
        count: result.count,
      }));
      console.log('成功获取投票结果数据:', resultData.value);
    } else {
      throw new Error(`获取投票结果失败: 状态码 ${resultsResponse.status}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const exportVoteData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/results/export/${voteId.value}`);
    if (response.status === 200) {
      const exportData = response.data;
      const ws = XLSX.utils.json_to_sheet([
        { key: 'Vote ID', value: exportData.vote_id },
        { key: 'Vote Title', value: exportData.vote_title },
        { key: 'Vote Description', value: exportData.vote_description },
        ...exportData.results.map(result => ({
          key: result.option_title,
          value: result.count,
        }))
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vote Results');
      XLSX.writeFile(wb, `${exportData.vote_title}_results.xlsx`);
    } else {
      throw new Error(`导出失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error('导出失败:', error.message);
  }
};

const fetchOptionData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/vote_options/${userId}/${voteId.value}/options`);
    if (response.status === 200) {
      optionData.value = response.data.map(option => ({
        option_id: option.option_id,
        option_title: option.option_title,
      }));
    } else {
      throw new Error(`获取投票选项失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const deleteVote = async () => {
  try {
    const response = await axios.delete(`http://localhost:3000/votes/${voteId.value}`);
    if (response.status === 200) {
      ElMessage.success('投票删除成功');
      router.push({ name: 'myvote', query: { user_id: userId } });
    } else {
      throw new Error(`删除投票失败: 状态码 ${response.status}`);
    }
  } catch (error) {
    console.error('删除投票失败:', error.message);
    ElMessage.error('删除投票失败');
  }
};

onMounted(() => {
  fetchVoteData();
});
</script>
