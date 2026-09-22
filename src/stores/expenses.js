import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { today, formatDate } from '@/utils/date'

export const EXPENSE_CATEGORIES = [
  { key: 'fuel', label: '油费', icon: 'fire-o', color: '#f59e0b' },
  { key: 'parking', label: '停车', icon: 'location-o', color: '#6366f1' },
  { key: 'carwash', label: '洗车', icon: 'water-o', color: '#14b8a6' },
  { key: 'maintenance', label: '保养', icon: 'setting-o', color: '#8b5cf6' },
  { key: 'subscription', label: '订阅会员', icon: 'video', color: '#10b981' },
  { key: 'food', label: '餐饮', icon: 'food-o', color: '#ef4444' },
  { key: 'shopping', label: '购物', icon: 'shopping-cart-o', color: '#ec4899' },
  { key: 'transport', label: '交通', icon: 'bus', color: '#0ea5e9' },
  { key: 'gift', label: '人情随礼', icon: 'gift-o', color: '#f97316' },
  { key: 'rent', label: '房租', icon: 'home-o', color: '#6366f1' },
  { key: 'utilities', label: '水电燃气', icon: 'lightning', color: '#eab308' },
  { key: 'medical', label: '医疗', icon: 'description', color: '#14b8a6' },
  { key: 'entertainment', label: '娱乐', icon: 'smile-o', color: '#a855f7' },
  { key: 'other', label: '其他', icon: 'ellipsis', color: '#94a3b8' }
]

export const useExpensesStore = defineStore('expenses', {
  state: () => ({
    list: storage.get('expenses', []),
    budget: storage.get('budget', { total: 4000, month: formatDate(new Date(), 'YYYY-MM') })
  }),
  getters: {
    thisMonth: (state) => {
      const month = formatDate(new Date(), 'YYYY-MM')
      return state.list.filter(e => e.date.startsWith(month))
    },
    thisMonthTotal: (state) => {
      const month = formatDate(new Date(), 'YYYY-MM')
      return state.list
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + Number(e.amount), 0)
    },
    todayTotal: (state) => {
      return state.list
        .filter(e => e.date === today())
        .reduce((sum, e) => sum + Number(e.amount), 0)
    },
    byCategory: (state) => (category) => state.list.filter(e => e.category === category),
    thisMonthByCategory: (state) => {
      const month = formatDate(new Date(), 'YYYY-MM')
      const map = {}
      state.list
        .filter(e => e.date.startsWith(month))
        .forEach(e => {
          map[e.category] = (map[e.category] || 0) + Number(e.amount)
        })
      return map
    },
    vehicleExpenses: (state) => {
      const month = formatDate(new Date(), 'YYYY-MM')
      const vehicleCats = ['fuel', 'parking', 'carwash', 'maintenance']
      const items = state.list.filter(e => e.date.startsWith(month) && vehicleCats.includes(e.category))
      const total = items.reduce((sum, e) => sum + Number(e.amount), 0)
      const byCat = {}
      vehicleCats.forEach(c => {
        byCat[c] = items.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0)
      })
      return { items, total, byCat }
    },
    monthlyTrend: (state) => {
      const months = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const month = formatDate(d, 'YYYY-MM')
        const total = state.list
          .filter(e => e.date.startsWith(month))
          .reduce((sum, e) => sum + Number(e.amount), 0)
        months.push({ month: formatDate(d, 'M月'), total })
      }
      return months
    }
  },
  actions: {
    add(expense) {
      const id = Date.now()
      this.list.unshift({
        id,
        amount: Number(expense.amount),
        category: expense.category,
        name: expense.name || EXPENSE_CATEGORIES.find(c => c.key === expense.category)?.label || '',
        date: expense.date || today(),
        remark: expense.remark || '',
        createdAt: new Date().toISOString()
      })
      this.save()
    },
    update(id, patch) {
      const idx = this.list.findIndex(e => e.id === id)
      if (idx > -1) {
        this.list[idx] = { ...this.list[idx], ...patch }
        this.save()
      }
    },
    remove(id) {
      this.list = this.list.filter(e => e.id !== id)
      this.save()
    },
    setBudget(total) {
      this.budget = { total, month: formatDate(new Date(), 'YYYY-MM') }
      storage.set('budget', this.budget)
    },
    save() {
      storage.set('expenses', this.list)
    }
  }
})
