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


.table-container {
  margin-top: 5px;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}


.bt-container {
  display: flex;
  flex-direction: column;
}

.search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>


<template>
  <div class="wrapper">
    <!-- 菜单栏 -->
    <el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" :ellipsis="false" @select="handleSelect">
      <div class="logo-title">
        <img src="../assets/logo.png" alt="Logo" class="logo" />
      </div>
      <div class="flex-grow" />
      <el-menu-item index="home" style="color: #409EFF; font-weight: bold;">返回首页</el-menu-item>
    </el-menu>
    <div class="bt-container">
      <div class="search">
        <el-input v-model="keyword" placeholder="输入关键词进行搜索" style="width: 200px;"></el-input>
        <el-button @click="goToCreateVotes" style="background-color: #409EFF;width: 400px; color: white;">创建新的投票</el-button>
        <div class="button-group">
          <el-button color="#409EFF" :plain="selectedStatus === 'open'" @click="handleStatusFilter('open')">
            进行中
          </el-button>
          <el-button color="#409EFF" :plain="selectedStatus === 'unstarted'" @click="handleStatusFilter('unstarted')">
            未开始
          </el-button>
          <el-button color="#409EFF" :plain="selectedStatus === 'closed'" @click="handleStatusFilter('closed')">
            已完成
          </el-button>
          <el-button color="#409EFF" :plain="!selectedStatus" @click="handleStatusFilter(null)">
            全部
          </el-button>
        </div>
      </div>
      <div class="table-container">
        <el-table :data="filteredVotes" style="width: 100%">
          <el-table-column prop="vote_title" label="投票标题" width="300" />
          <el-table-column prop="status" label="状态" width="150" />
          <el-table-column prop="vote_code" label="投票码" width="200" />
          <el-table-column prop="start_time" label="开始时间" width="300">
            <template #default="{ row }">
              {{ formatTime(row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="end_time" label="结束时间" width="300">
            <template #default="{ row }">
              {{ formatTime(row.end_time) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleMoreClick(row)">
                更多
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteClick(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const userId = route.query.user_id;
const token = route.query.token;  // 从查询参数中获取令牌
const votes = ref([]);
const selectedStatus = ref(null);
const keyword = ref('');
const activeIndex = ref('myvote');

const goToCreateVotes = () => {
      router.push({ name: 'createvote', query: { user_id: userId, token: token } });
    };

const fetchVotes = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/votes/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    votes.value = response.data;
  } catch (error) {
    console.error('Error fetching votes:', error.message);
  }
};

const handleMoreClick = (vote) => {
  if (vote.status === 'closed') {
    router.push({ name: 'finishedvote', query: { vote_id: vote.vote_id, user_id: userId, token: token } });
  } else {
    router.push({ name: 'ongoingvote', query: { vote_id: vote.vote_id, user_id: userId, token: token } });
  }
};

const handleDeleteClick = async (vote) => {
  try {
    const voteId = vote.vote_id;
    await axios.delete(`http://localhost:3000/votes/${voteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchVotes(); // 删除后重新获取投票列表
  } catch (error) {
    console.error('Error deleting vote:', error.message);
  }
};

const formatTime = (timeString) => {
  const date = new Date(timeString);
  const formattedDate = `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(date.getSeconds())}`;
  return formattedDate;
};

const padNumber = (num) => {
  return num.toString().padStart(2, '0');
};

const handleStatusFilter = (status) => {
  selectedStatus.value = status;
};


const filteredVotes = computed(() => {
  if (!selectedStatus.value && !keyword.value) return votes.value;

  return votes.value.filter(vote => {
    const matchesStatus = !selectedStatus.value || vote.status === selectedStatus.value;
    const matchesKeyword = !keyword.value || vote.vote_title.toLowerCase().includes(keyword.value.toLowerCase());
    return matchesStatus && matchesKeyword;
  });
});

const handleSelect = (index) => {
      activeIndex.value = index;
      router.push({ name: index, query: { user_id: userId, token: token } });
    };

onMounted(fetchVotes);
</script>
