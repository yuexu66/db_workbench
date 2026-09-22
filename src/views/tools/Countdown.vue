<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">倒数日</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="page-content">
      <div v-if="items.length === 0" class="empty">
        <van-icon name="clock-o" size="48" color="#ddd" />
        <div>暂无倒数日</div>
      </div>
      <div v-else class="countdown-list">
        <div v-for="item in sortedItems" :key="item.id" class="countdown-card" :style="{ background: item.color }">
          <div class="cd-top">
            <span class="cd-title">{{ item.title }}</span>
            <van-icon name="delete" size="16" color="rgba(255,255,255,0.7)" @click="remove(item.id)" />
          </div>
          <div class="cd-days">{{ daysText(item) }}</div>
          <div class="cd-date">{{ item.targetDate }}</div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">添加倒数日</div>
        <van-field v-model="form.title" label="名称" placeholder="如：国庆休假" />
        <van-field name="targetDate" label="目标日期" is-link @click="openDatePicker">
          <template #input>{{ form.targetDate || '请选择' }}</template>
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
import { daysUntil, formatDate } from '@/utils/date'

const items = ref(storage.get('countdown', []))
const showAdd = ref(false)
const showDate = ref(false)
const currentDate = ref(['2024', '01', '01'])
const colors = ['linear-gradient(135deg,#69c0ff,#1890ff)', 'linear-gradient(135deg,#95de64,#52c41a)', 'linear-gradient(135deg,#ff9c6e,#fa541c)', 'linear-gradient(135deg,#b37feb,#722ed1)']
const form = reactive({ title: '', targetDate: '' })

const sortedItems = computed(() => [...items.value].sort((a, b) => Math.abs(daysUntil(a.targetDate)) - Math.abs(daysUntil(b.targetDate))))

const daysText = (item) => {
  const d = daysUntil(item.targetDate)
  if (d === 0) return '就是今天'
  if (d > 0) return `还有 ${d} 天`
  return `已过 ${Math.abs(d)} 天`
}

const openDatePicker = () => {
  const d = form.targetDate ? new Date(form.targetDate + 'T00:00:00') : new Date()
  currentDate.value = [String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')]
  showDate.value = true
}

const onDate = ({ selectedValues }) => { form.targetDate = selectedValues.join('-'); showDate.value = false }

const save = () => {
  if (!form.title.trim() || !form.targetDate) return
  items.value.push({ id: Date.now(), ...form, color: colors[items.value.length % colors.length] })
  storage.set('countdown', items.value)
  showAdd.value = false
  form.title = ''; form.targetDate = ''
}

const remove = (id) => {
  items.value = items.value.filter(i => i.id !== id)
  storage.set('countdown', items.value)
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.countdown-list { display: flex; flex-direction: column; gap: 12px; }
.countdown-card { border-radius: 14px; padding: 18px; color: #fff; }
.cd-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.cd-title { font-size: 16px; font-weight: 600; }
.cd-days { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
.cd-date { font-size: 12px; opacity: 0.8; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 20px; }
</style>
