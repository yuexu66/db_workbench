import axios from 'axios'

// 默认使用 Open-Meteo（免费、无需 API Key、支持 CORS）
// 若用户在设置中填入和风天气 Key，则优先使用和风。
// 文档: https://open-meteo.com/ | https://dev.qweather.com/

// WMO 天气代码 -> 中文文案
const WMO_TEXT = {
  0: '晴', 1: '晴间多云', 2: '多云', 3: '阴',
  45: '雾', 48: '雾凇',
  51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨',
  56: '冻雨', 57: '冻雨',
  61: '小雨', 63: '中雨', 65: '大雨',
  66: '冻雨', 67: '冻雨',
  71: '小雪', 73: '中雪', 75: '大雪', 77: '雪',
  80: '阵雨', 81: '阵雨', 82: '强阵雨',
  85: '阵雪', 86: '阵雪',
  95: '雷阵雨', 96: '雷阵雨', 99: '雷阵雨'
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

// 通过 Open-Meteo 地理编码获取城市坐标
async function geocode(city) {
  const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'zh', format: 'json' }
  })
  const loc = res.data?.results?.[0]
  if (!loc) throw new Error('城市未找到')
  return { latitude: loc.latitude, longitude: loc.longitude, name: loc.name }
}

async function fetchWeatherOpenMeteo(city) {
  const { latitude, longitude, name } = await geocode(city)
  const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'auto'
    }
  })
  const c = res.data.current
  const temp = Math.round(c.temperature_2m)
  const text = WMO_TEXT[c.weather_code] || '未知'
  return {
    city: name || city,
    temp,
    text,
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m),
    advice: getClothingAdvice(temp, text),
    source: 'open-meteo'
  }
}

async function fetchWeatherQweather(city, apiKey) {
  const geoRes = await axios.get('https://geoapi.qweather.com/v2/city/lookup', {
    params: { location: city, key: apiKey }
  })
  if (!geoRes.data.location || geoRes.data.location.length === 0) {
    throw new Error('城市未找到')
  }
  const locationId = geoRes.data.location[0].id
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
    advice: getClothingAdvice(now.temp, now.text),
    source: 'qweather'
  }
}

export async function fetchWeather(city, apiKey) {
  try {
    if (apiKey) {
      return await fetchWeatherQweather(city, apiKey)
    }
    return await fetchWeatherOpenMeteo(city)
  } catch (e) {
    console.error('天气获取失败:', e)
    return getFallbackWeather(city)
  }
}

function getFallbackWeather(city) {
  return {
    city,
    temp: '--',
    text: '暂无数据',
    feelsLike: '--',
    humidity: '--',
    windSpeed: '--',
    advice: '点击重试获取天气',
    isMock: true
  }
}
