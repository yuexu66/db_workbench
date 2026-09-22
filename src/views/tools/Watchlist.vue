<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">想看清单</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="tabs">
      <div v-for="t in types" :key="t.key" class="tab" :class="{ active: activeType === t.key }" @click="activeType = t.key">{{ t.label }}</div>
    </div>
    <div class="page-content">
      <div v-if="filtered.length === 0" class="empty">
        <van-icon name="star" size="48" color="#ddd" />
        <div>暂无内容</div>
      </div>
      <div v-else class="watch-list">
        <div v-for="item in filtered" :key="item.id" class="watch-card">
          <div class="watch-info">
            <div class="watch-title">{{ item.title }}</div>
            <div class="watch-meta">{{ item.type === 'movie' ? '电影' : item.type === 'book' ? '书籍' : '其他' }} · {{ item.date }}</div>
          </div>
          <div class="watch-actions">
            <van-tag :type="item.watched ? 'success' : 'primary'" size="medium">{{ item.watched ? '已看' : '想看' }}</van-tag>
            <van-icon name="delete" size="16" color="#ccc" @click="remove(item.id)" />
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">添加想看</div>
        <van-field v-model="form.title" label="名称" placeholder="如：流浪地球2" />
        <van-field name="type" label="类型">
          <template #input>
            <van-radio-group v-model="form.type" direction="horizontal">
              <van-radio name="movie">电影</van-radio>
              <van-radio name="book">书籍</van-radio>
              <van-radio name="other">其他</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="watched" label="状态">
          <template #input>
            <van-radio-group v-model="form.watched" direction="horizontal">
              <van-radio :name="false">想看</van-radio>
              <van-radio :name="true">已看</van-radio>
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
import { today } from '@/utils/date'

const items = ref(storage.get('watchlist', []))
const showAdd = ref(false)
const activeType = ref('all')
const types = [{ key: 'all', label: '全部' }, { key: 'movie', label: '电影' }, { key: 'book', label: '书籍' }, { key: 'other', label: '其他' }]
const form = reactive({ title: '', type: 'movie', watched: false })

const filtered = computed(() => activeType.value === 'all' ? items.value : items.value.filter(i => i.type === activeType.value))

const save = () => {
  if (!form.title.trim()) return
  items.value.unshift({ id: Date.now(), ...form, date: today() })
  storage.set('watchlist', items.value)
  showAdd.value = false
  form.title = ''; form.type = 'movie'; form.watched = false
}

const remove = (id) => {
  items.value = items.value.filter(i => i.id !== id)
  storage.set('watchlist', items.value)
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; }
.page-title { font-size: 17px; font-weight: 600; }
.tabs { display: flex; background: #fff; padding: 0 16px 12px; gap: 16px; border-bottom: 1px solid #f0f0f0; }
.tab { font-size: 14px; color: #999; padding-bottom: 8px; cursor: pointer; }
.tab.active { color: #4A90D9; font-weight: 600; border-bottom: 2px solid #4A90D9; }
.page-content { padding: 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.watch-list { display: flex; flex-direction: column; gap: 10px; }
.watch-card { background: #fff; border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center; }
.watch-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.watch-meta { font-size: 11px; color: #999; }
.watch-actions { display: flex; align-items: center; gap: 12px; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 20px; }
</style>
