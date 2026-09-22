import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { today, formatDate } from '@/utils/date'
import { useSettingsStore } from '@/stores/settings'

// 记录结构（向后兼容旧的 boolean）：
//   新: { value: number, done: boolean, items: string[] }
//   旧: true / false
function normalizeRecord(rec) {
  if (typeof rec === 'boolean') {
    return { value: rec ? 1 : 0, done: rec, items: [] }
  }
  if (rec && typeof rec === 'object') {
    return {
      value: Number(rec.value || 0),
      done: !!rec.done,
      items: Array.isArray(rec.items) ? rec.items : []
    }
  }
  return { value: 0, done: false, items: [] }
}

// 根据习惯类型判断某条记录是否算“完成”
function computeDone(habit, rec) {
  if (!habit) return !!rec.done
  switch (habit.type) {
    case 'counter':
    case 'duration':
      return rec.value >= (Number(habit.target) || 0) && (Number(habit.target) || 0) > 0
    case 'choice':
      return rec.items.length > 0
    case 'bool':
    default:
      return !!rec.done
  }
}

export const useHabitsStore = defineStore('habits', {
  state: () => ({
    records: storage.get('habit_records', {})
  }),
  getters: {
    habitMap: () => {
      const settings = useSettingsStore()
      const map = {}
      settings.data.habits.forEach(h => { map[h.id] = h })
      return map
    },
    getRecord: (state) => (habitId, date = today()) => {
      const day = state.records[date] || {}
      return normalizeRecord(day[habitId])
    },
    isDone: (state) => (habitId, date = today()) => {
      const rec = normalizeRecord((state.records[date] || {})[habitId])
      return computeDone(state.habitMap[habitId], rec)
    },
    todayCompletedCount: (state) => {
      const settings = useSettingsStore()
      const date = today()
      const day = state.records[date] || {}
      return settings.data.habits.filter(h => computeDone(h, normalizeRecord(day[h.id]))).length
    },
    streakDays: (state) => (habitId) => {
      let streak = 0
      const d = new Date()
      const habit = state.habitMap[habitId]
      while (true) {
        const dateStr = formatDate(d, 'YYYY-MM-DD')
        const rec = normalizeRecord((state.records[dateStr] || {})[habitId])
        if (computeDone(habit, rec)) {
          streak++
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }
      return streak
    },
    weekStats: (state) => {
      const settings = useSettingsStore()
      const stats = []
      const now = new Date()
      const day = now.getDay() || 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - day + 1)
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateStr = formatDate(d, 'YYYY-MM-DD')
        const dayRec = state.records[dateStr] || {}
        const completed = settings.data.habits.filter(h => computeDone(h, normalizeRecord(dayRec[h.id]))).length
        stats.push({
          date: dateStr,
          completed,
          total: settings.data.habits.length,
          isToday: dateStr === today()
        })
      }
      return stats
    }
  },
  actions: {
    _ensure(date) {
      if (!this.records[date]) this.records[date] = {}
    },
    _write(habitId, rec, date) {
      this._ensure(date)
      const habit = this.habitMap[habitId]
      rec.done = computeDone(habit, rec)
      this.records[date][habitId] = rec
      this.save()
    },
    // 简单打卡：切换完成状态
    toggle(habitId, date = today()) {
      const rec = normalizeRecord((this.records[date] || {})[habitId])
      rec.done = !rec.done
      this._ensure(date)
      this.records[date][habitId] = rec
      this.save()
    },
    // 计数/时长：增减数值
    addValue(habitId, delta, date = today()) {
      const rec = normalizeRecord((this.records[date] || {})[habitId])
      rec.value = Math.max(0, rec.value + delta)
      this._write(habitId, rec, date)
    },
    setValue(habitId, value, date = today()) {
      const rec = normalizeRecord((this.records[date] || {})[habitId])
      rec.value = Math.max(0, Number(value) || 0)
      this._write(habitId, rec, date)
    },
    // 多选：切换某个项目
    toggleItem(habitId, option, date = today()) {
      const rec = normalizeRecord((this.records[date] || {})[habitId])
      const idx = rec.items.indexOf(option)
      if (idx > -1) rec.items.splice(idx, 1)
      else rec.items.push(option)
      this._write(habitId, rec, date)
    },
    resetHabit(habitId, date = today()) {
      this._ensure(date)
      this.records[date][habitId] = { value: 0, done: false, items: [] }
      this.save()
    },
    isChecked(habitId, date = today()) {
      return this.isDone(habitId, date)
    },
    save() {
      storage.set('habit_records', this.records)
    }
  }
})
