import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { fetchFundNavs } from '@/utils/fund'

export const ASSET_TYPES = [
  { key: 'fund', label: '基金', color: '#4A90D9' },
  { key: 'wealth', label: '银行理财', color: '#52c41a' },
  { key: 'stock', label: '股票', color: '#f5222d' },
  { key: 'deposit', label: '活期存款', color: '#faad14' },
  { key: 'cash', label: '现金', color: '#8c8c8c' },
  { key: 'other', label: '其他', color: '#722ed1' }
]

export const useAssetsStore = defineStore('assets', {
  state: () => ({
    list: storage.get('assets', []),
    refreshing: false,
    lastRefresh: storage.get('assets_last_refresh', null)
  }),
  getters: {
    totalAmount: (state) => state.list.reduce((sum, a) => sum + Number(a.currentAmount || 0), 0),
    totalCost: (state) => state.list.reduce((sum, a) => sum + Number(a.costAmount || 0), 0),
    totalProfit: (state) => {
      return state.list.reduce((sum, a) => {
        return sum + (Number(a.currentAmount || 0) - Number(a.costAmount || 0))
      }, 0)
    },
    profitRate: (state) => {
      const cost = state.list.reduce((sum, a) => sum + Number(a.costAmount || 0), 0)
      if (cost === 0) return 0
      const profit = state.list.reduce((sum, a) => sum + (Number(a.currentAmount || 0) - Number(a.costAmount || 0)), 0)
      return (profit / cost * 100)
    },
    byType: (state) => {
      const map = {}
      state.list.forEach(a => {
        map[a.type] = (map[a.type] || 0) + Number(a.currentAmount || 0)
      })
      return map
    },
    fundList: (state) => state.list.filter(a => a.type === 'fund' && a.code)
  },
  actions: {
    add(asset) {
      const id = Date.now()
      this.list.push({
        id,
        type: asset.type,
        name: asset.name,
        code: asset.code || '',
        costAmount: Number(asset.costAmount) || 0,
        shares: Number(asset.shares) || 0,
        currentNav: Number(asset.currentNav) || 0,
        currentAmount: Number(asset.currentAmount) || Number(asset.costAmount) || 0,
        buyDate: asset.buyDate || '',
        remark: asset.remark || '',
        dailyChange: 0,
        lastUpdated: new Date().toISOString()
      })
      this.save()
    },
    update(id, patch) {
      const idx = this.list.findIndex(a => a.id === id)
      if (idx > -1) {
        this.list[idx] = { ...this.list[idx], ...patch }
        this.save()
      }
    },
    remove(id) {
      this.list = this.list.filter(a => a.id !== id)
      this.save()
    },
    async refreshAll() {
      this.refreshing = true
      try {
        const funds = this.fundList
        if (funds.length === 0) {
          this.refreshing = false
          return { success: true, updated: 0, failed: 0 }
        }
        const codes = funds.map(f => f.code)
        const results = await fetchFundNavs(codes)

        let updated = 0
        let failed = 0
        results.forEach(r => {
          if (r.success && r.data) {
            const asset = this.list.find(a => a.code === r.code)
            if (asset) {
              const newAmount = asset.shares > 0 ? asset.shares * r.data.nav : asset.currentAmount
              const yesterdayAmount = asset.currentAmount
              asset.currentNav = r.data.nav
              asset.currentAmount = newAmount
              asset.dailyChange = r.data.changePercent
              asset.dayProfit = newAmount - yesterdayAmount
              asset.lastUpdated = new Date().toISOString()
              updated++
            }
          } else {
            failed++
          }
        })
        this.lastRefresh = new Date().toISOString()
        storage.set('assets_last_refresh', this.lastRefresh)
        this.save()
        return { success: true, updated, failed }
      } catch (e) {
        console.error('刷新失败:', e)
        return { success: false, error: e.message }
      } finally {
        this.refreshing = false
      }
    },
    save() {
      storage.set('assets', this.list)
    }
  }
})
