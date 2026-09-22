<template>
  <div class="finance-page">
    <div class="finance-tabs">
      <div
        class="finance-tab"
        :class="{ active: activeTab === 'expense' }"
        @click="activeTab = 'expense'"
      >
        开支记录
      </div>
      <div
        class="finance-tab"
        :class="{ active: activeTab === 'asset' }"
        @click="activeTab = 'asset'"
      >
        我的资产
      </div>
    </div>
    <ExpenseTab v-show="activeTab === 'expense'" />
    <AssetTab v-show="activeTab === 'asset'" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ExpenseTab from './finance/ExpenseTab.vue'
import AssetTab from './finance/AssetTab.vue'

const route = useRoute()
const activeTab = ref('expense')

onMounted(() => {
  if (route.query.tab === 'asset') {
    activeTab.value = 'asset'
  }
})

watch(() => route.query, (q) => {
  if (q.tab === 'asset') activeTab.value = 'asset'
  if (q.tab === 'expense') activeTab.value = 'expense'
})
</script>

<style scoped>
.finance-page {
  min-height: 100vh;
  background: #f5f6fa;
}

.finance-tabs {
  display: flex;
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.finance-tab {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #999;
  position: relative;
  cursor: pointer;
}

.finance-tab.active {
  color: #4A90D9;
  font-weight: 600;
}

.finance-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: #4A90D9;
  border-radius: 2px;
}
</style>
