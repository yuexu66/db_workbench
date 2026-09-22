import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import { today } from '@/utils/date'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    list: storage.get('tasks', [])
  }),
  getters: {
    todayTasks: (state) => state.list.filter(t => t.date === today() || (!t.date && t.group !== 'week')),
    workTasks: (state) => state.list.filter(t => t.group === 'work'),
    personalTasks: (state) => state.list.filter(t => t.group === 'personal'),
    weekTasks: (state) => state.list.filter(t => t.group === 'week'),
    todayCompleted: (state) => state.list.filter(t => (t.date === today() || (!t.date && t.group !== 'week')) && t.completed).length,
    todayTotal: (state) => state.list.filter(t => t.date === today() || (!t.date && t.group !== 'week')).length
  },
  actions: {
    add(task) {
      const id = Date.now()
      this.list.unshift({
        id,
        title: task.title,
        group: task.group || 'personal',
        priority: task.priority || 'medium',
        completed: false,
        date: task.date || today(),
        remark: task.remark || '',
        subtasks: task.subtasks || [],
        createdAt: new Date().toISOString()
      })
      this.save()
    },
    update(id, patch) {
      const idx = this.list.findIndex(t => t.id === id)
      if (idx > -1) {
        this.list[idx] = { ...this.list[idx], ...patch }
        this.save()
      }
    },
    toggle(id) {
      const task = this.list.find(t => t.id === id)
      if (task) {
        task.completed = !task.completed
        this.save()
      }
    },
    remove(id) {
      this.list = this.list.filter(t => t.id !== id)
      this.save()
    },
    toggleSubtask(taskId, subtaskId) {
      const task = this.list.find(t => t.id === taskId)
      if (task && task.subtasks) {
        const st = task.subtasks.find(s => s.id === subtaskId)
        if (st) {
          st.completed = !st.completed
          this.save()
        }
      }
    },
    save() {
      storage.set('tasks', this.list)
    }
  }
})
