<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="go(tab.path)"
    >
      <van-icon :name="tab.icon" size="22" />
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/home', label: '首页', icon: 'wap-home' },
  { path: '/tasks', label: '任务', icon: 'records' },
  { path: '/reminders', label: '提醒', icon: 'bell' },
  { path: '/finance', label: '财务', icon: 'balance-list' },
  { path: '/profile', label: '我的', icon: 'user' }
]

const isActive = (path) => route.path.startsWith(path)
const go = (path) => router.push(path)
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #999;
  font-size: 11px;
  flex: 1;
  height: 100%;
  justify-content: center;
  transition: color 0.2s;
}

.tab-item.active {
  color: #4A90D9;
}

.tab-label {
  font-size: 11px;
}
</style>
