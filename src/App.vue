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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import TabBar from '@/components/TabBar.vue'
import QuickAdd from '@/components/QuickAdd.vue'

const route = useRoute()
const settings = useSettingsStore()

const showTabBar = computed(() => route.meta.showTabBar !== false)
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
