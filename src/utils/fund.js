// 天天基金公开接口 - 无需API Key
// 接口返回JSONP格式，需要通过script标签注入或代理

export async function fetchFundNav(fundCode) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpgz'
    const script = document.createElement('script')
    const url = `https://fundgz.1234567.com.cn/js/${fundCode}.js?rt=${Date.now()}`

    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('获取超时'))
    }, 8000)

    function cleanup() {
      clearTimeout(timeout)
      document.body.removeChild(script)
      delete window[callbackName]
    }

    window[callbackName] = (data) => {
      cleanup()
      if (data && data.gsz) {
        resolve({
          code: data.fundcode,
          name: data.name,
          nav: Number(data.gsz), // 估算净值
          navDate: data.gztime,
          changePercent: Number(data.gszzl) // 估算涨跌幅 %
        })
      } else {
        reject(new Error('基金代码无效或无数据'))
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

// 批量获取多只基金净值
export async function fetchFundNavs(fundCodes) {
  const results = await Promise.allSettled(
    fundCodes.map(code => fetchFundNav(code))
  )
  return results.map((r, i) => ({
    code: fundCodes[i],
    success: r.status === 'fulfilled',
    data: r.status === 'fulfilled' ? r.value : null,
    error: r.status === 'rejected' ? r.reason.message : null
  }))
}
