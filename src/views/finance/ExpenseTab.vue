<template>
  <div class="expense-tab page">
    <!-- 本月总览 -->
    <div class="total-card">
      <div class="total-header">
        <span class="total-label">本月总支出</span>
        <span class="month-selector" @click="showMonthPicker = true">
          {{ currentMonth }} <van-icon name="arrow-down" size="12" />
        </span>
      </div>
      <div class="total-amount">¥{{ formatMoney(expensesStore.thisMonthTotal) }}</div>
      <div class="budget-bar">
        <div class="budget-track">
          <div class="budget-fill" :style="{ width: budgetPercent + '%' }"></div>
        </div>
        <div class="budget-text">
          预算 ¥{{ expensesStore.budget.total }} · 剩余 ¥{{ formatMoney(budgetRemain) }}
        </div>
      </div>
    </div>

    <!-- 分类三卡片 -->
    <div class="cat-cards">
      <div class="cat-card">
        <div class="cat-amount">¥{{ formatMoney(vehicleExpenses.byCat.fuel || 0) }}</div>
        <div class="cat-label">油费(车辆)</div>
      </div>
      <div class="cat-card">
        <div class="cat-amount">¥{{ formatMoney(thisMonthByCategory.subscription || 0) }}</div>
        <div class="cat-label">订阅会员</div>
      </div>
      <div class="cat-card">
        <div class="cat-amount">¥{{ formatMoney(otherTotal) }}</div>
        <div class="cat-label">其他</div>
      </div>
    </div>

    <!-- 订阅管理 -->
    <div class="card">
      <div class="section-header">
        <span class="section-title">订阅管理</span>
        <span class="year-cost">年成本 ¥{{ formatMoney(subscriptionYearCost) }}</span>
      </div>
      <div class="subscription-list">
        <div v-for="sub in subscriptions" :key="sub.name" class="subscription-item">
          <div class="sub-icon" :style="{ background: sub.color + '20', color: sub.color }">
            <van-icon :name="sub.icon" size="18" />
          </div>
          <div class="sub-info">
            <div class="sub-name">{{ sub.name }}</div>
            <div class="sub-freq">{{ sub.freq }}</div>
          </div>
          <div class="sub-amount">¥{{ sub.amount }}/月</div>
        </div>
      </div>
    </div>

    <!-- 车辆支出 -->
    <div class="card" v-if="vehicleExpenses.total > 0">
      <div class="section-header">
        <span class="section-title">车辆支出</span>
        <span class="year-cost">合计 ¥{{ formatMoney(vehicleExpenses.total) }}</span>
      </div>
      <div class="vehicle-cats">
        <div class="vehicle-cat">
          <div class="vc-amount">¥{{ formatMoney(vehicleExpenses.byCat.fuel || 0) }}</div>
          <div class="vc-label">油费</div>
        </div>
        <div class="vehicle-cat">
          <div class="vc-amount">¥{{ formatMoney(vehicleExpenses.byCat.parking || 0) }}</div>
          <div class="vc-label">停车</div>
        </div>
        <div class="vehicle-cat">
          <div class="vc-amount">¥{{ formatMoney(vehicleExpenses.byCat.carwash || 0) }}</div>
          <div class="vc-label">洗车</div>
        </div>
        <div class="vehicle-cat">
          <div class="vc-amount">¥{{ formatMoney(vehicleExpenses.byCat.maintenance || 0) }}</div>
          <div class="vc-label">保养</div>
        </div>
      </div>
    </div>

    <!-- 开支流水 -->
    <div class="card">
      <div class="section-header">
        <span class="section-title">开支流水</span>
      </div>
      <div style="padding: 0 16px;">
        <ExpenseItem
          v-for="e in thisMonthExpenses"
          :key="e.id"
          :expense="e"
          @click="editExpense"
        />
        <EmptyState
          v-if="thisMonthExpenses.length === 0"
          icon="balance-list"
          text="本月暂无开支"
        />
      </div>
    </div>

    <!-- 记一笔悬浮按钮 -->
    <div class="fab" @click="showAdd = true">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <!-- 添加/编辑支出弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup-content">
        <div class="popup-title">{{ editing ? '编辑支出' : '记一笔' }}</div>
        <van-field v-model.number="form.amount" label="金额" type="number" placeholder="0.00">
          <template #left-icon><span style="font-size:18px;margin-right:4px">¥</span></template>
        </van-field>
        <div class="cat-picker">
          <div class="cat-picker-label">分类</div>
          <div class="cat-grid">
            <div
              v-for="cat in categories"
              :key="cat.key"
              class="cat-option"
              :class="{ active: form.category === cat.key }"
              @click="form.category = cat.key"
            >
              <div class="cat-option-icon" :style="{ color: cat.color }">
                <van-icon :name="cat.icon" size="20" />
              </div>
              <span>{{ cat.label }}</span>
            </div>
          </div>
        </div>
        <van-field v-model="form.name" label="名称" placeholder="选填，如：加油-92号" />
        <van-field name="date" label="日期" is-link @click="showDatePicker = true">
          <template #input>{{ form.date }}</template>
        </van-field>
        <van-datetime-picker
          v-model:show="showDatePicker"
          type="date"
          @confirm="onDateConfirm"
        />
        <div class="popup-actions">
          <van-button v-if="editing" block type="danger" plain @click="deleteExpense" style="margin-bottom:10px">删除</van-button>
          <van-button block type="primary" @click="save">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExpensesStore, EXPENSE_CATEGORIES } from '@/stores/expenses'
