/**
 * 在应用首次加载时注入演示数据
 * 仅在 localStorage 为空时写入
 */
import { seedDemoData } from './demoData'

export function initDemoData() {
  // 检查是否已有任何数据，如果完全空白则注入演示数据
  const hasAnyData = ['pw_tasks', 'pw_reminders', 'pw_expenses', 'pw_assets', 'pw_habit_records']
    .some(key => {
      try {
        const val = localStorage.getItem(key)
        return val && val !== '[]' && val !== '{}'
      } catch { return false }
    })

  if (!hasAnyData) {
    seedDemoData()
  }
}
