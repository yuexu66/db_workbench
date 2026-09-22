<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">购物清单</span>
      <van-icon name="plus" size="20" @click="addItem" />
    </div>
    <div class="page-content">
      <div class="card">
        <div class="progress-text">已买 {{ checkedCount }}/{{ items.length }}</div>
        <div class="progress-bar"><div class="progress-fill" :style="{ width: percent + '%' }"></div></div>
      </div>
      <div class="card" v-if="items.length > 0">
        <div v-for="item in items" :key="item.id" class="shop-item">
          <div class="checkbox" :class="{ checked: item.checked }" @click="toggle(item.id)">
            <van-icon v-if="item.checked" name="success" size="14" color="#fff" />
          </div>
          <span class="item-name" :class="{ done: item.checked }">{{ item.name }}</span>
          <van-icon name="delete" size="16" color="#ccc" @click="remove(item.id)" />
        </div>
      </div>
      <div v-else class="empty">
        <van-icon name="shopping-cart-o" size="48" color="#ddd" />
        <div>暂无购物清单</div>
      </div>
    </div>
    <van-dialog v-model:show="showAdd" title="添加物品" show-cancel-button @confirm="confirmAdd">
      <van-field v-model="newItem" placeholder="输入物品名称" autofocus />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'

const items = ref(storage.get('shopping', []))
const showAdd = ref(false)
const newItem = ref('')

const checkedCount = computed(() => items.value.filter(i => i.checked).length)
const percent = computed(() => items.value.length ? (checkedCount.value / items.value.length * 100) : 0)

const addItem = () => { newItem.value = ''; showAdd.value = true }
const confirmAdd = () => {
  if (!newItem.value.trim()) return
  items.value.push({ id: Date.now(), name: newItem.value.trim(), checked: false })
  storage.set('shopping', items.value)
}
const toggle = (id) => {
  const item = items.value.find(i => i.id === id)
  if (item) { item.checked = !item.checked; storage.set('shopping', items.value) }
}
const remove = (id) => {
  items.value = items.value.filter(i => i.id !== id)
  storage.set('shopping', items.value)
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.progress-text { font-size: 13px; color: #666; margin-bottom: 8px; }
.progress-bar { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #52c41a; border-radius: 3px; transition: width 0.3s; }
.shop-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.shop-item:last-child { border-bottom: none; }
.checkbox { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.checkbox.checked { background: #52c41a; border-color: #52c41a; }
.item-name { flex: 1; font-size: 14px; }
.item-name.done { text-decoration: line-through; color: #bbb; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
</style>
