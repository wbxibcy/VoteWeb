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
          <h2 style="color: #409EFF; font-weight: bold;">创建投票<br>
            <div id="voteCodeContainer" style="color: whitesmoke; font-weight: bold;"></div>
          </h2>
        </el-form-item>
        <el-form-item label="投票名称" prop="vote_title">
          <el-input v-model="formData.vote_title"></el-input>
        </el-form-item>
        <el-form-item label="投票状态" prop="status">
          <el-select v-model="formData.vote_status" placeholder="请选择投票状态">
            <el-option label="Open" value="open"></el-option>
            <el-option label="Unstarted" value="Unstarted"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker v-model="formData.start_time" type="datetime"
            :value-format="'YYYY-MM-DDTHH:mm:ss'"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker v-model="formData.end_time" type="datetime"
            :value-format="'YYYY-MM-DDTHH:mm:ss'"></el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="最少投票次数" prop="min_votes">
          <el-input v-model.number="formData.min_votes" type="number"></el-input>
        </el-form-item>
        <el-form-item label="最多投票次数" prop="max_votes">
          <el-input v-model.number="formData.max_votes" type="number"></el-input>
        </el-form-item> -->
        <el-form-item label="投票描述" prop="vote_description">
          <el-input v-model="formData.vote_description"></el-input>
        </el-form-item>
        <el-form-item label="投票选项" prop="options" v-for="(option, index) in formData.options" :key="index">
          <el-input v-model="formData.options[index]"></el-input>
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
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { ElMessageBox, ElMessage } from 'element-plus';
import QRCode from 'qrcode';

const router = useRouter()
const activeIndex = ref('createvote')
const route = useRoute();
const userId = route.query.user_id;

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index, query: { user_id: userId } })
}

onMounted(() => {
  // 从路由参数中获取用户ID
  // formData.value.user_id = route.query.user_id;
  formData.value.user_id = parseInt(route.query.user_id);
});

const formData = ref({
  vote_title: '',
  vote_status: '', // 添加 vote_status 属性
  vote_description: '',
  start_time: '',
  end_time: '',
  min_votes: 1,
  max_votes: 1,
  options: [''],
  user_id: null
});

const addOption = () => {
  formData.value.options.push('');
}

const confirmVote = async () => {
  try {
    const currentTime = new Date();
    const startTime = new Date(formData.value.start_time);
    const endTime = new Date(formData.value.end_time);

    // 检查开始时间和结束时间是否合理
    if (startTime >= endTime) {
      ElMessage.error('结束时间必须晚于开始时间');
      return;
    }
    // 输出formData.value.status的类型
    console.log('formData.value.status的类型:', typeof formData.value.vote_status);
    console.log(formData.value.vote_status)
    // 检查开始时间是否在当前时间之前且状态为open
    if (startTime > currentTime && formData.value.vote_status === 'open') {
      ElMessage.error('开始时间不能晚于当前时间且状态为open');
      return;
    }

    // 检查开始时间是否在当前时间之前且状态为Unstarted
    if (startTime < currentTime && formData.value.vote_status === 'Unstarted') {
      ElMessage.error('开始时间不能早于当前时间且状态为Unstarted');
      return;
    }

    // 创建投票数据
    const voteDataToInsert = {
      user_id: formData.value.user_id,
      vote_title: formData.value.vote_title,
      vote_description: formData.value.vote_description,
      start_time: formData.value.start_time,
      end_time: formData.value.end_time,
      status: formData.value.vote_status,
      min_votes: formData.value.min_votes,
      max_votes: formData.value.max_votes,
    };
    // console.log(formData.value.status);

    // 发送投票数据的请求
    const voteResponse = await axios.post('http://localhost:3000/votes', voteDataToInsert);
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

      // 创建选项数据
      const optionsDataToInsert = {
        user_id: formData.value.user_id,
        vote_id: voteResponse.data.vote_id, // 使用获取到的 vote_id
        options: formData.value.options.map(option => ({ option_title: option }))
      };

      // 发送选项数据的请求
      const optionsResponse = await axios.post('http://localhost:3000/vote_options', optionsDataToInsert);
      if (optionsResponse.status === 201) {
        console.log('选项创建成功');
        // 清空表单数据
        formData.value.vote_title = '';
        formData.value.vote_description = '';
        formData.value.start_time = '';
        formData.value.end_time = '';
        formData.value.vote_status = '';
        formData.value.min_votes = null;
        formData.value.max_votes = null;
        formData.value.options = [''];
      }
    }
  } catch (error) {
    console.error('投票或选项创建失败:', error.message);
    ElMessage.error('创建投票或选项失败，请稍后再试');
  }
};

</script>