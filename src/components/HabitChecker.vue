<template>
  <div class="habit-checker">
    <div class="section-title">
      <span class="title-left">
        <span class="t">习惯打卡</span>
        <span class="streak">本周连续 {{ maxStreak }} 天</span>
      </span>
      <span class="manage" @click="$router.push('/habits')">管理 ›</span>
    </div>
    <div class="habit-grid">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="habit-item"
        :class="{ checked: isDone(habit.id) }"
        @click="$router.push('/habits')"
      >
        <div class="habit-circle" :style="circleStyle(habit)">
          <span class="habit-emoji">{{ habit.icon }}</span>
        </div>
        <span class="habit-name">{{ habit.name }}</span>
        <span class="habit-sub">{{ progressText(habit) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useHabitsStore } from '@/stores/habits'

const settings = useSettingsStore()
const habitsStore = useHabitsStore()

const habits = computed(() => settings.data.habits)

const isDone = (id) => habitsStore.isDone(id)

const circleStyle = (habit) => {
  if (habitsStore.isDone(habit.id)) {
    return { background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)` }
  }
  return { background: `${habit.color}18` }
}

const progressText = (habit) => {
  const rec = habitsStore.getRecord(habit.id)
  switch (habit.type) {
    case 'counter':
    case 'duration':
      return `${rec.value}/${habit.target}${habit.unit || ''}`
    case 'choice':
      return rec.items.length > 0 ? `${rec.items.length}项` : '未记录'
    default:
      return rec.done ? '已完成' : '未打卡'
  }
}

const maxStreak = computed(() => {
  if (habits.value.length === 0) return 0
  return Math.max(...habits.value.map(h => habitsStore.streakDays(h.id)))
})
</script>

<style scoped>
.habit-checker {
  margin-bottom: 4px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.t {
  font-size: 15px;
  font-weight: 700;
  color: #1e1b4b;
}

.streak {
  font-size: 11px;
  color: #10b981;
  font-weight: 500;
}

.manage {
  font-size: 12px;
  color: #6366f1;
}

.habit-grid {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.habit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  width: 62px;
  cursor: pointer;
}

.habit-circle {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.habit-emoji {
  font-size: 22px;
  line-height: 1;
  filter: grayscale(0.4);
}

.habit-item.checked .habit-emoji {
  filter: none;
}

.habit-name {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
}

.habit-sub {
  font-size: 10px;
  color: #94a3b8;
}

.habit-item.checked .habit-sub {
  color: #10b981;
}
</style>
