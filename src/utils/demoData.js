import { today, formatDate } from './date'

/**
 * 生成演示数据，让应用看起来已经有数据在使用
 * 调用后会在 localStorage 中写入模拟数据
 */
export function seedDemoData() {
  seedTasks()
  seedReminders()
  seedExpenses()
  seedAssets()
  seedHabits()
}

function getRelativeDate(daysFromToday) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return formatDate(d, 'YYYY-MM-DD')
}

function seedTasks() {
  const key = 'pw_tasks'
  if (localStorage.getItem(key)) return
  const t = today()
  const tasks = [
    { id: 1001, title: '完成Q4季度汇报PPT', group: 'work', priority: 'high', completed: false, date: t, remark: '周四前提交给主管', subtasks: [{ id: 1, title: '收集数据', completed: true }, { id: 2, title: '制作图表', completed: false }, { id: 3, title: '排版美化', completed: false }], createdAt: new Date().toISOString() },
    { id: 1002, title: '代码评审 - 用户模块重构', group: 'work', priority: 'high', completed: false, date: t, remark: '重点关注权限改造部分', subtasks: [], createdAt: new Date().toISOString() },
    { id: 1003, title: '更新项目技术文档', group: 'work', priority: 'medium', completed: true, date: t, remark: '', subtasks: [], createdAt: new Date().toISOString() },
    { id: 1004, title: '预约下周体检', group: 'personal', priority: 'medium', completed: false, date: t, remark: '武汉协和医院', subtasks: [], createdAt: new Date().toISOString() },
    { id: 1005, title: '取快递 - 菜鸟驿站', group: 'personal', priority: 'low', completed: true, date: t, remark: '3个包裹', subtasks: [], createdAt: new Date().toISOString() },
    { id: 1006, title: '整理书房和换季衣物', group: 'personal', priority: 'low', completed: false, date: t, remark: '', subtasks: [], createdAt: new Date().toISOString() },
    { id: 1007, title: '准备周末团建活动方案', group: 'week', priority: 'medium', completed: false, date: getRelativeDate(3), remark: '预算3000以内', subtasks: [], createdAt: new Date().toISOString() },
    { id: 1008, title: '对比三款显示器选购', group: 'week', priority: 'low', completed: false, date: getRelativeDate(4), remark: 'Dell/U2723QE vs LG vs AOC', subtasks: [], createdAt: new Date().toISOString() }
  ]
  localStorage.setItem(key, JSON.stringify(tasks))
}

function seedReminders() {
  const key = 'pw_reminders'
  if (localStorage.getItem(key)) return
  const reminders = [
    { id: 2001, title: '妈妈生日', type: 'birthday', date: getRelativeDate(3), repeat: 'yearly', remindDays: [1, 3, 7], remark: '提前订蛋糕和礼物', amount: 0, createdAt: new Date().toISOString() },
    { id: 2002, title: '信用卡还款', type: 'bill', date: getRelativeDate(5), repeat: 'monthly', remindDays: [1, 3], remark: '招商银行', amount: 5000, createdAt: new Date().toISOString() },
    { id: 2003, title: '爱奇艺会员', type: 'subscription', date: getRelativeDate(2), repeat: 'monthly', remindDays: [1, 3], remark: '连续包月', amount: 25, createdAt: new Date().toISOString() },
    { id: 2004, title: '车辆年检', type: 'insurance', date: getRelativeDate(15), repeat: 'yearly', remindDays: [7, 30], remark: '', amount: 0, createdAt: new Date().toISOString() },
    { id: 2005, title: '身份证换领', type: 'id', date: getRelativeDate(20), repeat: 'none', remindDays: [7], remark: '武昌政务中心', amount: 0, createdAt: new Date().toISOString() },
    { id: 2006, title: '同事婚礼随礼', type: 'gift', date: getRelativeDate(6), repeat: 'none', remindDays: [1, 3], remark: '李明', amount: 600, createdAt: new Date().toISOString() },
    { id: 2007, title: '健身房月卡', type: 'subscription', date: getRelativeDate(1), repeat: 'monthly', remindDays: [1, 3], remark: '', amount: 200, createdAt: new Date().toISOString() },
    { id: 2008, title: '体检报告复查', type: 'health', date: getRelativeDate(10), repeat: 'none', remindDays: [1, 7], remark: '武汉协和医院', amount: 0, createdAt: new Date().toISOString() }
  ]
  localStorage.setItem(key, JSON.stringify(reminders))
}

