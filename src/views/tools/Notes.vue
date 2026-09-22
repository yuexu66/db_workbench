<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">快速便签</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="page-content">
      <div v-if="notes.length === 0" class="empty">
        <van-icon name="edit" size="48" color="#ddd" />
        <div>暂无便签，点击右上角添加</div>
      </div>
      <div v-else class="note-grid">
        <div v-for="note in notes" :key="note.id" class="note-card" :style="{ background: note.color }" @click="edit(note)">
          <div class="note-content">{{ note.content }}</div>
          <div class="note-date">{{ note.date }}</div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">{{ editing ? '编辑便签' : '新建便签' }}</div>
        <van-field v-model="form.content" type="textarea" rows="4" placeholder="写点什么..." />
        <div class="color-picker">
          <div v-for="c in colors" :key="c" class="color-dot" :style="{ background: c }" :class="{ active: form.color === c }" @click="form.color = c"></div>
        </div>
        <div class="popup-actions">
          <van-button v-if="editing" block type="danger" plain @click="del" style="margin-bottom:10px">删除</van-button>
          <van-button block type="primary" @click="save">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storage } from '@/utils/storage'
import { today } from '@/utils/date'

const notes = ref(storage.get('notes', []))
const showAdd = ref(false)
const editing = ref(null)
const colors = ['#fff9e6', '#e6f7ff', '#f6ffed', '#fff1f0', '#f9f0ff']
const form = reactive({ content: '', color: colors[0] })

const save = () => {
  if (!form.content.trim()) return
  if (editing.value) {
    const idx = notes.value.findIndex(n => n.id === editing.value.id)
    notes.value[idx] = { ...notes.value[idx], ...form }
  } else {
    notes.value.unshift({ id: Date.now(), ...form, date: today() })
  }
  storage.set('notes', notes.value)
  close()
}

const edit = (note) => {
  editing.value = note
  Object.assign(form, { content: note.content, color: note.color })
  showAdd.value = true
}

const del = () => {
  notes.value = notes.value.filter(n => n.id !== editing.value.id)
  storage.set('notes', notes.value)
  close()
}

const close = () => {
  showAdd.value = false
  editing.value = null
  form.content = ''
  form.color = colors[0]
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.note-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.note-card { border-radius: 10px; padding: 14px; min-height: 100px; cursor: pointer; }
.note-content { font-size: 13px; color: #333; line-height: 1.5; word-break: break-all; }
.note-date { font-size: 10px; color: #999; margin-top: 8px; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.color-picker { display: flex; gap: 12px; padding: 12px 16px; }
.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
.color-dot.active { border-color: #4A90D9; }
.popup-actions { margin-top: 16px; }
</style>
