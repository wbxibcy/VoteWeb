<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/choose.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-container,
.right-container {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-input {
  width: 200px;
}
</style>

<template>
  <div class="wrapper">
    <div class="left-container">
      <div style="text-align: center; color: white; font-size: 56px; font-weight: bold;">
        <p>请输入投票码</p>
        <el-input v-model="voteCode" style="width: 400px;"></el-input>
        <el-button type="primary" @click="submitVoteCode" style="width: 400px;">确定</el-button>
      </div>
    </div>
    <div class="right-container">
      <div style="text-align: center; color: #409EFF; font-size: 56px; font-weight: bold;">
        <p>我的投票</p>
        <el-button type="primary" @click="goToMyVotes" style="width: 400px;">前往</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const voteCode = ref('');

const submitVoteCode = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/votes/code/${voteCode.value}`);
    if (response.status === 200) {
      console.log('提交投票码成功:', response.data);
      // 传递正确的参数给 govote 页面
      router.push({ name: 'govote', params: { voteCode: voteCode.value } });
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error('没有找到对应投票码的投票信息');
      } else if (error.response.status === 500) {
        console.error('服务器错误');
      }
    } else {
      console.error('请求错误:', error.message);
    }
  }
};

const goToMyVotes = () => {
  // 跳转至我的投票页面
  router.push({ name: 'myvote' });
};
</script>
