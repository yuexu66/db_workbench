<template>
  <div class="page profile-page">
    <!-- 个人信息 -->
    <div class="profile-card">
      <div class="avatar">
        <van-icon name="user" size="32" color="#fff" />
      </div>
      <div class="profile-info">
        <div class="username">{{ settings.data.username }}</div>
        <div class="profile-desc">我的个人工作台</div>
      </div>
      <van-icon name="edit" size="18" color="#999" @click="editProfile" />
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
      <div class="section-title">生活工具箱</div>
      <div class="tool-grid">
        <div
          v-for="tool in tools"
          :key="tool.path"
          class="tool-card"
          :style="{ background: tool.bg }"
          @click="$router.push(tool.path)"
        >
          <van-icon :name="tool.icon" size="24" color="#fff" />
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-desc">{{ tool.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 数据看板入口 -->
    <div class="menu-card" @click="$router.push('/dashboard')">
      <div class="menu-icon blue"><van-icon name="chart-trending" size="20" /></div>
      <span class="menu-text">数据看板</span>
      <van-icon name="arrow" size="14" color="#ccc" />
    </div>

    <!-- 设置列表 -->
    <div class="menu-group">
      <div class="menu-card" @click="$router.push('/settings')">
        <div class="menu-icon gray"><van-icon name="setting" size="20" /></div>
        <span class="menu-text">设置</span>
        <van-icon name="arrow" size="14" color="#ccc" />
      </div>
      <div class="menu-card" @click="exportData">
        <div class="menu-icon green"><van-icon name="down" size="20" /></div>
        <span class="menu-text">数据备份</span>
        <van-icon name="arrow" size="14" color="#ccc" />
      </div>
      <div class="menu-card" @click="clearData">
        <div class="menu-icon red"><van-icon name="delete" size="20" /></div>
        <span class="menu-text">清空数据</span>
        <van-icon name="arrow" size="14" color="#ccc" />
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
  { name: '快速便签', desc: '随手记', icon: 'edit', bg: 'linear-gradient(135deg,#ffd666,#faad14)', path: '/tools/notes' },
  { name: '购物清单', desc: '待买物品', icon: 'shopping-cart', bg: 'linear-gradient(135deg,#95de64,#52c41a)', path: '/tools/shopping' },
  { name: '倒数日', desc: '重要日子', icon: 'clock', bg: 'linear-gradient(135deg,#69c0ff,#1890ff)', path: '/tools/countdown' },
  { name: '出门清单', desc: '出差旅行', icon: 'logistics', bg: 'linear-gradient(135deg,#b37feb,#722ed1)', path: '/tools/checklist' },
  { name: '想看清单', desc: '电影书籍', icon: 'star', bg: 'linear-gradient(135deg,#ff85c0,#eb2f96)', path: '/tools/watchlist' },
  { name: '人情往来', desc: '随礼记录', icon: 'gift', bg: 'linear-gradient(135deg,#ff9c6e,#fa541c)', path: '/tools/gifts' },
  { name: '密码备忘', desc: '账号密码', icon: 'lock', bg: 'linear-gradient(135deg,#8c8c8c,#595959)', path: '/tools/passwords' },
  { name: '快递追踪', desc: '包裹状态', icon: 'logistics', bg: 'linear-gradient(135deg,#5cdbd3,#13c2c2)', path: '/tools/express' },
  { name: '报销记录', desc: '工作报销', icon: 'gold-coin', bg: 'linear-gradient(135deg,#ffc53d,#fa8c16)', path: '/tools/reimburse' },
  { name: '健康提醒', desc: '体检吃药', icon: 'medel', bg: 'linear-gradient(135deg,#73d13d,#389e0d)', path: '/tools/health' }
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
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.profile-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.stats-row {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 16px 0;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.stat-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-right: none;
}

.stat-num {
  font-size: 17px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 0 4px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tool-card {
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  cursor: pointer;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tool-name {
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
}

.tool-desc {
  font-size: 11px;
  opacity: 0.85;
}

.menu-group {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.menu-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.menu-group .menu-card {
  border-radius: 0;
  margin-bottom: 0;
  border-bottom: 1px solid #f5f5f5;
  box-shadow: none;
}

.menu-group .menu-card:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.menu-icon.blue { background: #4A90D9; }
.menu-icon.gray { background: #8c8c8c; }
.menu-icon.green { background: #52c41a; }
.menu-icon.red { background: #f5222d; }

.menu-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.version {
  text-align: center;
  font-size: 12px;
  color: #ccc;
  padding: 20px 0;
}
</style>
