<template>
  <div class="dashboard-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">数据看板</span>
    </div>

    <div class="page-content">
      <!-- 支出趋势 -->
      <div class="card">
        <div class="card-title">支出趋势</div>
        <div ref="trendChart" class="chart-container"></div>
      </div>

      <!-- 支出分类占比 -->
      <div class="card">
        <div class="card-title">支出分类占比</div>
        <div ref="pieChart" class="chart-container"></div>
      </div>

      <!-- 订阅年度成本 -->
      <div class="card">
        <div class="card-title">订阅年度成本</div>
        <div ref="subChart" class="chart-container"></div>
      </div>

      <!-- 任务完成率 -->
      <div class="card">
        <div class="card-title">任务完成率</div>
        <div ref="taskChart" class="chart-container"></div>
      </div>

      <!-- 习惯坚持 -->
      <div class="card">
        <div class="card-title">习惯坚持天数</div>
        <div class="habit-stats">
          <div v-for="h in settings.data.habits" :key="h.id" class="habit-stat">
            <div class="habit-stat-name">{{ h.name }}</div>
            <div class="habit-stat-days">{{ habitsStore.streakDays(h.id) }}天</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useSettingsStore } from '@/stores/settings'
import { useExpensesStore, EXPENSE_CATEGORIES } from '@/stores/expenses'
import { useHabitsStore } from '@/stores/habits'

const settings = useSettingsStore()
const expensesStore = useExpensesStore()
const habitsStore = useHabitsStore()

const trendChart = ref(null)
const pieChart = ref(null)
const subChart = ref(null)
const taskChart = ref(null)

let charts = []

const initCharts = () => {
  // 支出趋势
  const trend = echarts.init(trendChart.value)
  const trendData = expensesStore.monthlyTrend
  trend.setOption({
    grid: { left: '12%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: trendData.map(d => d.month), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{
      data: trendData.map(d => d.total),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(74,144,217,0.15)' },
      lineStyle: { color: '#4A90D9', width: 2 },
      itemStyle: { color: '#4A90D9' }
    }],
    tooltip: { trigger: 'axis', confine: true }
  })
  charts.push(trend)

  // 支出分类占比
  const pie = echarts.init(pieChart.value)
  const catData = Object.entries(expensesStore.thisMonthByCategory).map(([key, value]) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.key === key)
    return { name: cat?.label || key, value }
  }).filter(d => d.value > 0)
  pie.setOption({
    tooltip: { trigger: 'item', confine: true, formatter: '{b}: ¥{c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: catData,
      color: EXPENSE_CATEGORIES.map(c => c.color)
    }]
  })
  charts.push(pie)

  // 订阅年度成本
  const sub = echarts.init(subChart.value)
  const subs = [
    { name: '健身房', value: 2400 },
    { name: '百度网盘', value: 360 },
    { name: '腾讯视频', value: 360 },
    { name: '爱奇艺', value: 300 },
    { name: '网易云', value: 180 },
    { name: 'iCloud', value: 72 }
  ]
  sub.setOption({
    grid: { left: '20%', right: '10%', top: '5%', bottom: '10%' },
    xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    yAxis: { type: 'category', data: subs.map(s => s.name), axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar',
      data: subs.map(s => s.value),
      itemStyle: { color: '#52c41a', borderRadius: [0, 4, 4, 0] },
      barWidth: 14
    }],
    tooltip: { trigger: 'axis', confine: true, formatter: '{b}: ¥{c}/年' }
  })
  charts.push(sub)

  // 任务完成率
  const task = echarts.init(taskChart.value)
  const weeks = ['第1周', '第2周', '第3周', '第4周']
  const rates = [72, 85, 68, 90]
  task.setOption({
    grid: { left: '12%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 10, formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: rates,
      itemStyle: { color: '#4A90D9', borderRadius: [4, 4, 0, 0] },
      barWidth: 24
    }],
    tooltip: { trigger: 'axis', confine: true, formatter: '{b}: {c}%' }
  })
  charts.push(task)

  // resize
  const ro = new ResizeObserver(() => charts.forEach(c => c.resize()))
  charts.forEach(c => ro.observe(c.getDom()))
}

onMounted(() => {
  setTimeout(initCharts, 100)
})

onUnmounted(() => {
  charts.forEach(c => c.dispose())
  charts = []
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f6fa;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
}

.page-content {
  padding: 12px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.chart-container {
  width: 100%;
  height: 220px;
}

.habit-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.habit-stat {
  text-align: center;
  padding: 12px;
  background: #f8f9fc;
  border-radius: 10px;
}

.habit-stat-name {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.habit-stat-days {
  font-size: 20px;
  font-weight: 700;
  color: #52c41a;
}
</style>
