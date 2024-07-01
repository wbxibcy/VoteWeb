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

.vote-input {
  margin: 20px;
}

.vote-input h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
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

  <div class="vote-input">
    <el-form :model="formData" label-width="120px">
      <el-form-item>
        <h2 style="color: #409EFF; font-weight: bold;">
          创建投票<br>
          <div id="voteCodeContainer" style="color: whitesmoke; font-weight: bold;"></div>
        </h2>
      </el-form-item>
      <el-form-item label="投票名称" prop="vote_title">
        <el-input v-model="formData.vote_title"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker v-model="formData.start_time" type="datetime"></el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker v-model="formData.end_time" type="datetime"></el-date-picker>
      </el-form-item>
      <el-form-item label="投票描述" prop="vote_description">
        <el-input v-model="formData.vote_description"></el-input>
      </el-form-item>
      <el-form-item label="投票选项" prop="options" v-for="(option, index) in formData.options" :key="index">
        <el-input v-model="formData.options[index].option_title"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="text" @click="addOption">增加选项</el-button>
        <el-button type="primary" @click="confirmVote">确定创建</el-button>
      </el-form-item>
    </el-form>
  
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const token = route.query.token; 
const userId = route.query.user_id;
const activeIndex = ref('createvote');

const formData = ref({
  vote_title: '',
  vote_description: '',
  start_time: '',
  end_time: '',
  min_votes: 1,
  max_votes: 1,
  options: [{ option_title: '' }],
  user_id: parseInt(route.query.user_id)
});

const handleSelect = (index) => {
      activeIndex.value = index;
      router.push({ name: index, query: { user_id: userId, token: token } });
    };

const addOption = () => {
  formData.value.options.push({ option_title: '' });
};

const formatDate = (date) => {
  const padNumber = (num) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const confirmVote = async () => {
  try {
    const startTime = new Date(formData.value.start_time);
    const endTime = new Date(formData.value.end_time);

    const formattedStartTime = formatDate(startTime);
    const formattedEndTime = formatDate(endTime);

    // 检查开始时间和结束时间是否合理
    if (startTime >= endTime) {
      ElMessage.error('结束时间必须晚于开始时间');
      return;
    }

    // 创建投票数据
    const voteDataToInsert = {
      user_id: formData.value.user_id,
      vote_title: formData.value.vote_title,
      vote_description: formData.value.vote_description,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      min_votes: formData.value.min_votes,
      max_votes: formData.value.max_votes,
      options: formData.value.options.map(option => ({ option_title: option.option_title }))
    };

    // 发送投票数据的请求
    const voteResponse = await axios.post('http://localhost:3000/votes', voteDataToInsert, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (voteResponse.status === 201) {
      console.log('投票创建成功，投票ID:', voteResponse.data.vote_id);
      console.log('投票码:', voteResponse.data.vote_code);

      // 显示弹窗
      ElMessageBox.alert(`您的投票码是: ${voteResponse.data.vote_code}`, '投票创建成功', {
        confirmButtonText: '确定',
        callback: () => {
          console.log('弹窗关闭');
        },
      });

      // 清空表单数据
      formData.value.vote_title = '';
      formData.value.vote_description = '';
      formData.value.start_time = '';
      formData.value.end_time = '';
      formData.value.min_votes = 1;
      formData.value.max_votes = 1;
      formData.value.options = [{ option_title: '' }];
    }
  } catch (error) {
    console.error('投票或选项创建失败:', error.message);
    ElMessage.error('创建投票或选项失败，请稍后再试');
  }
};
</script>
