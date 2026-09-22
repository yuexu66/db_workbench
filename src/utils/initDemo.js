/**
 * 在应用首次加载时注入演示数据
 * 仅在“从未初始化过”时写入一次；用户主动清空数据后不会再次注入
 */
import { seedDemoData } from './demoData'

const SEEDED_KEY = 'pw_seeded'

export function initDemoData() {
  // 已经初始化过（含用户清空数据后），不再灌入演示数据
  if (localStorage.getItem(SEEDED_KEY) === 'true') return

  seedDemoData()
  localStorage.setItem(SEEDED_KEY, 'true')
}
