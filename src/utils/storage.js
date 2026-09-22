const PREFIX = 'pw_'

export const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
    // 保留“已初始化”标记，防止清空后 reload 时被演示数据重新灌入
    localStorage.setItem(PREFIX + 'seeded', 'true')
  },

  exportAll() {
    const data = {}
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => {
        data[k.replace(PREFIX, '')] = JSON.parse(localStorage.getItem(k))
      })
    return data
  },

  importAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value)
    })
  }
}
