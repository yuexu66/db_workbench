import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { today, formatDate } from '@/utils/date'

export const useHabitsStore = defineStore('habits', {
  state: () => ({
    records: storage.get('habit_records', {})
  }),
  getters: {
    todayRecords: (state) => state.records[today()] || {},
    streakDays: (state) => (habitId) => {
      let streak = 0
      const d = new Date()
      while (true) {
        const dateStr = formatDate(d, 'YYYY-MM-DD')
        const rec = state.records[dateStr]
        if (rec && rec[habitId]) {
          streak++
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }
      return streak
    },
    todayCompletedCount: (state) => {
      const rec = state.records[today()] || {}
      return Object.values(rec).filter(Boolean).length
    },
    weekStats: (state) => {
      const stats = []
      const now = new Date()
      const day = now.getDay() || 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - day + 1)
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateStr = formatDate(d, 'YYYY-MM-DD')
        const rec = state.records[dateStr] || {}
        stats.push({
          date: dateStr,
          completed: Object.values(rec).filter(Boolean).length,
          isToday: dateStr === today()
        })
      }
      return stats
    }
  },
  actions: {
    toggle(habitId, date = today()) {
      if (!this.records[date]) {
        this.records[date] = {}
      }
      this.records[date][habitId] = !this.records[date][habitId]
      this.save()
    },
    isChecked(habitId, date = today()) {
      return !!(this.records[date] && this.records[date][habitId])
    },
    save() {
      storage.set('habit_records', this.records)
    }
  }
})
