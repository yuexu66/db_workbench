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
