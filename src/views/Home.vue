<template>
  <div class="page home-page">
    <!-- 天气 -->
    <WeatherCard />

    <!-- 问候语 -->
    <div class="greeting">
      <div class="greeting-text">{{ greeting }}，{{ settings.data.username }}</div>
      <div class="greeting-date">
        <van-icon name="calendar-o" size="12" style="vertical-align: -1px; margin-right: 4px; opacity: 0.6;" />
        {{ todayStr }}
      </div>
    </div>

    <!-- 每日一句 -->
    <DailyQuote />

    <!-- 通勤提醒 -->
    <CommuteBar />

    <!-- 今日概览三卡片 -->
    <div class="overview-cards">
      <div class="overview-card card-tasks" @click="$router.push('/tasks')">
        <div class="overview-content">
          <div class="overview-num">{{ tasksStore.todayTotal - tasksStore.todayCompleted }}</div>
          <div class="overview-label">今日待办</div>
        </div>
        <div class="overview-icon">
          <van-icon name="todo-list-o" size="22" />
        </div>
      </div>
      <div class="overview-card card-expense" @click="$router.push('/finance')">
        <div class="overview-content">
          <div class="overview-num">¥{{ formatMoney(expensesStore.todayTotal) }}</div>
          <div class="overview-label">今日开支</div>
        </div>
        <div class="overview-icon">
          <van-icon name="balance-o" size="22" />
        </div>
      </div>
      <div class="overview-card card-habit" @click="$router.push('/habits')">
        <div class="overview-content">
          <div class="overview-num">{{ habitsStore.todayCompletedCount }}/{{ settings.data.habits.length }}</div>
          <div class="overview-label">习惯打卡</div>
        </div>
        <div class="overview-icon">
          <van-icon name="award-o" size="22" />
        </div>
      </div>
    </div>

    <!-- 即将到期提醒 -->
    <div class="section" v-if="upcomingReminders.length > 0">
      <div class="section-header">
        <span class="section-title">
          <van-icon name="clock-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #6366f1;" />即将到期
        </span>
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
        <span class="section-title">
          <van-icon name="todo-list-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #6366f1;" />今日任务
        </span>
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
          <van-icon name="warning-o" size="16" />
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
import { getGreeting, formatCNDate, formatMoney, getNextOccurrence, countdownText } from '@/utils/date'
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
const todayStr = computed(() => formatCNDate(new Date()))

const todayTasks = computed(() => tasksStore.todayTasks)
const upcomingReminders = computed(() => remindersStore.upcoming7days.slice(0, 5))
const upcomingExpenses = computed(() => remindersStore.upcomingExpenses)
const upcomingExpensesTotal = computed(() => upcomingExpenses.value.reduce((s, e) => s + Number(e.amount), 0))

const getTypeColor = (type) => {
  return REMINDER_TYPES.find(t => t.key === type)?.color || '#94a3b8'
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
  font-size: 22px;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.5px;
}

.greeting-date {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 2px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.overview-card {
  border-radius: 18px;
  padding: 16px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
}

.overview-card:active {
  transform: scale(0.97);
}

.card-tasks {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}
.card-tasks .overview-num { color: #4338ca; }
.card-tasks .overview-icon { color: #6366f1; }

.card-expense {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.card-expense .overview-num { color: #92400e; }
.card-expense .overview-icon { color: #f59e0b; }

.card-habit {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.card-habit .overview-num { color: #065f46; }
.card-habit .overview-icon { color: #10b981; }

.overview-content {
  flex: 1;
}

.overview-num {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.overview-label {
  font-size: 11px;
  color: #64748b;
}

.overview-icon {
  opacity: 0.5;
  flex-shrink: 0;
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
  color: #1e1b4b;
}

.section-more {
  font-size: 12px;
  color: #6366f1;
}

.reminder-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.reminder-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  min-width: 120px;
  border-left: 3px solid #6366f1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.reminder-card:active {
  transform: scale(0.97);
}

.reminder-card-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e1b4b;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reminder-card-countdown {
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
}

.more-tasks {
  text-align: center;
  font-size: 12px;
  color: #6366f1;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  margin-top: 4px;
}

.expense-preview {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 14px;
  padding: 14px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
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
  color: #78350f;
  background: rgba(255,255,255,0.5);
  padding: 4px 8px;
  border-radius: 6px;
}

.preview-total {
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
  text-align: right;
}
</style>
