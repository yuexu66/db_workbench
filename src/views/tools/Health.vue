<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">健康提醒</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="page-content">
      <div v-if="items.length === 0" class="empty">
        <van-icon name="medal-o" size="48" color="#ddd" />
        <div>暂无健康提醒</div>
      </div>
      <div v-else class="health-list">
        <div v-for="item in items" :key="item.id" class="health-card">
          <div class="health-top">
            <div class="health-icon" :style="{ background: typeColor(item.type) + '20', color: typeColor(item.type) }">
              <van-icon :name="typeIcon(item.type)" size="20" />
            </div>
            <div class="health-info">
              <div class="health-title">{{ item.title }}</div>
              <div class="health-type">{{ item.type }}</div>
            </div>
            <van-icon name="delete" size="16" color="#ccc" @click="remove(item.id)" />
          </div>
          <div class="health-date">
            <van-icon name="calendar" size="12" />
            {{ item.date }} · {{ item.repeat === 'none' ? '一次性' : item.repeat === 'yearly' ? '每年' : '自定义' }}
          </div>
          <div v-if="item.remark" class="health-remark">{{ item.remark }}</div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">添加健康提醒</div>
        <van-field v-model="form.title" label="名称" placeholder="如：年度体检" />
        <van-field name="type" label="类型">
          <template #input>
            <van-radio-group v-model="form.type" direction="horizontal">
              <van-radio name="体检">体检</van-radio>
              <van-radio name="疫苗">疫苗</van-radio>
              <van-radio name="吃药">吃药</van-radio>
              <van-radio name="复诊">复诊</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="date" label="日期" is-link @click="openDatePicker">
          <template #input>{{ form.date || '请选择' }}</template>
        </van-field>
        <van-popup v-model:show="showDate" position="bottom" round>
          <van-date-picker v-model="currentDate" title="选择日期" @confirm="onDate" @cancel="showDate = false" />
        </van-popup>
        <van-field name="repeat" label="重复">
          <template #input>
            <van-radio-group v-model="form.repeat" direction="horizontal">
              <van-radio name="none">一次性</van-radio>
              <van-radio name="yearly">每年</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model="form.remark" label="备注" placeholder="选填" />
        <div class="popup-actions"><van-button block type="primary" @click="save">保存</van-button></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storage } from '@/utils/storage'
import { today, formatDate } from '@/utils/date'

const items = ref(storage.get('health', []))
const showAdd = ref(false)
const showDate = ref(false)
const currentDate = ref(['2024', '01', '01'])
const form = reactive({ title: '', type: '体检', date: '', repeat: 'yearly', remark: '' })

const typeColor = (t) => ({ 体检: '#13c2c2', 疫苗: '#52c41a', 吃药: '#fa8c16', 复诊: '#722ed1' }[t] || '#13c2c2')
const typeIcon = (t) => ({ 体检: 'medal-o', 疫苗: 'shield-o', 吃药: 'balance-list-o', 复诊: 'chat-o' }[t] || 'medal-o')

const openDatePicker = () => {
  const d = form.date ? new Date(form.date + 'T00:00:00') : new Date()
  currentDate.value = [String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')]
  showDate.value = true
}

const onDate = ({ selectedValues }) => { form.date = selectedValues.join('-'); showDate.value = false }

const save = () => {
  if (!form.title.trim() || !form.date) return
  items.value.unshift({ id: Date.now(), ...form })
  storage.set('health', items.value)
  showAdd.value = false
  Object.assign(form, { title: '', type: '体检', date: '', repeat: 'yearly', remark: '' })
}

const remove = (id) => {
  items.value = items.value.filter(i => i.id !== id)
  storage.set('health', items.value)
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.health-list { display: flex; flex-direction: column; gap: 10px; }
.health-card { background: #fff; border-radius: 12px; padding: 14px; }
.health-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.health-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.health-info { flex: 1; }
.health-title { font-size: 15px; font-weight: 600; }
.health-type { font-size: 12px; color: #999; margin-top: 2px; }
.health-date { font-size: 12px; color: #666; display: flex; align-items: center; gap: 4px; }
.health-remark { font-size: 12px; color: #999; margin-top: 6px; padding-top: 8px; border-top: 1px solid #f5f5f5; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); max-height: 80vh; overflow-y: auto; }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 20px; }
</style>
