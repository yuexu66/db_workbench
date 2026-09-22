import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', showTabBar: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/Tasks.vue'),
    meta: { title: '任务', showTabBar: true }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('@/views/Reminders.vue'),
    meta: { title: '提醒', showTabBar: true }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('@/views/Finance.vue'),
    meta: { title: '财务', showTabBar: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '我的', showTabBar: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据看板', showTabBar: false }
  },
  {
    path: '/tools/notes',
    name: 'Notes',
    component: () => import('@/views/tools/Notes.vue'),
    meta: { title: '快速便签', showTabBar: false }
  },
  {
    path: '/tools/shopping',
    name: 'Shopping',
    component: () => import('@/views/tools/Shopping.vue'),
    meta: { title: '购物清单', showTabBar: false }
  },
  {
    path: '/tools/countdown',
    name: 'Countdown',
    component: () => import('@/views/tools/Countdown.vue'),
    meta: { title: '倒数日', showTabBar: false }
  },
  {
    path: '/tools/checklist',
    name: 'Checklist',
    component: () => import('@/views/tools/Checklist.vue'),
    meta: { title: '出门清单', showTabBar: false }
  },
  {
    path: '/tools/watchlist',
    name: 'Watchlist',
    component: () => import('@/views/tools/Watchlist.vue'),
    meta: { title: '想看清单', showTabBar: false }
  },
  {
    path: '/tools/gifts',
    name: 'Gifts',
    component: () => import('@/views/tools/Gifts.vue'),
    meta: { title: '人情往来', showTabBar: false }
  },
  {
    path: '/tools/passwords',
    name: 'Passwords',
    component: () => import('@/views/tools/Passwords.vue'),
    meta: { title: '密码备忘', showTabBar: false }
  },
  {
    path: '/tools/express',
    name: 'Express',
    component: () => import('@/views/tools/Express.vue'),
    meta: { title: '快递追踪', showTabBar: false }
  },
  {
    path: '/tools/reimburse',
    name: 'Reimburse',
    component: () => import('@/views/tools/Reimburse.vue'),
    meta: { title: '报销记录', showTabBar: false }
  },
  {
    path: '/tools/health',
    name: 'Health',
    component: () => import('@/views/tools/Health.vue'),
    meta: { title: '健康提醒', showTabBar: false }
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('@/views/Habits.vue'),
    meta: { title: '习惯打卡', showTabBar: false }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '设置', showTabBar: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 个人工作台` : '个人工作台'
})

export default router
