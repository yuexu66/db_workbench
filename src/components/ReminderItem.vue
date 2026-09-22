<template>
  <div class="reminder-item" @click="$emit('click', reminder)">
    <div class="reminder-icon" :style="{ background: typeInfo.color + '20', color: typeInfo.color }">
      <van-icon :name="typeIcon" size="20" />
    </div>
    <div class="reminder-content">
      <div class="reminder-title">{{ reminder.title }}</div>
      <div class="reminder-meta">
        <span>{{ nextDate }}</span>
        <span class="countdown" :class="{ urgent: daysLeft <= 3 }">{{ countdownText }}</span>
        <span class="repeat-tag">{{ repeatLabel }}</span>
      </div>
    </div>
    <van-icon name="arrow" size="14" color="#ccc" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { REMINDER_TYPES } from '@/stores/reminders'
import { getNextOccurrence, daysUntil, countdownText as getCountdown } from '@/utils/date'

const props = defineProps({
  reminder: { type: Object, required: true }
})

defineEmits(['click'])

const typeInfo = computed(() => {
  return REMINDER_TYPES.find(t => t.key === props.reminder.type) || REMINDER_TYPES[7]
})

const typeIcon = computed(() => {
  const map = {
    birthday: 'friends',
    subscription: 'video',
    insurance: 'car',
    bill: 'balance-list',
    gift: 'gift',
    id: 'contact',
    health: 'medel',
    other: 'more-o'
  }
  return map[props.reminder.type] || 'more-o'
})

const nextDate = computed(() => getNextOccurrence(props.reminder.date, props.reminder.repeat))
const daysLeft = computed(() => daysUntil(nextDate.value))
const countdownText = computed(() => getCountdown(nextDate.value))

const repeatLabel = computed(() => {
  const map = { none: '一次性', daily: '每天', weekly: '每周', monthly: '每月', yearly: '每年' }
  return map[props.reminder.repeat] || ''
})
</script>

<style scoped>
.reminder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.reminder-item:last-child {
  border-bottom: none;
}

.reminder-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reminder-content {
  flex: 1;
  min-width: 0;
}

.reminder-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.reminder-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  flex-wrap: wrap;
}

.countdown {
  color: #6366f1;
  font-weight: 500;
}

.countdown.urgent {
  color: #ef4444;
}

.repeat-tag {
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
}
</style>
