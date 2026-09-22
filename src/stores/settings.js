import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

// 习惯类型定义
export const HABIT_TYPES = [
  { key: 'bool', label: '打卡', desc: '完成/未完成' },
  { key: 'counter', label: '计数', desc: '达到目标次数/量' },
  { key: 'duration', label: '时长', desc: '累计分钟数' },
  { key: 'choice', label: '多选', desc: '完成具体项目' }
]

const defaultSettings = {
  username: '徐越',
  avatar: '',
  city: '武汉',
  weatherApiKey: '',
  darkMode: false,
  notification: true,
  weeklyReport: false,
  commute: {
    homeAddress: '',
    workAddress: '',
    workTime: '09:00',
    offTime: '18:00',
    commuteType: 'driving',
    commuteDuration: 30
  },
  habits: [
    { id: 1, name: '喝水', icon: '💧', color: '#38bdf8', type: 'counter', unit: '杯', target: 8, step: 1, remind: { enabled: true, time: '10:00' } },
    { id: 2, name: '跑步', icon: '🏃', color: '#f97316', type: 'duration', unit: '分钟', target: 30, remind: { enabled: false, time: '19:00' } },
    { id: 3, name: '阅读', icon: '📖', color: '#8b5cf6', type: 'duration', unit: '分钟', target: 20, remind: { enabled: false, time: '21:00' } },
    { id: 4, name: '早睡', icon: '🌙', color: '#6366f1', type: 'bool', remind: { enabled: true, time: '22:30' } },
    { id: 5, name: '健身', icon: '🏋️', color: '#ef4444', type: 'choice', options: ['卧推', '深蹲', '硬拉', '跑步机', '引体向上'], remind: { enabled: false, time: '18:00' } }
  ]
}

// 兼容旧数据：确保每个习惯都有 type/remind 等字段
function normalizeHabits(habits) {
  if (!Array.isArray(habits)) return JSON.parse(JSON.stringify(defaultSettings.habits))
  return habits.map(h => ({
    step: 1,
    unit: '',
    target: 0,
    options: [],
    color: '#6366f1',
    icon: '⭐',
    type: 'bool',
    remind: { enabled: false, time: '09:00' },
    ...h,
    remind: { enabled: false, time: '09:00', ...(h.remind || {}) }
  }))
}

function loadSettings() {
  const saved = storage.get('settings', null)
  if (!saved) return JSON.parse(JSON.stringify(defaultSettings))
  const merged = { ...defaultSettings, ...saved }
  merged.commute = { ...defaultSettings.commute, ...(saved.commute || {}) }
  merged.habits = normalizeHabits(saved.habits)
  return merged
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    data: loadSettings()
  }),
  getters: {
    // 需要通知提醒的习惯
    remindableHabits: (state) => state.data.habits.filter(h => h.remind && h.remind.enabled)
  },
  actions: {
    update(patch) {
      this.data = { ...this.data, ...patch }
      storage.set('settings', this.data)
    },
    updateCommute(patch) {
      this.data.commute = { ...this.data.commute, ...patch }
      storage.set('settings', this.data)
    },
    addHabit(habit) {
      const id = Math.max(0, ...this.data.habits.map(h => h.id)) + 1
      this.data.habits.push(normalizeHabits([{ id, name: '新习惯', ...habit }])[0])
      storage.set('settings', this.data)
    },
    updateHabit(id, patch) {
      const idx = this.data.habits.findIndex(h => h.id === id)
      if (idx > -1) {
        this.data.habits[idx] = normalizeHabits([{ ...this.data.habits[idx], ...patch }])[0]
        storage.set('settings', this.data)
      }
    },
    removeHabit(id) {
      this.data.habits = this.data.habits.filter(h => h.id !== id)
      storage.set('settings', this.data)
    },
    reset() {
      this.data = JSON.parse(JSON.stringify(defaultSettings))
      storage.set('settings', this.data)
    }
  }
})
