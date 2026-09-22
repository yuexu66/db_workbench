<template>
  <div class="page home-page">
    <!-- 天气 -->
    <WeatherCard />

    <!-- 问候语 -->
    <div class="greeting">
      <div class="greeting-text">{{ greeting }}，{{ settings.data.username }}</div>
      <div class="greeting-date">{{ todayStr }}</div>
    </div>

    <!-- 每日一句 -->
    <DailyQuote />

    <!-- 通勤提醒 -->
    <CommuteBar />

    <!-- 今日概览三卡片 -->
    <div class="overview-cards">
      <div class="overview-card blue" @click="$router.push('/tasks')">
        <div class="overview-num">{{ tasksStore.todayTotal - tasksStore.todayCompleted }}</div>
        <div class="overview-label">今日待办</div>
      </div>
      <div class="overview-card orange" @click="$router.push('/finance')">
        <div class="overview-num">¥{{ formatMoney(expensesStore.todayTotal) }}</div>
        <div class="overview-label">今日开支</div>
      </div>
      <div class="overview-card green">
        <div class="overview-num">{{ habitsStore.todayCompletedCount }}/{{ settings.data.habits.length }}</div>
        <div class="overview-label">习惯打卡</div>
      </div>
    </div>

    <!-- 即将到期提醒 -->
    <div class="section" v-if="upcomingReminders.length > 0">
      <div class="section-header">
        <span class="section-title">即将到期</span>
        <span class="section-more" @click="$router.push('/reminders')">全部</span>
      </div>
      <div class="reminder-scroll">
        <div
          v-for="r in upcomingReminders"
          :key="r.id"
          class="reminder-card"
          :style="{ borderLeftColor: getTypeColor(r.type) }"
          @click="$router.push('/reminders')"
        >
          <div class="reminder-card-title">{{ r.title }}</div>
          <div class="reminder-card-countdown">{{ getCountdown(r) }}</div>
        </div>
      </div>
    </div>

    <!-- 今日日程 -->
    <div class="section" v-if="todayTasks.length > 0">
      <div class="section-header">
        <span class="section-title">今日任务</span>
        <span class="section-more" @click="$router.push('/tasks')">全部</span>
      </div>
      <div class="card">
        <TaskItem
          v-for="task in todayTasks.slice(0, 4)"
          :key="task.id"
          :task="task"
          @toggle="tasksStore.toggle"
        />
        <div v-if="todayTasks.length > 4" class="more-tasks" @click="$router.push('/tasks')">
          还有 {{ todayTasks.length - 4 }} 项任务
        </div>
      </div>
    </div>

    <!-- 习惯打卡 -->
    <div class="section">
      <div class="card">
        <HabitChecker />
      </div>
    </div>

    <!-- 未来7天支出预告 -->
    <div class="section" v-if="upcomingExpenses.length > 0">
      <div class="expense-preview">
        <div class="preview-title">
          <van-icon name="warning" size="16" color="#fa8c16" />
          <span>未来7天支出预告</span>
        </div>
        <div class="preview-items">
          <span v-for="e in upcomingExpenses" :key="e.id" class="preview-item">
            {{ e.title }} ¥{{ e.amount }}
          </span>
        </div>
        <div class="preview-total">合计 ¥{{ upcomingExpensesTotal }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useTasksStore } from '@/stores/tasks'
import { useRemindersStore, REMINDER_TYPES } from '@/stores/reminders'
import { useExpensesStore } from '@/stores/expenses'
import { useHabitsStore } from '@/stores/habits'
import { getGreeting, formatDate, formatMoney, getNextOccurrence, countdownText } from '@/utils/date'
import WeatherCard from '@/components/WeatherCard.vue'
import DailyQuote from '@/components/DailyQuote.vue'
import CommuteBar from '@/components/CommuteBar.vue'
import TaskItem from '@/components/TaskItem.vue'
import HabitChecker from '@/components/HabitChecker.vue'

const settings = useSettingsStore()
const tasksStore = useTasksStore()
const remindersStore = useRemindersStore()
const expensesStore = useExpensesStore()
const habitsStore = useHabitsStore()

const greeting = computed(() => getGreeting())
const todayStr = computed(() => formatDate(new Date(), 'M月D日 dddd'))

const todayTasks = computed(() => tasksStore.todayTasks)
const upcomingReminders = computed(() => remindersStore.upcoming7days.slice(0, 5))
const upcomingExpenses = computed(() => remindersStore.upcomingExpenses)
const upcomingExpensesTotal = computed(() => upcomingExpenses.value.reduce((s, e) => s + Number(e.amount), 0))

const getTypeColor = (type) => {
  return REMINDER_TYPES.find(t => t.key === type)?.color || '#8c8c8c'
}

const getCountdown = (r) => {
  const next = getNextOccurrence(r.date, r.repeat)
  return countdownText(next)
}
</script>

<style scoped>
.home-page {
  padding: 12px;
}

.greeting {
  margin-bottom: 12px;
}

.greeting-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.greeting-date {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.overview-card {
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
}

.overview-card.blue { background: linear-gradient(135deg, #e6f3ff, #d0e8ff); }
.overview-card.orange { background: linear-gradient(135deg, #fff4e6, #ffe8cc); }
.overview-card.green { background: linear-gradient(135deg, #f6ffed, #d9f7be); }

.overview-num {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.overview-label {
  font-size: 11px;
  color: #666;
}

.section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #4A90D9;
}

.reminder-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.reminder-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  min-width: 120px;
  border-left: 3px solid #4A90D9;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  flex-shrink: 0;
  cursor: pointer;
}

.reminder-card-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reminder-card-countdown {
  font-size: 12px;
  color: #4A90D9;
  font-weight: 500;
}

.more-tasks {
  text-align: center;
  font-size: 12px;
  color: #4A90D9;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}

.expense-preview {
  background: linear-gradient(135deg, #fff7e6, #fff1d6);
  border-radius: 12px;
  padding: 14px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #fa8c16;
  margin-bottom: 10px;
}

.preview-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.preview-item {
  font-size: 12px;
  color: #666;
  background: rgba(255,255,255,0.6);
  padding: 4px 8px;
  border-radius: 6px;
}

.preview-total {
  font-size: 14px;
  font-weight: 600;
  color: #f5222d;
  text-align: right;
}
</style>
