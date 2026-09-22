<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">出门清单</span>
      <van-icon name="plus" size="20" @click="addItem" />
    </div>
    <div class="page-content">
      <div class="card" v-if="items.length > 0">
        <div v-for="item in items" :key="item.id" class="list-item">
          <div class="checkbox" :class="{ checked: item.checked }" @click="toggle(item.id)">
            <van-icon v-if="item.checked" name="success" size="14" color="#fff" />
          </div>
          <span class="item-name" :class="{ done: item.checked }">{{ item.name }}</span>
          <van-icon name="delete" size="16" color="#ccc" @click="remove(item.id)" />
        </div>
      </div>
      <div v-else class="empty">
        <van-icon name="logistics" size="48" color="#ddd" />
        <div>暂无清单，添加出门要带的东西</div>
      </div>
    </div>
    <van-dialog v-model:show="showAdd" title="添加物品" show-cancel-button @confirm="confirmAdd">
      <van-field v-model="newItem" placeholder="如：身份证、充电器" autofocus />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storage } from '@/utils/storage'

const defaultItems = [
  { id: 1, name: '身份证', checked: false },
  { id: 2, name: '手机充电器', checked: false },
  { id: 3, name: '钥匙', checked: false },
  { id: 4, name: '充电宝', checked: false }
]
const items = ref(storage.get('checklist', defaultItems))
const showAdd = ref(false)
const newItem = ref('')

const addItem = () => { newItem.value = ''; showAdd.value = true }
const confirmAdd = () => {
  if (!newItem.value.trim()) return
  items.value.push({ id: Date.now(), name: newItem.value.trim(), checked: false })
  storage.set('checklist', items.value)
}
const toggle = (id) => {
  const item = items.value.find(i => i.id === id)
  if (item) { item.checked = !item.checked; storage.set('checklist', items.value) }
}
const remove = (id) => {
  items.value = items.value.filter(i => i.id !== id)
  storage.set('checklist', items.value)
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.card { background: #fff; border-radius: 12px; padding: 4px 16px; }
.list-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f5f5f5; }
.list-item:last-child { border-bottom: none; }
.checkbox { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.checkbox.checked { background: #52c41a; border-color: #52c41a; }
.item-name { flex: 1; font-size: 14px; }
.item-name.done { text-decoration: line-through; color: #bbb; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
</style>
