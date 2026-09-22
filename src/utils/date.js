const WEEKDAYS_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatDate(date, fmt = 'YYYY-MM-DD') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const weekday = WEEKDAYS_CN[d.getDay()]
  return fmt
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    // 中文令牌：先替换长令牌再替换短令牌，避免被 MM/DD 影响
    .replace('dddd', weekday)
    .replace('ddd', weekday.replace('周', '星期'))
    .replace(/(^|[^A-Za-z])M([^M]|$)/g, (_, p, n) => p + (d.getMonth() + 1) + n)
    .replace(/(^|[^A-Za-z])D([^D]|$)/g, (_, p, n) => p + d.getDate() + n)
}

// 返回如 "9月22日 周二" 的中文日期
export function formatCNDate(date = new Date()) {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS_CN[d.getDay()]}`
}

export function today() {
  return formatDate(new Date(), 'YYYY-MM-DD')
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

export function daysUntil(dateStr) {
  return daysBetween(today(), dateStr)
}

export function countdownText(dateStr) {
  const days = daysUntil(dateStr)
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days < 0) return `已过${Math.abs(days)}天`
  if (days < 30) return `还有${days}天`
  if (days < 365) return `还有${Math.floor(days / 30)}个月`
  return `还有${Math.floor(days / 365)}年`
}

export function getNextOccurrence(dateStr, repeat) {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)

  if (target >= now) return formatDate(target)

  switch (repeat) {
    case 'daily':
      return formatDate(now)
    case 'weekly': {
      const dayOfWeek = target.getDay()
      const diff = (dayOfWeek - now.getDay() + 7) % 7
      const next = new Date(now)
      next.setDate(now.getDate() + (diff === 0 ? 7 : diff))
      return formatDate(next)
    }
    case 'monthly': {
      const day = target.getDate()
      let next = new Date(now.getFullYear(), now.getMonth(), day)
      if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, day)
      return formatDate(next)
    }
    case 'yearly': {
      let next = new Date(now.getFullYear(), target.getMonth(), target.getDate())
      if (next <= now) next = new Date(now.getFullYear() + 1, target.getMonth(), target.getDate())
      return formatDate(next)
    }
    default:
      return formatDate(target)
  }
}

export function isWorkday(date = new Date()) {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

export function getWeekDates() {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push({
      date: formatDate(d),
      day: d.getDate(),
      weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      isToday: formatDate(d) === today()
    })
  }
  return dates
}

export function formatMoney(amount) {
  return Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
