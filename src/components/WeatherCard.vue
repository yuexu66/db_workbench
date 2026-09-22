<template>
  <div class="weather-card" @click="refresh">
    <div class="weather-left">
      <div class="weather-emoji">{{ weatherEmoji }}</div>
      <div class="weather-info">
        <div class="weather-temp">{{ weather.temp }}<span class="unit">°C</span></div>
        <div class="weather-text">{{ weather.text }}</div>
      </div>
    </div>
    <div class="weather-right">
      <div class="weather-city">
        <van-icon name="location-o" size="14" />
        <span>{{ weather.city }}</span>
      </div>
      <div class="weather-meta">
        <span v-if="weather.feelsLike !== undefined && weather.feelsLike !== '--'">体感 {{ weather.feelsLike }}°</span>
        <span v-if="weather.humidity !== undefined && weather.humidity !== '--'">湿度 {{ weather.humidity }}%</span>
      </div>
      <div class="weather-advice">{{ weather.advice }}</div>
      <div v-if="loading" class="mock-tip">加载中…</div>
      <div v-else-if="weather.isMock" class="mock-tip">数据获取失败，点击重试</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { fetchWeather } from '@/utils/weather'

const settings = useSettingsStore()
const loading = ref(true)
const weather = ref({ temp: '--', text: '加载中', city: settings.data.city, advice: '' })

const weatherEmoji = computed(() => {
  const text = weather.value.text
  if (text.includes('雷')) return '⛈️'
  if (text.includes('雪')) return '❄️'
  if (text.includes('雨')) return '🌧️'
  if (text.includes('雾')) return '🌫️'
  if (text.includes('云')) return '⛅'
  if (text.includes('阴')) return '☁️'
  if (text.includes('晴')) return '☀️'
  return '🌤️'
})

const load = async () => {
  loading.value = true
  const data = await fetchWeather(settings.data.city, settings.data.weatherApiKey)
  weather.value = data
  loading.value = false
}

const refresh = () => {
  load()
}

onMounted(load)
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 55%, #dbeafe 100%);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.weather-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather-emoji {
  font-size: 40px;
  line-height: 1;
}

.weather-temp {
  font-size: 30px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.1;
  letter-spacing: -1px;
}

.weather-temp .unit {
  font-size: 16px;
  font-weight: 600;
  vertical-align: super;
}

.weather-text {
  font-size: 13px;
  color: #555;
  margin-top: 2px;
}

.weather-right {
  text-align: right;
}

.weather-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.weather-city {
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.weather-advice {
  font-size: 12px;
  color: #6366f1;
  margin-top: 4px;
}

.mock-tip {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}
</style>
