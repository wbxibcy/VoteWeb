import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import Create from '../components/Create.vue';
import Login from '../components/Login.vue';
import CreateVote from '../components/CreateVote.vue';
import FinishedVote from '../components/FinishedVote.vue';
import GoVote from '../components/GoVote.vue';
import MyVote from '../components/MyVote.vue';
import OngoingVote from '../components/OngoingVote.vue';

const routes = [
  {
    path: '/',
    redirect: '/login' // 添加重定向规则
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage
  },
  {
    path: '/create',
    name: 'create',
    component: Create
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/createvote',
    name: 'createvote',
    component: CreateVote
  },
  {
    path: '/finishedvote',
    name: 'finishedvote',
    component: FinishedVote
  },
  {
    path: '/govote',
    name: 'govote',
    component: GoVote
  },
  {
    path: '/myvote',
    name: 'myvote',
    component: MyVote
  },
  {
    path: '/ongoingvote',
    name: 'ongoingvote',
    component: OngoingVote
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
