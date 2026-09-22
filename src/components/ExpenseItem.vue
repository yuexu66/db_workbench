<template>
  <div class="expense-item" @click="$emit('click', expense)">
    <div class="expense-icon" :style="{ background: catInfo.color + '20', color: catInfo.color }">
      <van-icon :name="catInfo.icon" size="18" />
    </div>
    <div class="expense-content">
      <div class="expense-name">{{ expense.name }}</div>
      <div class="expense-date">{{ expense.date }}</div>
    </div>
    <div class="expense-amount">-¥{{ formatMoney(expense.amount) }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EXPENSE_CATEGORIES } from '@/stores/expenses'
import { formatMoney } from '@/utils/date'

const props = defineProps({
  expense: { type: Object, required: true }
})

defineEmits(['click'])

const catInfo = computed(() => {
  return EXPENSE_CATEGORIES.find(c => c.key === props.expense.category) || EXPENSE_CATEGORIES[13]
})
</script>

<style scoped>
.expense-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.expense-item:last-child {
  border-bottom: none;
}

.expense-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expense-content {
  flex: 1;
  min-width: 0;
}

.expense-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.expense-date {
  font-size: 12px;
  color: #999;
}

.expense-amount {
  font-size: 15px;
  font-weight: 600;
  color: #ef4444;
  flex-shrink: 0;
}
</style>