import { today, formatDate, formatMoney } from '@/utils/date'
import ExpenseItem from '@/components/ExpenseItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const expensesStore = useExpensesStore()

const showAdd = ref(false)
const showDatePicker = ref(false)
const showMonthPicker = ref(false)
const editing = ref(null)
const currentMonth = ref(formatDate(new Date(), 'YYYY年M月'))

const categories = EXPENSE_CATEGORIES

const form = reactive({
  amount: null,
  category: 'food',
  name: '',
  date: today()
})

const thisMonthExpenses = computed(() => expensesStore.thisMonth)
const thisMonthByCategory = computed(() => expensesStore.thisMonthByCategory)
const vehicleExpenses = computed(() => expensesStore.vehicleExpenses)

const otherTotal = computed(() => {
  const total = expensesStore.thisMonthTotal
  return total - (vehicleExpenses.value.byCat.fuel || 0) - (thisMonthByCategory.value.subscription || 0)
})

const budgetPercent = computed(() => {
  if (expensesStore.budget.total === 0) return 0
  return Math.min(100, (expensesStore.thisMonthTotal / expensesStore.budget.total * 100))
})

const budgetRemain = computed(() => {
  return Math.max(0, expensesStore.budget.total - expensesStore.thisMonthTotal)
})

const subscriptions = [
  { name: '爱奇艺', amount: 25, freq: '每月', icon: 'video', color: '#52c41a' },
  { name: '腾讯视频', amount: 30, freq: '每月', icon: 'video', color: '#f5222d' },
  { name: '网易云音乐', amount: 15, freq: '每月', icon: 'music', color: '#f5222d' },
  { name: 'iCloud', amount: 6, freq: '每月', icon: 'cloud', color: '#4A90D9' },
  { name: '百度网盘', amount: 30, freq: '每月', icon: 'cloud', color: '#1890ff' },
  { name: '健身房', amount: 200, freq: '每月', icon: 'fire', color: '#fa8c16' }
]

const subscriptionYearCost = computed(() => subscriptions.reduce((s, sub) => s + sub.amount * 12, 0))

const onDateConfirm = ({ selectedValues }) => {
  form.date = formatDate(new Date(selectedValues[0]), 'YYYY-MM-DD')
}

const editExpense = (e) => {
  editing.value = e
  Object.assign(form, {
    amount: e.amount,
    category: e.category,
    name: e.name,
    date: e.date
  })
  showAdd.value = true
}

const save = () => {
  if (!form.amount || form.amount <= 0) return
  if (editing.value) {
    expensesStore.update(editing.value.id, { ...form })
  } else {
    expensesStore.add({ ...form })
  }
  close()
}

const deleteExpense = () => {
  if (editing.value) {
    expensesStore.remove(editing.value.id)
  }
  close()
}

const close = () => {
  showAdd.value = false
  editing.value = null
  Object.assign(form, { amount: null, category: 'food', name: '', date: today() })
}

onMounted(() => {
  if (route.query.add === '1') {
    showAdd.value = true
  }
})
</script>

<style scoped>
.expense-tab {
  padding: 12px;
  padding-bottom: 90px;
}

.total-card {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
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
  opacity: 0.9;
}

.month-selector {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
}

.total-amount {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 12px;
}

.budget-track {
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.budget-fill {
  height: 100%;
  background: #fff;
  border-radius: 3px;
  transition: width 0.3s;
}

.budget-text {
  font-size: 11px;
  opacity: 0.85;
}

.cat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.cat-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.cat-amount {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.cat-label {
  font-size: 11px;
  color: #999;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
}

.year-cost {
  font-size: 12px;
  color: #6366f1;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.subscription-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.subscription-item:last-child {
  border-bottom: none;
}

.sub-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-info {
  flex: 1;
}

.sub-name {
  font-size: 14px;
  color: #333;
}

.sub-freq {
  font-size: 11px;
  color: #999;
}

.sub-amount {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.vehicle-cats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.vehicle-cat {
  text-align: center;
}

.vc-amount {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.vc-label {
  font-size: 11px;
  color: #999;
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(245, 34, 45, 0.3);
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

.cat-picker {
  padding: 12px 16px;
}

.cat-picker-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cat-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border-radius: 8px;
  font-size: 11px;
  color: #666;
  cursor: pointer;
  border: 1px solid transparent;
}

.cat-option.active {
  background: #eef2ff;
  border-color: #6366f1;
  color: #6366f1;
}

.cat-option-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-actions {
  margin-top: 20px;
}
</style>
