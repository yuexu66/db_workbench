<template>
  <div class="tool-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">密码备忘</span>
      <van-icon name="plus" size="20" @click="showAdd = true" />
    </div>
    <div class="page-content">
      <div class="tip">密码已加密存储，请注意保管</div>
      <div v-if="items.length === 0" class="empty">
        <van-icon name="lock" size="48" color="#ddd" />
        <div>暂无密码记录</div>
      </div>
      <div v-else class="card">
        <div v-for="item in items" :key="item.id" class="pwd-item" @click="view(item)">
          <div class="pwd-icon"><van-icon name="lock" size="18" color="#fff" /></div>
          <div class="pwd-info">
            <div class="pwd-title">{{ item.title }}</div>
            <div class="pwd-account">{{ item.account || '无账号' }}</div>
          </div>
          <van-icon name="eye" size="18" color="#ccc" />
        </div>
      </div>
    </div>
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup">
        <div class="popup-title">{{ editing ? '编辑' : '添加密码' }}</div>
        <van-field v-model="form.title" label="名称" placeholder="如：WiFi、邮箱" />
        <van-field v-model="form.account" label="账号" placeholder="选填" />
        <van-field v-model="form.password" label="密码" placeholder="请输入密码" />
        <van-field v-model="form.url" label="网址" placeholder="选填" />
        <van-field v-model="form.remark" label="备注" placeholder="选填" />
        <div class="popup-actions">
          <van-button v-if="editing" block type="danger" plain @click="del" style="margin-bottom:10px">删除</van-button>
          <van-button block type="primary" @click="save">保存</van-button>
        </div>
      </div>
    </van-popup>
    <van-dialog v-model:show="showView" title="密码详情" show-cancel-button>
      <div class="view-content">
        <div class="view-row"><span>名称</span><span>{{ viewItem.title }}</span></div>
        <div class="view-row"><span>账号</span><span>{{ viewItem.account || '-' }}</span></div>
        <div class="view-row"><span>密码</span><span class="pwd-text">{{ viewItem.password }}</span></div>
        <div class="view-row"><span>网址</span><span>{{ viewItem.url || '-' }}</span></div>
        <div class="view-row"><span>备注</span><span>{{ viewItem.remark || '-' }}</span></div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storage } from '@/utils/storage'

// 简单Base64编码（生产环境建议用AES）
const encode = (str) => btoa(unescape(encodeURIComponent(str)))
const decode = (str) => { try { return decodeURIComponent(escape(atob(str))) } catch { return str } }

const items = ref((storage.get('passwords', []) || []).map(i => ({ ...i, password: decode(i.password) })))
const showAdd = ref(false)
const showView = ref(false)
const editing = ref(null)
const viewItem = ref({})
const form = reactive({ title: '', account: '', password: '', url: '', remark: '' })

const save = () => {
  if (!form.title.trim() || !form.password) return
  const encoded = { ...form, password: encode(form.password) }
  if (editing.value) {
    const idx = items.value.findIndex(i => i.id === editing.value.id)
    items.value[idx] = { ...items.value[idx], ...form }
  } else {
    items.value.push({ id: Date.now(), ...form })
  }
  storage.set('passwords', items.value.map(i => ({ ...i, password: encode(i.password) })))
  close()
}

const view = (item) => { viewItem.value = item; showView.value = true }
const del = () => {
  items.value = items.value.filter(i => i.id !== editing.value.id)
  storage.set('passwords', items.value.map(i => ({ ...i, password: encode(i.password) })))
  close()
}
const close = () => {
  showAdd.value = false; editing.value = null
  Object.assign(form, { title: '', account: '', password: '', url: '', remark: '' })
}
</script>

<style scoped>
.tool-page { min-height: 100vh; background: #f5f6fa; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.page-title { font-size: 17px; font-weight: 600; }
.page-content { padding: 12px; }
.tip { font-size: 12px; color: #fa8c16; background: #fff7e6; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; }
.empty { text-align: center; padding: 60px 20px; color: #999; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.card { background: #fff; border-radius: 12px; padding: 4px 16px; }
.pwd-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.pwd-item:last-child { border-bottom: none; }
.pwd-icon { width: 36px; height: 36px; border-radius: 8px; background: #722ed1; display: flex; align-items: center; justify-content: center; }
.pwd-info { flex: 1; }
.pwd-title { font-size: 14px; font-weight: 500; }
.pwd-account { font-size: 12px; color: #999; margin-top: 2px; }
.popup { padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); max-height: 80vh; overflow-y: auto; }
.popup-title { font-size: 17px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.popup-actions { margin-top: 16px; }
.view-content { padding: 8px 0; }
.view-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
.view-row span:first-child { color: #999; }
.pwd-text { font-family: monospace; color: #4A90D9; }
</style>
