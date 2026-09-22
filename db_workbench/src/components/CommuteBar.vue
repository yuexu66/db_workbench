<template>
  <div v-if="showCommute" class="commute-bar">
    <van-icon name="location-o" size="18" color="#fff" />
    <div class="commute-info">
      <span class="commute-text">距上班还有 {{ minutesLeft }} 分钟</span>
      <span class="commute-sub">预计通勤 {{ commute.commuteDuration }} 分钟{{ shouldLeave ? '，建议现在出门' : '' }}</span>
    </div>
    <van-icon name="arrow" size="16" color="#fff" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { isWorkday } from '@/utils/date'

const settings = useSettingsStore()
const commute = computed(() => settings.data.commute)
const now = ref(new Date())

let timer = null

const minutesLeft = computed(() => {
  const [h, m] = commute.value.workTime.split(':').map(Number)
  const workTime = new Date()
  workTime.setHours(h, m, 0, 0)
  const diff = Math.round((workTime - now.value) / 60000)
  return diff > 0 ? diff : 0
})

const shouldLeave = computed(() => {
  return minutesLeft.value <= commute.value.commuteDuration + 5
})

const showCommute = computed(() => {
  if (!commute.value.workTime) return false
  if (!isWorkday(now.value)) return false
  const [h, m] = commute.value.workTime.split(':').map(Number)
  const workTime = new Date()
  workTime.setHours(h, m, 0, 0)
  const offTime = new Date()
  const [oh, om] = commute.value.offTime.split(':').map(Number)
  offTime.setHours(oh, om, 0, 0)
  return now.value < workTime && now.value.getHours() >= 5
})

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.commute-bar {
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.commute-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.commute-text {
  font-size: 15px;
  font-weight: 600;
}

.commute-sub {
  font-size: 12px;
  opacity: 0.85;
}
</style>
