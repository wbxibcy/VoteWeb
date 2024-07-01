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

<script>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  setup() {
    const router = useRouter();
    const voteCode = ref('');
    const route = useRoute();
    const userId = route.query.user_id;
    const token = route.query.token; // Retrieve the token from the query parameters

    const submitVoteCode = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/votes/code/${voteCode.value}`, {
          headers: { Authorization: `Bearer ${token}` } // Include the token in the request headers
        });
        if (response.status === 200) {
          console.log('提交投票码成功:', response.data);
          // Navigate to govote page with voteCode, user_id, and token as query parameters
          router.push({ name: 'govote', params: { voteCode: voteCode.value }, query: { user_id: userId, token: token } });
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            console.error('没有找到对应投票码的投票信息');
            ElMessage.error('未找到匹配的投票码，请检查您的投票码是否正确');
          } else if (error.response.status === 500) {
            console.error('服务器错误');
            ElMessage.error('服务器遇到问题，请稍后再试');
          }
        } else {
          console.error('请求错误:', error.message);
        }
      }
    };

    const goToMyVotes = () => {
      router.push({ name: 'myvote', query: { user_id: userId, token: token } });
    };

    return {
      voteCode,
      submitVoteCode,
      goToMyVotes
    };
  }
};
</script>