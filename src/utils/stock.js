// 腾讯股票行情公开接口，通过 <script> 注入读取全局变量，绕开浏览器 CORS 限制
// 接口示例: https://qt.gtimg.cn/q=sh600519  返回 v_sh600519="1~贵州茅台~600519~1723.00~..."

// 根据股票代码推断市场前缀
export function normalizeStockCode(input) {
  if (!input) return ''
  let code = String(input).trim().toLowerCase()
  if (/^(sh|sz|bj|hk|us)/.test(code)) return code
  // 纯数字，按首位推断
  if (/^6/.test(code)) return 'sh' + code
  if (/^(0|3)/.test(code)) return 'sz' + code
  if (/^(4|8)/.test(code)) return 'bj' + code
  return 'sh' + code
}

function parseQuote(raw) {
  // raw 形如 "1~贵州茅台~600519~1723.00~1720.00~..."
  const f = raw.split('~')
  if (f.length < 33) return null
  const price = Number(f[3])
  const prevClose = Number(f[4])
  const change = Number(f[31])
  const changePercent = Number(f[32])
  return {
    name: f[1],
    code: f[2],
    price,
    prevClose,
    change,
    changePercent
  }
}

export function fetchStockQuote(code) {
  return new Promise((resolve, reject) => {
    const full = normalizeStockCode(code)
    if (!full) return reject(new Error('股票代码无效'))
    const varName = 'v_' + full
    const script = document.createElement('script')
    const url = `https://qt.gtimg.cn/q=${full}&rt=${Date.now()}`

    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('获取超时'))
    }, 8000)

    function cleanup() {
      clearTimeout(timeout)
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    script.onload = () => {
      const val = window[varName]
      cleanup()
      if (typeof val === 'string') {
        const data = parseQuote(val)
        if (data && data.price > 0) resolve(data)
        else reject(new Error('无有效行情数据'))
      } else {
        reject(new Error('股票代码无效或无数据'))
      }
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('网络请求失败'))
    }

    script.src = url
    document.body.appendChild(script)
  })
}

// 批量获取
export async function fetchStockQuotes(codes) {
  const results = await Promise.allSettled(
    codes.map(code => fetchStockQuote(code))
  )
  return results.map((r, i) => ({
    code: codes[i],
    success: r.status === 'fulfilled',
    data: r.status === 'fulfilled' ? r.value : null,
    error: r.status === 'rejected' ? r.reason.message : null
  }))
}
