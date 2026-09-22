<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="go(tab.path)"
    >
      <div class="tab-icon-wrap">
        <van-icon :name="tab.icon" size="22" />
      </div>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/home', label: '首页', icon: 'wap-home-o' },
  { path: '/tasks', label: '任务', icon: 'todo-list-o' },
  { path: '/reminders', label: '提醒', icon: 'bell' },
  { path: '/finance', label: '财务', icon: 'balance-o' },
  { path: '/profile', label: '我的', icon: 'user-o' }
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
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -1px 12px rgba(0, 0, 0, 0.06);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: #94a3b8;
  font-size: 11px;
  flex: 1;
  height: 100%;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tab-item.active {
  color: #6366f1;
}

.tab-item.active .tab-icon-wrap {
  background: rgba(99, 102, 241, 0.1);
  transform: scale(1.05);
}

.tab-icon-wrap {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
