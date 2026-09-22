<template>
  <div class="habits-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">习惯打卡</span>
      <span class="header-btn" @click="manageMode = !manageMode">{{ manageMode ? '完成' : '管理' }}</span>
    </div>

    <div class="page-content">
      <!-- 今日进度 -->
      <div class="progress-card">
        <div class="pc-left">
          <div class="pc-date">{{ todayCN }}</div>
          <div class="pc-title">今日已完成 {{ habitsStore.todayCompletedCount }}/{{ habits.length }}</div>
        </div>
        <div class="pc-ring" :style="ringStyle">
          <span>{{ progressPercent }}%</span>
        </div>
      </div>

      <!-- 通知授权 -->
      <div v-if="permState !== 'granted'" class="notify-bar" @click="enableNotify">
        <van-icon name="bell" size="16" />
        <span>{{ permState === 'unsupported' ? '当前浏览器不支持通知，仅应用内提醒' : '开启通知与振动，到点提醒打卡' }}</span>
      </div>

      <!-- 习惯列表 -->
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="habit-card"
        :class="{ done: habitsStore.isDone(habit.id) }"
      >
        <div class="hc-head">
          <div class="hc-icon" :style="{ background: habit.color + '1a' }">
            <span>{{ habit.icon }}</span>
          </div>
          <div class="hc-info">
            <div class="hc-name">
              {{ habit.name }}
              <span class="hc-type">{{ typeLabel(habit.type) }}</span>
            </div>
            <div class="hc-meta">
              <span class="streak">🔥 连续 {{ habitsStore.streakDays(habit.id) }} 天</span>
              <span v-if="habit.remind && habit.remind.enabled" class="remind">⏰ {{ habit.remind.time }}</span>
            </div>
          </div>
          <div v-if="manageMode" class="hc-actions">
            <van-icon name="edit" size="18" color="#94a3b8" @click="openEdit(habit)" />
            <van-icon name="delete-o" size="18" color="#ef4444" @click="removeHabit(habit)" />
          </div>
        </div>

        <!-- 按类型的打卡交互 -->
        <div class="hc-body">
          <!-- bool -->
          <template v-if="habit.type === 'bool'">
            <div class="bool-btn" :class="{ on: habitsStore.isDone(habit.id) }" @click="onToggle(habit)">
              <van-icon :name="habitsStore.isDone(habit.id) ? 'success' : 'plus'" size="18" />
              <span>{{ habitsStore.isDone(habit.id) ? '已完成' : '点我打卡' }}</span>
            </div>
          </template>

          <!-- counter / duration -->
          <template v-else-if="habit.type === 'counter' || habit.type === 'duration'">
            <div class="progress-bar">
              <div class="pb-fill" :style="{ width: Math.min(100, valueOf(habit) / (habit.target || 1) * 100) + '%', background: habit.color }"></div>
            </div>
            <div class="stepper">
              <div class="step-btn" @click="dec(habit)">−</div>
              <div class="step-value">
                <span class="sv-num">{{ valueOf(habit) }}</span>
                <span class="sv-target">/ {{ habit.target }}{{ habit.unit }}</span>
              </div>
              <div class="step-btn add" @click="inc(habit)">＋</div>
            </div>
            <div v-if="habit.type === 'duration'" class="quick-adds">
              <span v-for="q in [10, 20, 30]" :key="q" class="quick-chip" @click="addValue(habit, q)">+{{ q }}分钟</span>
            </div>
          </template>

          <!-- choice -->
          <template v-else-if="habit.type === 'choice'">
            <div class="chips">
              <span
                v-for="opt in (habit.options || [])"
                :key="opt"
                class="chip"
                :class="{ on: itemOn(habit, opt) }"
                :style="itemOn(habit, opt) ? { background: habit.color, borderColor: habit.color } : {}"
                @click="toggleItem(habit, opt)"
              >{{ opt }}</span>
              <span v-if="!habit.options || habit.options.length === 0" class="chip-empty">点“管理-编辑”添加项目</span>
            </div>
          </template>
        </div>
      </div>

      <div v-if="habits.length === 0" class="empty">还没有习惯，点右上角“管理”添加</div>

      <div class="add-habit-btn" @click="openAdd">+ 添加习惯</div>
    </div>

    <!-- 添加/编辑习惯弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round>
      <div class="form-content">
        <div class="form-title">{{ editing ? '编辑习惯' : '添加习惯' }}</div>

        <van-field v-model="form.name" label="名称" placeholder="如：喝水" />

        <van-field label="图标">
          <template #input>
            <div class="emoji-row">
              <span
                v-for="e in emojiList"
                :key="e"
                class="emoji"
                :class="{ on: form.icon === e }"
                @click="form.icon = e"
              >{{ e }}</span>
            </div>
          </template>
        </van-field>

        <van-field label="颜色">
          <template #input>
            <div class="color-row">
              <span
                v-for="c in colorList"
                :key="c"
                class="color-dot"
                :class="{ on: form.color === c }"
                :style="{ background: c }"
                @click="form.color = c"
              ></span>
            </div>
          </template>
        </van-field>

        <van-field label="类型">
          <template #input>
            <div class="type-row">
              <span
                v-for="t in HABIT_TYPES"
                :key="t.key"
                class="type-chip"
                :class="{ on: form.type === t.key }"
                @click="form.type = t.key"
              >{{ t.label }}</span>
            </div>
          </template>
        </van-field>

        <template v-if="form.type === 'counter' || form.type === 'duration'">
          <van-field v-model.number="form.target" label="目标值" type="number" placeholder="如 8" />
          <van-field v-model="form.unit" label="单位" placeholder="如 杯 / 分钟" />
        </template>

        <van-field
          v-if="form.type === 'choice'"
          v-model="form.optionsText"
          label="选项"
          placeholder="用逗号分隔，如：卧推,深蹲,跑步机"
        />

        <div class="form-switch-row">
          <span>打卡提醒</span>
          <van-switch v-model="form.remindEnabled" size="20" />
        </div>
        <van-field
          v-if="form.remindEnabled"
          name="remindTime"
          label="提醒时间"
          is-link
          @click="openTimePicker"
        >
          <template #input>{{ form.remindTime }}</template>
        </van-field>
        <van-popup v-model:show="showTime" position="bottom" round>
          <van-time-picker v-model="timeValue" title="提醒时间" @confirm="onTimeConfirm" @cancel="showTime = false" />
        </van-popup>

        <div class="form-actions">
          <van-button block type="primary" @click="saveHabit">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useSettingsStore, HABIT_TYPES } from '@/stores/settings'
