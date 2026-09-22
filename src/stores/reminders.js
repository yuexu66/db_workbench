import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { getNextOccurrence, daysUntil, today } from '@/utils/date'

export const REMINDER_TYPES = [
  { key: 'birthday', label: '生日纪念', color: '#ec4899' },
  { key: 'subscription', label: '订阅续费', color: '#10b981' },
  { key: 'insurance', label: '车辆保险', color: '#f59e0b' },
  { key: 'bill', label: '账单还款', color: '#6366f1' },
  { key: 'gift', label: '人情往来', color: '#ef4444' },
  { key: 'id', label: '证件到期', color: '#8b5cf6' },
  { key: 'health', label: '健康医药', color: '#14b8a6' },
  { key: 'other', label: '其他', color: '#94a3b8' }
]

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    list: storage.get('reminders', [])
  }),
  getters: {
    upcoming: (state) => {
      return state.list
        .map(r => ({ ...r, nextDate: getNextOccurrence(r.date, r.repeat) }))
        .filter(r => daysUntil(r.nextDate) >= 0)
        .sort((a, b) => daysUntil(a.nextDate) - daysUntil(b.nextDate))
    },
    upcoming7days: (state) => {
      return state.list
        .map(r => ({ ...r, nextDate: getNextOccurrence(r.date, r.repeat) }))
        .filter(r => {
          const d = daysUntil(r.nextDate)
          return d >= 0 && d <= 7
        })
        .sort((a, b) => daysUntil(a.nextDate) - daysUntil(b.nextDate))
    },
    byType: (state) => (type) => state.list.filter(r => r.type === type),
    upcomingExpenses: (state) => {
      return state.list
        .filter(r => r.amount > 0 && (r.type === 'bill' || r.type === 'subscription'))
        .map(r => ({ ...r, nextDate: getNextOccurrence(r.date, r.repeat) }))
        .filter(r => {
          const d = daysUntil(r.nextDate)
          return d >= 0 && d <= 7
        })
    }
  },
  actions: {
    add(reminder) {
      const id = Date.now()
      this.list.push({
        id,
        title: reminder.title,
        type: reminder.type || 'other',
        date: reminder.date,
        repeat: reminder.repeat || 'none',
        remindDays: reminder.remindDays || [1, 3, 7],
        remark: reminder.remark || '',
        amount: reminder.amount || 0,
        createdAt: new Date().toISOString()
      })
      this.save()
    },
    update(id, patch) {
      const idx = this.list.findIndex(r => r.id === id)
      if (idx > -1) {
        this.list[idx] = { ...this.list[idx], ...patch }
        this.save()
      }
    },
    remove(id) {
      this.list = this.list.filter(r => r.id !== id)
      this.save()
    },
    save() {
      storage.set('reminders', this.list)
    }
  }
})
