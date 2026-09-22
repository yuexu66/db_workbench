<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">报销记录</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="summary card">
      <div class="sum-item">
        <div class="sum-num">¥{{ formatMoney(total) }}</div>
        <div class="sum-label">待报销</div>
      </div>
      <div class="sum-item">
        <div class="sum-num">{{ pendingCount }}</div>
        <div class="sum-label">笔数</div>
      </div>
    </div>
    <div class="page-content">
      <div v-if="items.length === 0" class="empty">
        <van-icon name="gold-coin" size="48" color="#ddd" />
        <div>暂无报销记录</div>
      </div>
      <div v-else class="card">
        <div v-for="item in items" :key="item.id" class="reim-item">
          <div class="reim-info">
            <div class="reim-title">{{ item.title }}</div>
            <div class="reim-date">{{ item.date }} · {{ item.category }}</div>
          </div>
          <div class="reim-right">
            <div class="reim-amount">¥{{ formatMoney(item.amount) }}</div>
            <van-tag :type="item.status === '已报销' ? 'success' : 'warning'" size="small">{{ item.status }}</van-tag>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">添加报销</div>
        <van-field v-model="form.title" label="事项" placeholder="如：出差打车" />
        <van-field v-model.number="form.amount" label="金额" type="number" placeholder="0.00" />
        <van-field v-model="form.category" label="分类" placeholder="如：交通、餐饮" />
        <van-field name="status" label="状态">
          <template #input>
            <van-radio-group v-model="form.status" direction="horizontal">
              <van-radio name="待报销">待报销</van-radio>
              <van-radio name="已报销">已报销</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <div class="popup-actions"><van-button block type="primary" @click="save">保存</van-button></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { storage } from '@/utils/storage'
import { today, formatMoney } from '@/utils/date'

const items = ref(storage.get('reimburse', []))
const showAdd = ref(false)
const form = reactive({ title: '', amount: null, category: '', status: '待报销' })

const pendingCount = computed(() => items.value.filter(i => i.status === '待报销').length)
const total = computed(() => items.value.filter(i => i.status === '待报销').reduce((s, i) => s + Number(i.amount), 0))

const save = () => {
  if (!form.title.trim() || !form.amount) return
  items.value.unshift({ id: Date.now(), ...form, date: today() })
  storage.set('reimburse', items.value)
  showAdd.value = false
  Object.assign(form, { title: '', amount: null, category: '', status: '待报销' })
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.summary { display: flex; margin: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; }
.sum-item { flex: 1; text-align: center; }
.sum-num { font-size: 22px; font-weight: 700; color: #fa8c16; margin-bottom: 4px; }
.sum-label { font-size: 12px; color: #999; }
.page-content { padding: 0 12px 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.reim-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f5f5f5; }
.reim-item:last-child { border-bottom: none; }
.reim-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.reim-date { font-size: 11px; color: #999; }
.reim-right { text-align: right; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
.reim-amount { font-size: 16px; font-weight: 600; color: #333; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 20px; }
</style>
