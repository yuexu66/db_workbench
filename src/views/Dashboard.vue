<template>
  <div class="dashboard-page">
    <div class="page-header">
      <van-icon name="arrow-left" size="20" @click="$router.back()" />
      <span class="page-title">数据看板</span>
    </div>

    <div class="page-content">
      <!-- 支出趋势 -->
      <div class="card">
        <div class="card-title">
          <van-icon name="chart-trending-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #6366f1;" />支出趋势
        </div>
        <div ref="trendChart" class="chart-container"></div>
      </div>

      <!-- 支出分类占比 -->
      <div class="card">
        <div class="card-title">
          <van-icon name="pie-chart-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #8b5cf6;" />支出分类占比
        </div>
        <div ref="pieChart" class="chart-container"></div>
      </div>

      <!-- 订阅年度成本 -->
      <div class="card">
        <div class="card-title">
          <van-icon name="gem-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #10b981;" />订阅年度成本
        </div>
        <div ref="subChart" class="chart-container"></div>
      </div>

      <!-- 任务完成率 -->
      <div class="card">
        <div class="card-title">
          <van-icon name="todo-list-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #f59e0b;" />任务完成率
        </div>
        <div ref="taskChart" class="chart-container"></div>
      </div>

      <!-- 习惯坚持 -->
      <div class="card">
        <div class="card-title">
          <van-icon name="award-o" size="15" style="margin-right: 6px; vertical-align: -2px; color: #ec4899;" />习惯坚持天数
        </div>
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

// 高级配色方案
const COLORS = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  emerald: '#10b981',
  pink: '#ec4899'
}

const initCharts = () => {
  // 支出趋势 - 渐变面积图
  const trend = echarts.init(trendChart.value)
  const trendData = expensesStore.monthlyTrend
  trend.setOption({
    grid: { left: '12%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: trendData.map(d => d.month), axisLabel: { fontSize: 11, color: '#94a3b8' }, axisLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#94a3b8' }, splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } } },
    series: [{
      data: trendData.map(d => d.total),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(99, 102, 241, 0.25)' },
          { offset: 1, color: 'rgba(99, 102, 241, 0.02)' }
        ])
      },
      lineStyle: { color: COLORS.indigo, width: 2.5 },
      itemStyle: { color: COLORS.indigo, borderWidth: 2, borderColor: '#fff' },
      symbolSize: 6
    }],
    tooltip: { trigger: 'axis', confine: true, backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', textStyle: { color: '#1e1b4b' } }
  })
  charts.push(trend)

  // 支出分类占比 - 现代配色环形图
  const pie = echarts.init(pieChart.value)
  const catData = Object.entries(expensesStore.thisMonthByCategory).map(([key, value]) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.key === key)
    return { name: cat?.label || key, value }
  }).filter(d => d.value > 0)
  const pieColors = [COLORS.indigo, COLORS.violet, COLORS.teal, COLORS.amber, COLORS.rose, COLORS.sky, COLORS.emerald, COLORS.pink, '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#e11d48', '#64748b']
  pie.setOption({
    tooltip: { trigger: 'item', confine: true, formatter: '{b}: ¥{c} ({d}%)', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', textStyle: { color: '#1e1b4b' } },
    legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11, color: '#64748b' } },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: catData,
      color: pieColors,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }
    }]
  })
  charts.push(pie)

  // 订阅年度成本 - 渐变条形图
  const sub = echarts.init(subChart.value)
  const subs = [
    { name: '健身房', value: 2400 },
    { name: '百度网盘', value: 360 },
    { name: '腾讯视频', value: 360 },
    { name: '爱奇艺', value: 300 },
    { name: '网易云', value: 180 },
    { name: 'iCloud', value: 72 }
  ]
  const barColors = [COLORS.emerald, COLORS.teal, COLORS.rose, COLORS.emerald, COLORS.rose, COLORS.indigo]
  sub.setOption({
    grid: { left: '20%', right: '10%', top: '5%', bottom: '10%' },
    xAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#94a3b8' }, splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } } },
    yAxis: { type: 'category', data: subs.map(s => s.name), axisLabel: { fontSize: 11, color: '#64748b' }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar',
      data: subs.map((s, i) => ({
        value: s.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: barColors[i] + '99' },
            { offset: 1, color: barColors[i] }
          ]),
          borderRadius: [0, 6, 6, 0]
        }
      })),
      barWidth: 14
    }],
    tooltip: { trigger: 'axis', confine: true, backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', textStyle: { color: '#1e1b4b' }, formatter: '{b}: ¥{c}/年' }
  })
  charts.push(sub)

  // 任务完成率 - 圆角柱状图
  const task = echarts.init(taskChart.value)
  const weeks = ['第1周', '第2周', '第3周', '第4周']
  const rates = [72, 85, 68, 90]
  task.setOption({
    grid: { left: '12%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11, color: '#94a3b8' }, axisLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 10, color: '#94a3b8', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } } },
    series: [{
      type: 'bar',
      data: rates.map((v, i) => ({
        value: v,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: COLORS.amber },
            { offset: 1, color: COLORS.amber + '66' }
          ]),
          borderRadius: [6, 6, 0, 0]
        }
      })),
      barWidth: 28
    }],
    tooltip: { trigger: 'axis', confine: true, backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', textStyle: { color: '#1e1b4b' }, formatter: '{b}: {c}%' }
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
  background: transparent;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e1b4b;
}

.page-content {
  padding: 12px;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e1b4b;
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
  padding: 14px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.03);
}

.habit-stat-name {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.habit-stat-days {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}
</style>
