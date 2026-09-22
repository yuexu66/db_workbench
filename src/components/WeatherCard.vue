<template>
  <div class="weather-card" @click="refresh">
    <div class="weather-left">
      <van-icon :name="weatherIcon" size="36" color="#fadb14" />
      <div class="weather-info">
        <div class="weather-temp">{{ weather.temp }}°C</div>
        <div class="weather-text">{{ weather.text }}</div>
      </div>
    </div>
    <div class="weather-right">
      <div class="weather-city">
        <van-icon name="location-o" size="14" />
        <span>{{ weather.city }}</span>
      </div>
      <div class="weather-advice">{{ weather.advice }}</div>
      <div v-if="weather.isMock" class="mock-tip">模拟数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { fetchWeather } from '@/utils/weather'

const settings = useSettingsStore()
const weather = ref({ temp: '--', text: '加载中', city: settings.data.city, advice: '' })

const weatherIcon = computed(() => {
  const text = weather.value.text
  if (text.includes('雨')) return 'water-o'
  if (text.includes('雪')) return 'fire-o'
  if (text.includes('云') || text.includes('阴')) return 'cloud'
  return 'fire-o'
})

const load = async () => {
  const data = await fetchWeather(settings.data.city, settings.data.weatherApiKey)
  weather.value = data
}

const refresh = () => {
  load()
}

onMounted(load)
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.weather-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather-temp {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.weather-text {
  font-size: 13px;
  color: #555;
}

.weather-right {
  text-align: right;
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
