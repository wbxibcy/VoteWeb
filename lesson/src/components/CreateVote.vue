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
        <el-form-item >
          <h2 style="color: #409EFF;font-weight: bold;">创建投票</h2>
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
        <el-form-item label="最少投票次数" prop="min_votes">
          <el-input v-model.number="formData.min_votes" type="number"></el-input>
        </el-form-item>
        <el-form-item label="最多投票次数" prop="max_votes">
          <el-input v-model.number="formData.max_votes" type="number"></el-input>
        </el-form-item>
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
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios';

const router = useRouter()
const activeIndex = ref('createvote')

const handleSelect = (index) => {
  activeIndex.value = index
  router.push({ name: index })
}

const formData = ref({
  vote_title: '',
  vote_description: '',
  start_time: '',
  end_time: '',
  min_votes: null,
  max_votes: null,
  options: [''] 
});

const addOption = () => {
  formData.value.options.push(''); 
}

const confirmVote = async () => {
  try {
    const response = await axios.post('http://localhost:3000/votes', formData.value);
    if (response.status === 201) {
      console.log('投票创建成功，投票ID:', response.data.vote_id);
      Object.keys(formData.value).forEach(key => {
        if (key !== 'options') { 
          formData.value[key] = '';
        }
      });
      formData.value.options = ['']; 
    }
  } catch (error) {
    console.error('投票创建失败:', error.message);
  }
};
</script>