import { useHabitsStore } from '@/stores/habits'
import { formatCNDate } from '@/utils/date'
import { requestNotifyPermission, notificationPermission, vibrate } from '@/utils/notify'

const settings = useSettingsStore()
const habitsStore = useHabitsStore()

const manageMode = ref(false)
const permState = ref(notificationPermission())

const habits = computed(() => settings.data.habits)
const todayCN = computed(() => formatCNDate(new Date()))
const progressPercent = computed(() => {
  const total = habits.value.length
  if (total === 0) return 0
  return Math.round(habitsStore.todayCompletedCount / total * 100)
})
const ringStyle = computed(() => {
  const p = progressPercent.value
  return { background: `conic-gradient(#10b981 ${p}%, #e2e8f0 ${p}%)` }
})

const emojiList = ['💧', '🏃', '📖', '', '💊', '🏋️', '🧘', '🥗', '🚭', '️', '🎯', '☀️']
const colorList = ['#38bdf8', '#f97316', '#8b5cf6', '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899']

const typeLabel = (t) => HABIT_TYPES.find(x => x.key === t)?.label || '打卡'

const valueOf = (habit) => habitsStore.getRecord(habit.id).value
const itemOn = (habit, opt) => habitsStore.getRecord(habit.id).items.includes(opt)

const onToggle = (habit) => {
  habitsStore.toggle(habit.id)
  if (habitsStore.isDone(habit.id)) celebrate()
}
const inc = (habit) => { habitsStore.addValue(habit.id, habit.step || 1); if (habitsStore.isDone(habit.id)) celebrate() }
const dec = (habit) => habitsStore.addValue(habit.id, -(habit.step || 1))
const addValue = (habit, n) => { habitsStore.addValue(habit.id, n); if (habitsStore.isDone(habit.id)) celebrate() }
const toggleItem = (habit, opt) => { habitsStore.toggleItem(habit.id, opt); celebrate() }

const celebrate = () => { vibrate([120, 60, 120]) }

// 表单
const showForm = ref(false)
const showTime = ref(false)
const timeValue = ref(['09', '00'])
const editing = ref(null)
const form = reactive({
  name: '', icon: '⭐', color: '#6366f1', type: 'bool',
  target: 8, unit: '', optionsText: '', remindEnabled: false, remindTime: '09:00'
})

const resetForm = () => {
  Object.assign(form, {
    name: '', icon: '⭐', color: '#6366f1', type: 'bool',
    target: 8, unit: '', optionsText: '', remindEnabled: false, remindTime: '09:00'
  })
}

const openAdd = () => {
  editing.value = null
  resetForm()
  showForm.value = true
}

