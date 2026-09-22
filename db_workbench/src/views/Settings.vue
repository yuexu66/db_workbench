<template>
  <div class="settings-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">设置</span>
    </div>

    <div class="page-content">
      <!-- 偏好设置 -->
      <div class="group-title">偏好设置</div>
      <div class="group-card">
        <div class="setting-row">
          <span>深色模式</span>
          <van-switch v-model="settings.data.darkMode" @change="save" />
        </div>
        <div class="setting-row">
          <span>提醒通知</span>
          <van-switch v-model="settings.data.notification" @change="save" />
        </div>
        <div class="setting-row">
          <span>每周报告</span>
          <van-switch v-model="settings.data.weeklyReport" @change="save" />
        </div>
      </div>

      <!-- 通勤设置 -->
      <div class="group-title">通勤设置</div>
      <div class="group-card">
        <van-field v-model="settings.data.commute.homeAddress" label="家地址" placeholder="请输入" @change="save" />
        <van-field v-model="settings.data.commute.workAddress" label="公司地址" placeholder="请输入" @change="save" />
        <van-field name="workTime" label="上班时间" is-link @click="showWorkTime = true">
          <template #input>{{ settings.data.commute.workTime }}</template>
        </van-field>
        <van-field name="offTime" label="下班时间" is-link @click="showOffTime = true">
          <template #input>{{ settings.data.commute.offTime }}</template>
        </van-field>
        <van-field v-model.number="settings.data.commute.commuteDuration" label="通勤时长(分)" type="number" @change="save" />
      </div>

      <van-datetime-picker v-model:show="showWorkTime" type="time" @confirm="onWorkTime" />
      <van-datetime-picker v-model:show="showOffTime" type="time" @confirm="onOffTime" />

      <!-- 天气设置 -->
      <div class="group-title">天气设置</div>
      <div class="group-card">
        <van-field v-model="settings.data.city" label="城市" placeholder="如：武汉" @change="save" />
        <van-field v-model="settings.data.weatherApiKey" label="天气API Key" placeholder="和风天气Key（选填）" @change="save" />
      </div>

      <!-- 数据管理 -->
      <div class="group-title">数据管理</div>
      <div class="group-card">
        <div class="setting-row clickable" @click="exportData">
          <span>导出备份</span>
          <van-icon name="arrow" size="14" color="#ccc" />
        </div>
        <div class="setting-row clickable" @click="importData">
          <span>恢复数据</span>
          <van-icon name="arrow" size="14" color="#ccc" />
        </div>
        <div class="setting-row clickable" @click="clearData">
          <span class="danger">清空所有数据</span>
          <van-icon name="arrow" size="14" color="#ccc" />
        </div>
      </div>

      <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileChange" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useSettingsStore } from '@/stores/settings'
import { storage } from '@/utils/storage'

const settings = useSettingsStore()
const showWorkTime = ref(false)
const showOffTime = ref(false)
const fileInput = ref(null)

const save = () => {
  settings.update({ ...settings.data })
}

const onWorkTime = ({ selectedValues }) => {
  settings.updateCommute({ workTime: selectedValues.join(':') })
}

const onOffTime = ({ selectedValues }) => {
  settings.updateCommute({ offTime: selectedValues.join(':') })
}

const exportData = () => {
  const data = storage.exportAll()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `个人工作台备份_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('备份已下载')
}

const importData = () => {
  fileInput.value.click()
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      storage.importAll(data)
      showToast('恢复成功')
      setTimeout(() => location.reload(), 1000)
    } catch {
      showToast('文件格式错误')
    }
  }
  reader.readAsText(file)
}

const clearData = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '所有数据将被删除且无法恢复，确定继续吗？'
    })
    storage.clear()
    location.reload()
  } catch {}
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f6fa;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
}

.page-content {
  padding: 12px;
}

.group-title {
  font-size: 13px;
  color: #999;
  padding: 12px 4px 8px;
}

.group-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  color: #333;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row.clickable {
  cursor: pointer;
}

.setting-row .danger {
  color: #f5222d;
}
</style>
