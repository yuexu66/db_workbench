<template>
  <div class="page reminders-page">
    <div class="page-header">
      <div class="page-title">提醒中心</div>
    </div>

    <!-- 分类标签 -->
    <div class="type-tabs">
      <div
        v-for="t in allTypes"
        :key="t.key"
        class="type-tab"
        :class="{ active: activeType === t.key }"
        @click="activeType = t.key"
      >
        {{ t.label }}
        <span v-if="t.key === 'all'" class="tab-count">({{ remindersStore.list.length }})</span>
      </div>
    </div>

    <!-- 提醒列表 -->
    <div class="card reminder-list">
      <ReminderItem
        v-for="r in filteredReminders"
        :key="r.id"
        :reminder="r"
        @click="editReminder"
      />
      <EmptyState
        v-if="filteredReminders.length === 0"
        icon="bell"
        text="暂无提醒"
        action-text="添加提醒"
        @action="showAdd = true"
      />
    </div>

    <!-- 添加/编辑弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup-content">
        <div class="popup-title">{{ editing ? '编辑提醒' : '添加提醒' }}</div>
        <van-field v-model="form.title" label="标题" placeholder="如：妈妈生日" />
        <van-field name="type" label="类型">
          <template #input>
            <van-radio-group v-model="form.type" direction="horizontal">
              <van-radio v-for="t in types" :key="t.key" :name="t.key">{{ t.label }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="date" label="日期" is-link @click="showDatePicker = true">
          <template #input>{{ form.date || '请选择日期' }}</template>
        </van-field>
        <van-datetime-picker
          v-model:show="showDatePicker"
          type="date"
          :min-date="minDate"
          @confirm="onDateConfirm"
        />
        <van-field name="repeat" label="重复">
          <template #input>
            <van-radio-group v-model="form.repeat" direction="horizontal">
              <van-radio name="none">不重复</van-radio>
              <van-radio name="monthly">每月</van-radio>
              <van-radio name="yearly">每年</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model.number="form.amount" label="关联金额" type="number" placeholder="选填，如订阅费" />
        <van-field v-model="form.remark" label="备注" type="textarea" rows="2" placeholder="选填" />
        <div class="popup-actions">
          <van-button v-if="editing" block type="danger" plain @click="deleteReminder" style="margin-bottom:10px">删除</van-button>
          <van-button block type="primary" @click="save">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRemindersStore, REMINDER_TYPES } from '@/stores/reminders'
import { getNextOccurrence, daysUntil, formatDate } from '@/utils/date'
import ReminderItem from '@/components/ReminderItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const remindersStore = useRemindersStore()

const activeType = ref('all')
const showAdd = ref(false)
const showDatePicker = ref(false)
const editing = ref(null)
const minDate = new Date(2020, 0, 1)

const types = REMINDER_TYPES
const allTypes = [{ key: 'all', label: '全部' }, ...REMINDER_TYPES]

const form = reactive({
  title: '',
  type: 'birthday',
  date: '',
  repeat: 'yearly',
  amount: 0,
  remark: ''
})

const filteredReminders = computed(() => {
  let list = remindersStore.list
  if (activeType.value !== 'all') {
    list = list.filter(r => r.type === activeType.value)
  }
  return list
    .map(r => ({ ...r, nextDate: getNextOccurrence(r.date, r.repeat) }))
    .sort((a, b) => daysUntil(a.nextDate) - daysUntil(b.nextDate))
})

const onDateConfirm = ({ selectedValues }) => {
  form.date = formatDate(new Date(selectedValues[0]), 'YYYY-MM-DD')
}

const editReminder = (r) => {
  editing.value = r
  Object.assign(form, {
    title: r.title,
    type: r.type,
    date: r.date,
    repeat: r.repeat,
    amount: r.amount || 0,
    remark: r.remark || ''
  })
  showAdd.value = true
}

const save = () => {
  if (!form.title.trim() || !form.date) return
  if (editing.value) {
    remindersStore.update(editing.value.id, { ...form })
  } else {
    remindersStore.add({ ...form })
  }
  close()
}

const deleteReminder = () => {
  if (editing.value) {
    remindersStore.remove(editing.value.id)
  }
  close()
}

const close = () => {
  showAdd.value = false
  editing.value = null
  Object.assign(form, { title: '', type: 'birthday', date: '', repeat: 'yearly', amount: 0, remark: '' })
}

onMounted(() => {
  if (route.query.add === '1') {
    showAdd.value = true
  }
})
</script>

<style scoped>
.reminders-page {
  padding: 12px;
}

.page-header {
  margin-bottom: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.type-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.type-tab {
  padding: 6px 14px;
  border-radius: 16px;
  background: #f0f0f0;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.type-tab.active {
  background: #4A90D9;
  color: #fff;
}

.tab-count {
  font-size: 11px;
}

.reminder-list {
  padding: 0 16px;
}

.popup-content {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  max-height: 80vh;
  overflow-y: auto;
}

.popup-title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.popup-actions {
  margin-top: 20px;
}
</style>
