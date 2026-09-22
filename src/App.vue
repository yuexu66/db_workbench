<template>
  <div id="app-container" :class="{ dark: settings.darkMode }">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar v-if="showTabBar" />
    <QuickAdd v-if="showTabBar" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useSettingsStore } from '@/stores/settings'
import { useHabitsStore } from '@/stores/habits'
import { today } from '@/utils/date'
import { notify, vibrate } from '@/utils/notify'
import TabBar from '@/components/TabBar.vue'
import QuickAdd from '@/components/QuickAdd.vue'

const route = useRoute()
const settings = useSettingsStore()
const habitsStore = useHabitsStore()

const showTabBar = computed(() => route.meta.showTabBar !== false)

// 应用内习惯提醒：每分钟检查一次，到点且今日未完成则通知+振动
let timer = null
const fired = new Set()

const checkReminders = () => {
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const date = today()
  settings.remindableHabits.forEach(h => {
    if (h.remind.time !== hhmm) return
    const key = `${date}_${h.id}`
    if (fired.has(key)) return
    if (habitsStore.isDone(h.id, date)) return
    fired.add(key)
    const title = `该打卡啦 · ${h.icon} ${h.name}`
    const body = settings.data.username + '，别忘了完成今天的' + h.name
    notify(title, body, key)
    vibrate([200, 100, 200])
    showToast({ message: title, position: 'top' })
  })
}

onMounted(() => {
  checkReminders()
  timer = setInterval(checkReminders, 60 * 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
