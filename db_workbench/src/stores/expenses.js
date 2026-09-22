import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { today, formatDate } from '@/utils/date'

export const EXPENSE_CATEGORIES = [
  { key: 'fuel', label: '油费', icon: 'car', color: '#fa8c16' },
  { key: 'parking', label: '停车', icon: 'parking', color: '#4A90D9' },
  { key: 'carwash', label: '洗车', icon: 'wash', color: '#13c2c2' },
  { key: 'maintenance', label: '保养', icon: 'wrench', color: '#722ed1' },
  { key: 'subscription', label: '订阅会员', icon: 'video', color: '#52c41a' },
  { key: 'food', label: '餐饮', icon: 'food', color: '#f5222d' },
  { key: 'shopping', label: '购物', icon: 'shop', color: '#eb2f96' },
  { key: 'transport', label: '交通', icon: 'bus', color: '#1890ff' },
  { key: 'gift', label: '人情随礼', icon: 'gift', color: '#fa541c' },
  { key: 'rent', label: '房租', icon: 'home', color: '#2f54eb' },
  { key: 'utilities', label: '水电燃气', icon: 'lightning', color: '#fadb14' },
  { key: 'medical', label: '医疗', icon: 'health', color: '#13c2c2' },
  { key: 'entertainment', label: '娱乐', icon: 'game', color: '#722ed1' },
  { key: 'other', label: '其他', icon: 'more', color: '#8c8c8c' }
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
