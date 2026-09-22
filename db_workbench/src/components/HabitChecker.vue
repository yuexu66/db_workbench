<template>
  <div class="habit-checker">
    <div class="section-title">
      <span>习惯打卡</span>
      <span class="streak">本周连续 {{ maxStreak }} 天</span>
    </div>
    <div class="habit-grid">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="habit-item"
        :class="{ checked: isChecked(habit.id) }"
        @click="toggle(habit.id)"
      >
        <div class="habit-circle">
          <van-icon v-if="isChecked(habit.id)" name="success" size="18" color="#fff" />
          <span v-else class="habit-initial">{{ habit.name.charAt(0) }}</span>
        </div>
        <span class="habit-name">{{ habit.name }}</span>
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

const isChecked = (id) => habitsStore.isChecked(id)
const toggle = (id) => habitsStore.toggle(id)

const maxStreak = computed(() => {
  if (habits.value.length === 0) return 0
  return Math.max(...habits.value.map(h => habitsStore.streakDays(h.id)))
})
</script>

<style scoped>
.habit-checker {
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.streak {
  font-size: 12px;
  color: #52c41a;
  font-weight: 400;
}

.habit-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.habit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  cursor: pointer;
}

.habit-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.habit-item.checked .habit-circle {
  background: #52c41a;
}

.habit-initial {
  font-size: 16px;
  color: #999;
  font-weight: 500;
}

.habit-name {
  font-size: 11px;
  color: #666;
}

.habit-item.checked .habit-name {
  color: #52c41a;
}
</style>
