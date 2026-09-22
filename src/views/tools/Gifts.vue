<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">人情往来</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="summary card">
      <div class="sum-item">
        <div class="sum-num">¥{{ formatMoney(totalOut) }}</div>
        <div class="sum-label">本年随出</div>
      </div>
      <div class="sum-item">
        <div class="sum-num">¥{{ formatMoney(totalIn) }}</div>
        <div class="sum-label">本年收入</div>
      </div>
    </div>
    <div class="page-content">
      <div v-if="items.length === 0" class="empty">
        <van-icon name="gift-o" size="48" color="#ddd" />
        <div>暂无记录</div>
      </div>
      <div v-else class="card">
        <div v-for="item in items" :key="item.id" class="gift-item">
          <div class="gift-icon" :class="item.type">
            <van-icon :name="item.type === 'out' ? 'arrow-up' : 'arrow-down'" size="16" color="#fff" />
          </div>
          <div class="gift-info">
            <div class="gift-name">{{ item.name }} · {{ item.event }}</div>
            <div class="gift-date">{{ item.date }}</div>
          </div>
          <div class="gift-amount" :class="item.type">{{ item.type === 'out' ? '-' : '+' }}¥{{ formatMoney(item.amount) }}</div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">添加记录</div>
        <van-field name="type" label="类型">
          <template #input>
            <van-radio-group v-model="form.type" direction="horizontal">
              <van-radio name="out">随出</van-radio>
              <van-radio name="in">收入</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model="form.name" label="姓名" placeholder="如：李哥" />
        <van-field v-model="form.event" label="事由" placeholder="如：孩子满月酒" />
        <van-field v-model.number="form.amount" label="金额" type="number" placeholder="0.00" />
        <van-field name="date" label="日期" is-link @click="openDatePicker">
          <template #input>{{ form.date }}</template>
        </van-field>
        <van-popup v-model:show="showDate" position="bottom" round>
          <van-date-picker v-model="currentDate" title="选择日期" @confirm="onDate" @cancel="showDate = false" />
        </van-popup>
        <div class="popup-actions"><van-button block type="primary" @click="save">保存</van-button></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { storage } from '@/utils/storage'
import { today, formatDate, formatMoney } from '@/utils/date'

const items = ref(storage.get('gifts', []))
const showAdd = ref(false)
const showDate = ref(false)
const currentDate = ref(['2024', '01', '01'])
const form = reactive({ type: 'out', name: '', event: '', amount: null, date: today() })

const currentYear = new Date().getFullYear()
const totalOut = computed(() => items.value.filter(i => i.type === 'out' && i.date.startsWith(String(currentYear))).reduce((s, i) => s + Number(i.amount), 0))
const totalIn = computed(() => items.value.filter(i => i.type === 'in' && i.date.startsWith(String(currentYear))).reduce((s, i) => s + Number(i.amount), 0))

const openDatePicker = () => {
  const d = form.date ? new Date(form.date + 'T00:00:00') : new Date()
  currentDate.value = [String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')]
  showDate.value = true
}

const onDate = ({ selectedValues }) => { form.date = selectedValues.join('-'); showDate.value = false }

const save = () => {
  if (!form.name.trim() || !form.amount) return
  items.value.unshift({ id: Date.now(), ...form })
  storage.set('gifts', items.value)
  showAdd.value = false
  Object.assign(form, { type: 'out', name: '', event: '', amount: null, date: today() })
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.summary { display: flex; margin: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; }
.sum-item { flex: 1; text-align: center; }
.sum-num { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 4px; }
.sum-label { font-size: 12px; color: #999; }
.page-content { padding: 0 12px 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.gift-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.gift-item:last-child { border-bottom: none; }
.gift-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.gift-icon.out { background: #fa8c16; }
.gift-icon.in { background: #52c41a; }
.gift-info { flex: 1; }
.gift-name { font-size: 14px; font-weight: 500; }
.gift-date { font-size: 11px; color: #999; margin-top: 2px; }
.gift-amount { font-size: 15px; font-weight: 600; }
.gift-amount.out { color: #fa8c16; }
.gift-amount.in { color: #52c41a; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 20px; }
</style>