function seedExpenses() {
  const key = 'pw_expenses'
  if (localStorage.getItem(key)) return
  const expenses = [
    { id: 3001, amount: 35, category: 'food', name: '午餐-外卖', date: today(), remark: '', createdAt: new Date().toISOString() },
    { id: 3002, amount: 15, category: 'parking', name: '公司停车', date: today(), remark: '', createdAt: new Date().toISOString() },
    { id: 3003, amount: 380, category: 'fuel', name: '加油-92号', date: getRelativeDate(-1), remark: '中石化', createdAt: new Date().toISOString() },
    { id: 3004, amount: 25, category: 'subscription', name: '爱奇艺月卡', date: getRelativeDate(-2), remark: '', createdAt: new Date().toISOString() },
    { id: 3005, amount: 30, category: 'subscription', name: '腾讯视频', date: getRelativeDate(-2), remark: '', createdAt: new Date().toISOString() },
    { id: 3006, amount: 200, category: 'subscription', name: '健身房月卡', date: getRelativeDate(-3), remark: '', createdAt: new Date().toISOString() },
    { id: 3007, amount: 89, category: 'shopping', name: '京东-办公用品', date: getRelativeDate(-3), remark: '打印纸+墨盒', createdAt: new Date().toISOString() },
    { id: 3008, amount: 156, category: 'food', name: '周末聚餐', date: getRelativeDate(-4), remark: '海底捞', createdAt: new Date().toISOString() },
    { id: 3009, amount: 45, category: 'transport', name: '打车-加班回家', date: getRelativeDate(-5), remark: '', createdAt: new Date().toISOString() },
    { id: 3010, amount: 280, category: 'utilities', name: '电费', date: getRelativeDate(-6), remark: '9月电费', createdAt: new Date().toISOString() },
    { id: 3011, amount: 68, category: 'food', name: '超市采购', date: getRelativeDate(-7), remark: '水果+牛奶', createdAt: new Date().toISOString() },
    { id: 3012, amount: 35, category: 'carwash', name: '洗车', date: getRelativeDate(-8), remark: '', createdAt: new Date().toISOString() },
    { id: 3013, amount: 15, category: 'subscription', name: '网易云音乐', date: getRelativeDate(-9), remark: '', createdAt: new Date().toISOString() },
    { id: 3014, amount: 6, category: 'subscription', name: 'iCloud', date: getRelativeDate(-9), remark: '', createdAt: new Date().toISOString() },
    { id: 3015, amount: 128, category: 'entertainment', name: '电影+爆米花', date: getRelativeDate(-10), remark: '变形金刚', createdAt: new Date().toISOString() },
    { id: 3016, amount: 2000, category: 'rent', name: '房租', date: getRelativeDate(-15), remark: '9月房租', createdAt: new Date().toISOString() },
    { id: 3017, amount: 500, category: 'medical', name: '感冒看诊', date: getRelativeDate(-12), remark: '社区医院', createdAt: new Date().toISOString() },
    { id: 3018, amount: 45, category: 'food', name: '早餐+咖啡', date: getRelativeDate(-2), remark: '瑞幸', createdAt: new Date().toISOString() }
  ]
  localStorage.setItem(key, JSON.stringify(expenses))
}

function seedAssets() {
  const key = 'pw_assets'
  if (localStorage.getItem(key)) return
  const assets = [
    { id: 4001, type: 'fund', name: '易方达蓝筹精选混合', code: '005827', costAmount: 15000, shares: 6800, currentNav: 2.35, currentAmount: 15980, buyDate: getRelativeDate(-180), remark: '', dailyChange: 1.25, dayProfit: 198, lastUpdated: new Date().toISOString() },
    { id: 4002, type: 'fund', name: '中欧医疗健康混合A', code: '003095', costAmount: 8000, shares: 4200, currentNav: 1.78, currentAmount: 7476, buyDate: getRelativeDate(-120), remark: '', dailyChange: -0.85, dayProfit: -64, lastUpdated: new Date().toISOString() },
    { id: 4003, type: 'stock', name: '贵州茅台', code: '600519', costAmount: 25000, shares: 15, currentNav: 1720, currentAmount: 25800, buyDate: getRelativeDate(-90), remark: '', dailyChange: 0.58, dayProfit: 149, lastUpdated: new Date().toISOString() },
    { id: 4004, type: 'wealth', name: '招银理财稳健增强', code: '', costAmount: 50000, shares: 0, currentNav: 0, currentAmount: 50625, buyDate: getRelativeDate(-60), remark: '年化3.8%', dailyChange: 0, dayProfit: 0, lastUpdated: new Date().toISOString() },
    { id: 4005, type: 'deposit', name: '活期存款', code: '', costAmount: 20000, shares: 0, currentNav: 0, currentAmount: 20000, buyDate: getRelativeDate(-30), remark: '', dailyChange: 0, dayProfit: 0, lastUpdated: new Date().toISOString() },
    { id: 4006, type: 'fund', name: '天弘余额宝', code: '000198', costAmount: 10000, shares: 10000, currentNav: 1.002, currentAmount: 10020, buyDate: getRelativeDate(-200), remark: '', dailyChange: 0.01, dayProfit: 1, lastUpdated: new Date().toISOString() }
  ]
  localStorage.setItem(key, JSON.stringify(assets))
  localStorage.setItem('pw_assets_last_refresh', JSON.stringify(new Date().toISOString()))
}

function seedHabits() {
  const key = 'pw_habit_records'
  if (localStorage.getItem(key)) return
  const records = {}
  const habitIds = [1, 2, 3, 4, 5]
  // 过去10天的打卡记录，越近越完整
  const checkPatterns = [
    [1, 1, 1, 1, 1],  // 10天前：全打
    [1, 1, 0, 1, 1],  // 9天前
    [1, 0, 1, 1, 1],  // 8天前
    [1, 1, 1, 1, 0],  // 7天前
    [1, 1, 1, 1, 1],  // 6天前：全打
    [0, 1, 1, 1, 1],  // 5天前
    [1, 1, 0, 1, 1],  // 4天前
    [1, 1, 1, 1, 1],  // 3天前：全打
    [1, 0, 1, 1, 1],  // 2天前
    [1, 1, 1, 0, 1],  // 昨天
  ]
  for (let i = 0; i < checkPatterns.length; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (checkPatterns.length - i))
    const dateStr = formatDate(d, 'YYYY-MM-DD')
    records[dateStr] = {}
    habitIds.forEach((hid, idx) => {
      records[dateStr][hid] = !!checkPatterns[i][idx]
    })
  }
  // 今天也部分打卡
  records[today()] = { 1: true, 2: false, 3: true, 4: false, 5: true }
  localStorage.setItem(key, JSON.stringify(records))
}
