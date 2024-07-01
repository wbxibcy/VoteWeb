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

.vote-details {
  padding: 20px;
  border-radius: 5px;
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
    <div class="vote-details" v-if="voteData">
      <h1>{{ voteData.vote.vote_title }}</h1>
      <p>{{ voteData.vote.vote_description }}</p>
      <ul>
        <li v-for="option in voteData.options" :key="option.option_id">
          <el-checkbox v-model="selectedOptions" :label="option.option_id">{{ option.option_title }}</el-checkbox>
        </li>
      </ul>
      <el-button type="primary" @click="submitVotes" style="width: 100%;">确定</el-button>
    </div>
    <div v-else>
      <p>正在加载投票内容...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessageBox } from 'element-plus';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userId = ref(Number(route.query.user_id));
    const token = route.query.token; // 从查询参数中获取 token

    const voteCode = route.params.voteCode;
    const activeIndex = ref('govote');
    const voteData = ref(null);
    const selectedOptions = ref([]);

    const handleSelect = (index) => {
      activeIndex.value = index;
      router.push({ name: index, query: { user_id: userId.value, token: token } });
    };

    const fetchVoteData = async () => {
      try {
        console.log(`Fetching vote data with vote code: ${voteCode}`);
        const response = await axios.get(`http://localhost:3000/votes/code/${voteCode}`, {
          headers: { Authorization: `Bearer ${token}` } // 在头部中包含 token
        });
        if (response.status === 200) {
          voteData.value = response.data;
        }
      } catch (error) {
        console.error('获取投票内容失败:', error.message);
        if (error.response && error.response.status === 404) {
          ElMessageBox.alert('未找到匹配的投票码，请检查您的投票码是否正确', '错误');
        } else {
          ElMessageBox.alert('服务器遇到问题，请稍后再试', '错误');
        }
      }
    };

    const submitVotes = async () => {
      try {
        if (selectedOptions.value.length === 0) {
          ElMessageBox.alert('请至少选择一个选项进行投票', '提示');
          return;
        }

        const postData = {
          vote_id: voteData.value.vote.vote_id,
          user_id: userId.value,
          options: selectedOptions.value.map(optionId => ({ option_id: optionId }))
        };

        console.log('Submitting votes:', postData);
        console.log(userId.value);
        const response = await axios.post('http://localhost:3000/results', postData, {
          headers: { Authorization: `Bearer ${token}` } // 在头部中包含 token
        });

        if (response.status === 201) {
          console.log('投票提交成功:', response.data);
          selectedOptions.value = [];
          router.push({ name: 'ongoingvote', query: { vote_id: voteData.value.vote.vote_id, user_id: userId.value, token: token } });
        }
      } catch (error) {
        console.error('投票提交失败:', error.message);
        if (error.response && error.response.status === 400) {
          ElMessageBox.alert('每人只能投一次票噢', '错误');
        } else {
          ElMessageBox.alert('投票提交失败，请稍后再试', '错误');
        }
      }
    };

    onMounted(async () => {
      await fetchVoteData();
    });

    return {
      userId,
      voteCode,
      activeIndex,
      voteData,
      selectedOptions,
      handleSelect,
      fetchVoteData,
      submitVotes
    };
  }
};
</script>