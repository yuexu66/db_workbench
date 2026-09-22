// 网页/PWA 通知与振动封装
// 说明：Web Notification 与 navigator.vibrate 仅在应用处于打开状态时可靠触发；
// 锁屏后台定时推送需原生打包（Capacitor 插件），此处为应用内提醒方案。

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

// 请求通知权限，返回最终权限状态
export async function requestNotifyPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

// 发送系统通知（需已授权），失败自动降级为不处理
export function notify(title, body = '', tag = '') {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return false
  try {
    const n = new Notification(title, {
      body,
      tag,
      icon: './icon-192.png',
      vibrate: [200, 100, 200]
    })
    n.onclick = () => { window.focus(); n.close() }
    return true
  } catch (e) {
    console.error('通知失败:', e)
    return false
  }
}

// 振动（带降级）
export function vibrate(pattern = [200, 100, 200]) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
      return true
    }
  } catch (e) {
    console.error('振动失败:', e)
  }
  return false
}
