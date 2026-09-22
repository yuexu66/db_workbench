<template>
  <div class="asset-tab page">
    <!-- 总资产概览 -->
    <div class="total-card">
      <div class="total-header">
        <span class="total-label">总资产</span>
        <span class="refresh-btn" @click="refresh" :class="{ loading: assetsStore.refreshing }">
          <van-icon name="replay" size="14" />
          {{ assetsStore.refreshing ? '刷新中' : '刷新' }}
        </span>
      </div>
      <div class="total-amount">¥{{ formatMoney(assetsStore.totalAmount) }}</div>
      <div class="total-change" :class="profitClass">
        <van-icon :name="profitClass === 'up' ? 'arrow-up' : 'arrow-down'" size="12" />
        较昨日 {{ dayChangeText }} · {{ profitText }}
      </div>
    </div>

    <!-- 收益统计三卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">累计收益</div>
        <div class="stat-amount" :class="profitClass">
          {{ assetsStore.totalProfit >= 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(assetsStore.totalProfit)) }}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月收益</div>
        <div class="stat-amount up">+¥1,860</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今年收益率</div>
        <div class="stat-amount up">{{ assetsStore.profitRate.toFixed(2) }}%</div>
      </div>
    </div>

    <!-- 资产分布 -->
    <div class="card">
      <div class="section-title">资产分布</div>
      <div class="distribution">
        <div class="donut-container">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle v-for="(seg, i) in donutSegments" :key="i"
              cx="60" cy="60" r="45" fill="none"
              :stroke="seg.color" stroke-width="18"
              :stroke-dasharray="seg.dash + ' ' + (circumference - seg.dash)"
              :stroke-dashoffset="-seg.offset"
              transform="rotate(-90 60 60)" />
          </svg>
          <div class="donut-center">
            <div class="donut-total">¥{{ formatMoney(assetsStore.totalAmount) }}</div>
          </div>
        </div>
        <div class="legend">
          <div v-for="t in assetTypesWithAmount" :key="t.key" class="legend-item">
            <span class="legend-dot" :style="{ background: t.color }"></span>
            <span class="legend-label">{{ t.label }}</span>
            <span class="legend-value">{{ t.percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 持仓明细 -->
    <div class="card">
      <div class="section-header">
        <span class="section-title">持仓明细</span>
        <span v-if="assetsStore.lastRefresh" class="refresh-time">
          更新于 {{ formatDate(assetsStore.lastRefresh, 'MM-DD HH:mm') }}
        </span>
      </div>
      <div style="padding: 0 16px;">
        <AssetItem
          v-for="a in assetsStore.list"
          :key="a.id"
          :asset="a"
          @click="editAsset"
        />
        <EmptyState
          v-if="assetsStore.list.length === 0"
          icon="gold-coin-o"
          text="暂无持仓"
          action-text="添加持仓"
          @action="showAdd = true"
        />
      </div>
    </div>

    <!-- 添加持仓悬浮按钮 -->
    <div class="fab" @click="showAdd = true">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <!-- 添加/编辑持仓弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup-content">
        <div class="popup-title">{{ editing ? '编辑持仓' : '添加持仓' }}</div>
        <van-field name="type" label="资产类型">
          <template #input>
            <van-radio-group v-model="form.type" direction="horizontal">
              <van-radio v-for="t in ASSET_TYPES" :key="t.key" :name="t.key">{{ t.label }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model="form.name" label="名称" placeholder="如：易方达蓝筹精选混合" />
        <van-field v-model="form.code" label="基金代码" placeholder="选填，用于自动刷新净值" />
        <van-field v-model.number="form.costAmount" label="买入金额" type="number" placeholder="0.00" />
        <van-field v-model.number="form.shares" label="持有份额" type="number" placeholder="选填" />
        <van-field v-model.number="form.currentAmount" label="当前市值" type="number" placeholder="不填则默认等于买入金额" />
        <van-field name="buyDate" label="买入日期" is-link @click="showDatePicker = true">
          <template #input>{{ form.buyDate || '请选择' }}</template>
        </van-field>
        <van-datetime-picker v-model:show="showDatePicker" type="date" @confirm="onDateConfirm" />
        <div class="popup-actions">
          <van-button v-if="editing" block type="danger" plain @click="deleteAsset" style="margin-bottom:10px">删除</van-button>
          <van-button block type="primary" @click="save">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useAssetsStore, ASSET_TYPES } from '@/stores/assets'
import { formatMoney, formatDate, today } from '@/utils/date'
import AssetItem from '@/components/AssetItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const assetsStore = useAssetsStore()

const showAdd = ref(false)
const showDatePicker = ref(false)
const editing = ref(null)

const form = reactive({
  type: 'fund',
  name: '',
  code: '',
  costAmount: null,
  shares: null,
  currentAmount: null,
  buyDate: today()
})

const circumference = 2 * Math.PI * 45

const profitClass = computed(() => assetsStore.totalProfit >= 0 ? 'up' : 'down')

const dayChangeText = computed(() => {
  const total = assetsStore.list.reduce((s, a) => s + (a.dayProfit || 0), 0)
  return `${total >= 0 ? '+' : ''}¥${formatMoney(Math.abs(total))}`
})

const profitText = computed(() => {
  return `${assetsStore.totalProfit >= 0 ? '+' : ''}${assetsStore.profitRate.toFixed(2)}%`
})

const assetTypesWithAmount = computed(() => {
  const total = assetsStore.totalAmount
  return ASSET_TYPES.map(t => {
    const amount = assetsStore.byType[t.key] || 0
    return {
      ...t,
      amount,
      percent: total > 0 ? (amount / total * 100).toFixed(1) : 0
    }
  }).filter(t => t.amount > 0)
})

const donutSegments = computed(() => {
  const total = assetsStore.totalAmount
  if (total === 0) return []
  let offset = 0
  return assetTypesWithAmount.value.map(t => {
    const dash = (t.amount / total) * circumference
    const seg = { color: t.color, dash, offset }
    offset += dash
    return seg
  })
})

const refresh = async () => {
  const result = await assetsStore.refreshAll()
  if (result.success) {
    showToast(`刷新完成：更新${result.updated}只${result.failed > 0 ? `，失败${result.failed}只` : ''}`)
  } else {
    showToast('刷新失败，请稍后重试')
  }
}

const onDateConfirm = ({ selectedValues }) => {
  form.buyDate = formatDate(new Date(selectedValues[0]), 'YYYY-MM-DD')
}

const editAsset = (a) => {
  editing.value = a
  Object.assign(form, {
    type: a.type,
    name: a.name,
    code: a.code || '',
    costAmount: a.costAmount,
    shares: a.shares,
    currentAmount: a.currentAmount,
    buyDate: a.buyDate || today()
  })
  showAdd.value = true
}

const save = () => {
  if (!form.name.trim() || !form.costAmount) return
  const data = { ...form }
  if (!data.currentAmount) data.currentAmount = data.costAmount
  if (editing.value) {
    assetsStore.update(editing.value.id, data)
  } else {
    assetsStore.add(data)
  }
  close()
}

const deleteAsset = () => {
  if (editing.value) {
    assetsStore.remove(editing.value.id)
  }
  close()
}

const close = () => {
  showAdd.value = false
  editing.value = null
  Object.assign(form, { type: 'fund', name: '', code: '', costAmount: null, shares: null, currentAmount: null, buyDate: today() })
}

onMounted(() => {
  if (route.query.add === '1') {
    showAdd.value = true
  }
})
</script>

<style scoped>
.asset-tab {
  padding: 12px;
  padding-bottom: 90px;
}

.total-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 14px;
  padding: 18px;
  color: #fff;
  margin-bottom: 12px;
}

.total-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-label {
  font-size: 13px;
  opacity: 0.7;
}

.refresh-btn {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
  cursor: pointer;
}

.refresh-btn.loading {
  opacity: 0.5;
}

.total-amount {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 8px;
}

.total-change {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.total-change.up { color: #f87171; }
.total-change.down { color: #34d399; }

.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
}

.stat-amount {
  font-size: 15px;
  font-weight: 600;
}

.stat-amount.up { color: #ef4444; }
.stat-amount.down { color: #10b981; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.refresh-time {
  font-size: 11px;
  color: #999;
}

.distribution {
  display: flex;
  align-items: center;
  gap: 20px;
}

.donut-container {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-total {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  color: #666;
}

.legend-value {
  color: #333;
  font-weight: 500;
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  z-index: 50;
  cursor: pointer;
}

.popup-content {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  max-height: 85vh;
  overflow-y: auto;
}

.popup-title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.popup-actions {
  margin-top: 20px;
}
</style>
