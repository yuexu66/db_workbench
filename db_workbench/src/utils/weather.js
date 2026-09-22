import axios from 'axios'

// 和风天气API - 需要用户在设置中填入key
// 文档: https://dev.qweather.com/

export async function fetchWeather(city, apiKey) {
  if (!apiKey) {
    return getMockWeather(city)
  }
  try {
    // 1. 城市搜索获取location id
    const geoRes = await axios.get('https://geoapi.qweather.com/v2/city/lookup', {
      params: { location: city, key: apiKey }
    })
    if (!geoRes.data.location || geoRes.data.location.length === 0) {
      throw new Error('城市未找到')
    }
    const locationId = geoRes.data.location[0].id

    // 2. 获取实时天气
    const weatherRes = await axios.get('https://devapi.qweather.com/v7/weather/now', {
      params: { location: locationId, key: apiKey }
    })
    const now = weatherRes.data.now

    return {
      city,
      temp: now.temp,
      text: now.text,
      icon: now.icon,
      feelsLike: now.feelsLike,
      humidity: now.humidity,
      windDir: now.windDir,
      windScale: now.windScale,
      advice: getClothingAdvice(now.temp, now.text)
    }
  } catch (e) {
    console.error('天气获取失败:', e)
    return getMockWeather(city)
  }
}

function getClothingAdvice(temp, text) {
  const t = Number(temp)
  if (text.includes('雨') || text.includes('雪')) return '今天有降水，记得带伞'
  if (t <= 5) return '今天寒冷，建议穿羽绒服'
  if (t <= 10) return '今天较冷，建议穿厚外套'
  if (t <= 18) return '今天降温，建议穿薄外套'
  if (t <= 24) return '温度适宜，穿长袖即可'
  if (t <= 30) return '天气较热，穿短袖即可'
  return '今天炎热，注意防晒补水'
}

function getMockWeather(city) {
  const temps = [18, 22, 26, 28, 15, 20, 24]
  const texts = ['晴', '多云', '阴', '小雨']
  const temp = temps[Math.floor(Math.random() * temps.length)]
  const text = texts[Math.floor(Math.random() * texts.length)]
  return {
    city,
    temp,
    text,
    icon: '100',
    feelsLike: temp,
    humidity: 60,
    windDir: '东南风',
    windScale: '2',
    advice: getClothingAdvice(temp, text),
    isMock: true
  }
}
