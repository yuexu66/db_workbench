<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">快递追踪</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="page-content">
      <div v-if="items.length === 0" class="empty">
        <van-icon name="logistics" size="48" color="#ddd" />
        <div>暂无快递</div>
      </div>
      <div v-else class="express-list">
        <div v-for="item in items" :key="item.id" class="express-card">
          <div class="exp-top">
            <span class="exp-name">{{ item.name }}</span>
            <van-tag :type="statusType(item.status)" size="medium">{{ item.status }}</van-tag>
          </div>
          <div class="exp-no">单号：{{ item.trackingNo }}</div>
          <div class="exp-desc">{{ item.desc || '暂无物流信息' }}</div>
          <div class="exp-bottom">
            <span class="exp-date">{{ item.date }}</span>
            <van-icon name="delete" size="16" color="#ccc" @click="remove(item.id)" />
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">添加快递</div>
        <van-field v-model="form.name" label="物品名称" placeholder="如：淘宝买的衣服" />
        <van-field v-model="form.trackingNo" label="快递单号" placeholder="选填" />
        <van-field name="status" label="状态">
          <template #input>
            <van-radio-group v-model="form.status" direction="horizontal">
              <van-radio name="运输中">运输中</van-radio>
              <van-radio name="已签收">已签收</van-radio>
              <van-radio name="待发货">待发货</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model="form.desc" label="备注" placeholder="选填" />
        <div class="popup-actions"><van-button block type="primary" @click="save">保存</van-button></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storage } from '@/utils/storage'
import { today } from '@/utils/date'

const items = ref(storage.get('express', []))
const showAdd = ref(false)
const form = reactive({ name: '', trackingNo: '', status: '运输中', desc: '' })

const statusType = (s) => s === '已签收' ? 'success' : s === '待发货' ? 'warning' : 'primary'

const save = () => {
  if (!form.name.trim()) return
  items.value.unshift({ id: Date.now(), ...form, date: today() })
  storage.set('express', items.value)
  showAdd.value = false
  Object.assign(form, { name: '', trackingNo: '', status: '运输中', desc: '' })
}

const remove = (id) => {
  items.value = items.value.filter(i => i.id !== id)
  storage.set('express', items.value)
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.express-list { display: flex; flex-direction: column; gap: 10px; }
.express-card { background: #fff; border-radius: 12px; padding: 14px; }
.exp-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.exp-name { font-size: 15px; font-weight: 600; }
.exp-no { font-size: 12px; color: #999; margin-bottom: 6px; }
.exp-desc { font-size: 13px; color: #666; margin-bottom: 10px; }
.exp-bottom { display: flex; justify-content: space-between; align-items: center; }
.exp-date { font-size: 11px; color: #ccc; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 20px; }
</style>
