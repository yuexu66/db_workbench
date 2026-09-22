<template>
  <div class="asset-item" @click="$emit('click', asset)">
    <div class="asset-icon" :style="{ background: typeInfo.color + '20', color: typeInfo.color }">
      <van-icon name="gold-coin" size="18" />
    </div>
    <div class="asset-content">
      <div class="asset-name">{{ asset.name }}</div>
      <div class="asset-meta">
        <span>¥{{ formatMoney(asset.currentAmount) }}</span>
        <span class="change" :class="profitClass">{{ profitText }}</span>
      </div>
    </div>
    <div class="asset-right">
      <div class="daily-change" :class="changeClass">
        {{ asset.dailyChange > 0 ? '+' : '' }}{{ asset.dailyChange?.toFixed(2) }}%
      </div>
      <div class="total-profit" :class="profitClass">
        {{ totalProfit >= 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(totalProfit)) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ASSET_TYPES } from '@/stores/assets'
import { formatMoney } from '@/utils/date'

const props = defineProps({
  asset: { type: Object, required: true }
})

defineEmits(['click'])

const typeInfo = computed(() => {
  return ASSET_TYPES.find(t => t.key === props.asset.type) || ASSET_TYPES[5]
})

const totalProfit = computed(() => {
  return Number(props.asset.currentAmount || 0) - Number(props.asset.costAmount || 0)
})

const profitRate = computed(() => {
  if (props.asset.costAmount === 0) return 0
  return (totalProfit.value / props.asset.costAmount * 100).toFixed(2)
})

const profitText = computed(() => {
  return `${totalProfit.value >= 0 ? '+' : ''}${profitRate.value}%`
})

const profitClass = computed(() => totalProfit.value >= 0 ? 'up' : 'down')
const changeClass = computed(() => (props.asset.dailyChange || 0) >= 0 ? 'up' : 'down')
</script>

<style scoped>
.asset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.asset-item:last-child {
  border-bottom: none;
}

.asset-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.asset-content {
  flex: 1;
  min-width: 0;
}

.asset-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.change {
  font-weight: 500;
}

.asset-right {
  text-align: right;
  flex-shrink: 0;
}

.daily-change {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.total-profit {
  font-size: 11px;
}

.up { color: #ef4444; }
.down { color: #10b981; }
</style>
