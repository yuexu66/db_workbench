import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

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
    { id: 1, name: '喝水', icon: 'water' },
    { id: 2, name: '跑步', icon: 'run' },
    { id: 3, name: '阅读', icon: 'book' },
    { id: 4, name: '早睡', icon: 'moon' },
    { id: 5, name: '吃药', icon: 'pill' }
  ]
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    data: storage.get('settings', defaultSettings)
  }),
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
      this.data.habits.push({ id, ...habit })
      storage.set('settings', this.data)
    },
    removeHabit(id) {
      this.data.habits = this.data.habits.filter(h => h.id !== id)
      storage.set('settings', this.data)
    },
    reset() {
      this.data = { ...defaultSettings }
      storage.set('settings', this.data)
    }
  }
})