const openEdit = (habit) => {
  editing.value = habit
  Object.assign(form, {
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    type: habit.type,
    target: habit.target || 8,
    unit: habit.unit || '',
    optionsText: (habit.options || []).join(','),
    remindEnabled: !!(habit.remind && habit.remind.enabled),
    remindTime: (habit.remind && habit.remind.time) || '09:00'
  })
  showForm.value = true
}

const openTimePicker = () => {
  timeValue.value = (form.remindTime || '09:00').split(':')
  showTime.value = true
}

const onTimeConfirm = ({ selectedValues }) => {
  form.remindTime = selectedValues.join(':')
  showTime.value = false
}

const saveHabit = () => {
  if (!form.name.trim()) { showToast('请输入名称'); return }
  const payload = {
    name: form.name.trim(),
    icon: form.icon,
    color: form.color,
    type: form.type,
    target: Number(form.target) || 0,
    unit: form.unit,
    options: form.type === 'choice' ? form.optionsText.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [],
    remind: { enabled: form.remindEnabled, time: form.remindTime }
  }
  if (editing.value) {
    settings.updateHabit(editing.value.id, payload)
  } else {
    settings.addHabit(payload)
  }
  showForm.value = false
  if (form.remindEnabled && permState.value !== 'granted' && permState.value !== 'unsupported') {
    requestNotifyPermission().then(p => { permState.value = p })
  }
}

const removeHabit = async (habit) => {
  try {
    await showConfirmDialog({ title: '删除习惯', message: `确定删除「${habit.name}」吗？其打卡记录也会清除。` })
    settings.removeHabit(habit.id)
  } catch {}
}

const enableNotify = async () => {
  const p = await requestNotifyPermission()
  permState.value = p
  if (p === 'granted') { showToast('已开启通知'); vibrate(80) }
  else if (p === 'unsupported') showToast('浏览器不支持通知')
  else showToast('未获得通知权限')
}
</script>

<style scoped>
.habits-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #1e1b4b;
}

.header-btn {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
}

.page-content {
  padding: 14px 12px 40px;
}

.progress-card {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.pc-date {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.pc-title {
  font-size: 17px;
  font-weight: 700;
}

.pc-ring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pc-ring::before {
  content: '';
  position: absolute;
  inset: 6px;
  background: #4f46e5;
  border-radius: 50%;
}

.pc-ring span {
  position: relative;
  font-size: 13px;
  font-weight: 700;
}

.notify-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 12px;
  cursor: pointer;
}

.habit-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}

.habit-card.done {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #fff, #f0fdf4);
}

.hc-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.hc-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.hc-info {
  flex: 1;
  min-width: 0;
}

.hc-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e1b4b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hc-type {
  font-size: 10px;
  font-weight: 500;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 6px;
  border-radius: 6px;
}

.hc-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.hc-meta .remind { color: #f59e0b; }

.hc-actions {
  display: flex;
  gap: 14px;
}

.bool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bool-btn.on {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #fff;
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
  background: #f1f5f9;
  overflow: hidden;
  margin-bottom: 12px;
}

.pb-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.step-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.step-btn.add {
  background: linear-gradient(135deg, #818cf8, #6366f1);
  color: #fff;
}

.step-btn:active { transform: scale(0.9); }

.step-value { text-align: center; min-width: 80px; }

.sv-num {
  font-size: 26px;
  font-weight: 800;
  color: #1e1b4b;
}

.sv-target {
  font-size: 13px;
  color: #94a3b8;
  margin-left: 4px;
}

.quick-adds {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.quick-chip {
  font-size: 12px;
  color: #6366f1;
  background: #eef2ff;
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  font-size: 13px;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 7px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s;
}

.chip.on {
  color: #fff;
}

.chip-empty {
  font-size: 12px;
  color: #cbd5e1;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 14px;
}

.add-habit-btn {
  margin-top: 8px;
  text-align: center;
  padding: 14px;
  border-radius: 14px;
  border: 1.5px dashed #c7d2fe;
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
}

.form-content {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  max-height: 85vh;
  overflow-y: auto;
}

.form-title {
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e1b4b;
}

.emoji-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji {
  font-size: 22px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
}

.emoji.on { background: #e0e7ff; box-shadow: 0 0 0 2px #6366f1 inset; }

.color-row { display: flex; gap: 10px; }

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.color-dot.on { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #6366f1; }

.type-row { display: flex; gap: 8px; flex-wrap: wrap; }

.type-chip {
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
}

.type-chip.on { background: #6366f1; color: #fff; }

.form-switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  font-size: 14px;
  color: #1e1b4b;
}

.form-actions { margin-top: 20px; }
</style>
