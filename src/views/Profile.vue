<template>
  <div class="page profile-page">
    <!-- 个人信息 -->
    <div class="profile-card">
      <div class="avatar">
        <van-icon name="user" size="32" color="#fff" />
      </div>
      <div class="profile-info">
        <div class="username">{{ settings.data.username }}</div>
        <div class="profile-desc">
          <van-icon name="star" size="11" style="margin-right: 3px; vertical-align: -1px;" />我的个人工作台
        </div>
      </div>
      <van-icon name="edit" size="18" color="#94a3b8" @click="editProfile" />
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-num">{{ remindersStore.list.length }}</div>
        <div class="stat-label">提醒</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ tasksStore.list.length }}</div>
        <div class="stat-label">任务</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">¥{{ formatMoney(expensesStore.thisMonthTotal) }}</div>
        <div class="stat-label">本月支出</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ maxStreak }}</div>
        <div class="stat-label">连续打卡</div>
      </div>
    </div>

    <!-- 生活工具箱 -->
    <div class="section">
      <div class="section-title">
        <van-icon name="apps-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #6366f1;" />生活工具箱
      </div>
      <div class="tool-grid">
        <div
          v-for="tool in tools"
          :key="tool.path"
          class="tool-card"
          @click="$router.push(tool.path)"
        >
          <div class="tool-icon-circle" :style="{ background: tool.bg, color: tool.accent }">
            <van-icon :name="tool.icon" size="22" />
          </div>
          <div class="tool-info">
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-desc">{{ tool.desc }}</div>
          </div>
          <van-icon name="arrow" size="14" color="#cbd5e1" />
        </div>
      </div>
    </div>

    <!-- 数据看板入口 -->
    <div class="menu-card" @click="$router.push('/dashboard')">
      <div class="menu-icon blue"><van-icon name="chart-trending-o" size="20" /></div>
      <span class="menu-text">数据看板</span>
      <van-icon name="arrow" size="14" color="#cbd5e1" />
    </div>

    <!-- 设置列表 -->
    <div class="menu-group">
      <div class="menu-card" @click="$router.push('/settings')">
        <div class="menu-icon gray"><van-icon name="setting-o" size="20" /></div>
        <span class="menu-text">设置</span>
        <van-icon name="arrow" size="14" color="#cbd5e1" />
      </div>
      <div class="menu-card" @click="exportData">
        <div class="menu-icon green"><van-icon name="down" size="20" /></div>
        <span class="menu-text">数据备份</span>
        <van-icon name="arrow" size="14" color="#cbd5e1" />
      </div>
      <div class="menu-card" @click="clearData">
        <div class="menu-icon red"><van-icon name="delete-o" size="20" /></div>
        <span class="menu-text">清空数据</span>
        <van-icon name="arrow" size="14" color="#cbd5e1" />
      </div>
    </div>

    <div class="version">个人工作台 v1.0.0</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useSettingsStore } from '@/stores/settings'
import { useTasksStore } from '@/stores/tasks'
import { useRemindersStore } from '@/stores/reminders'
import { useExpensesStore } from '@/stores/expenses'
import { useHabitsStore } from '@/stores/habits'
import { storage } from '@/utils/storage'
import { formatMoney } from '@/utils/date'

const settings = useSettingsStore()
const tasksStore = useTasksStore()
const remindersStore = useRemindersStore()
const expensesStore = useExpensesStore()
const habitsStore = useHabitsStore()

const maxStreak = computed(() => {
  if (settings.data.habits.length === 0) return 0
  return Math.max(...settings.data.habits.map(h => habitsStore.streakDays(h.id)))
})

const tools = [
  { name: '快速便签', desc: '随手记', icon: 'edit', accent: '#f59e0b', bg: '#fffbeb', path: '/tools/notes' },
  { name: '购物清单', desc: '待买物品', icon: 'shopping-cart-o', accent: '#10b981', bg: '#ecfdf5', path: '/tools/shopping' },
  { name: '倒数日', desc: '重要日子', icon: 'clock-o', accent: '#6366f1', bg: '#eef2ff', path: '/tools/countdown' },
  { name: '出门清单', desc: '出差旅行', icon: 'logistics', accent: '#8b5cf6', bg: '#f5f3ff', path: '/tools/checklist' },
  { name: '想看清单', desc: '电影书籍', icon: 'star-o', accent: '#ec4899', bg: '#fdf2f8', path: '/tools/watchlist' },
  { name: '人情往来', desc: '随礼记录', icon: 'gift-o', accent: '#f97316', bg: '#fff7ed', path: '/tools/gifts' },
  { name: '密码备忘', desc: '账号密码', icon: 'lock', accent: '#64748b', bg: '#f8fafc', path: '/tools/passwords' },
  { name: '快递追踪', desc: '包裹状态', icon: 'logistics', accent: '#14b8a6', bg: '#f0fdfa', path: '/tools/express' },
  { name: '报销记录', desc: '工作报销', icon: 'gold-coin-o', accent: '#d97706', bg: '#fffbeb', path: '/tools/reimburse' },
  { name: '健康提醒', desc: '体检吃药', icon: 'medal-o', accent: '#22c55e', bg: '#f0fdf4', path: '/tools/health' }
]

const editProfile = () => {
  showToast('编辑资料功能开发中')
}

const exportData = () => {
  const data = storage.exportAll()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `个人工作台备份_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('备份已下载')
}

const clearData = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '所有数据将被删除且无法恢复，确定继续吗？'
    })
    storage.clear()
    location.reload()
  } catch {}
}
</script>

<style scoped>
.profile-page {
  padding: 12px;
}

.profile-card {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.profile-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4px;
}

.stats-row {
  display: flex;
  background: #fff;
  border-radius: 14px;
  padding: 16px 0;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
}

.stat-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid #f1f5f9;
}

.stat-item:last-child {
  border-right: none;
}

.stat-num {
  font-size: 17px;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #94a3b8;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 0 4px;
  color: #1e1b4b;
}

.tool-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f8fafc;
}

.tool-card:last-child {
  border-bottom: none;
}

.tool-card:active {
  background: #f8fafc;
}

.tool-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e1b4b;
  margin-bottom: 2px;
}

.tool-desc {
  font-size: 12px;
  color: #94a3b8;
}

.menu-group {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
}

.menu-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.2s;
}

.menu-card:active {
  transform: scale(0.98);
}

.menu-group .menu-card {
  border-radius: 0;
  margin-bottom: 0;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: none;
  border-left: none;
  border-right: none;
}

.menu-group .menu-card:first-child {
  border-top: none;
}

.menu-group .menu-card:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.menu-icon.blue { background: linear-gradient(135deg, #818cf8, #6366f1); }
.menu-icon.gray { background: linear-gradient(135deg, #94a3b8, #64748b); }
.menu-icon.green { background: linear-gradient(135deg, #34d399, #10b981); }
.menu-icon.red { background: linear-gradient(135deg, #f87171, #ef4444); }

.menu-text {
  flex: 1;
  font-size: 14px;
  color: #1e1b4b;
}

.version {
  text-align: center;
  font-size: 12px;
  color: #cbd5e1;
  padding: 20px 0;
}
</style>
