<template>
  <div class="page tasks-page">
    <div class="page-header">
      <div class="page-title">今日任务</div>
      <van-datetime-picker
        v-model:show="showDatePicker"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
      />
      <div class="date-selector" @click="showDatePicker = true">
        {{ selectedDate }} <van-icon name="arrow-down" size="12" />
      </div>
    </div>

    <!-- 进度环 -->
    <div class="progress-card">
      <div class="progress-ring">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#f0f0f0" stroke-width="5" />
          <circle cx="30" cy="30" r="26" fill="none" stroke="#4A90D9" stroke-width="5"
            stroke-linecap="round" :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset" transform="rotate(-90 30 30)" />
        </svg>
        <div class="progress-text">{{ tasksStore.todayCompleted }}/{{ tasksStore.todayTotal }}</div>
      </div>
      <div class="progress-info">
        <div class="progress-label">今日完成</div>
        <div class="progress-desc">{{ remaining }} 项待完成</div>
      </div>
    </div>

    <!-- 任务分组 -->
    <div class="task-groups">
      <div v-for="group in groups" :key="group.key" class="task-group">
        <div class="group-header" @click="toggleGroup(group.key)">
          <van-icon :name="group.expanded ? 'arrow-down' : 'arrow'" size="12" />
          <span class="group-title">{{ group.label }}</span>
          <span class="group-count">{{ getGroupTasks(group.key).length }}</span>
        </div>
        <div v-show="group.expanded" class="group-content card">
          <TaskItem
            v-for="task in getGroupTasks(group.key)"
            :key="task.id"
            :task="task"
            @toggle="tasksStore.toggle"
            @click="editTask"
          />
          <EmptyState
            v-if="getGroupTasks(group.key).length === 0"
            icon="records"
            text="暂无任务"
            :action-text="'添加任务'"
            @action="showAdd = true"
          />
        </div>
      </div>
    </div>

    <!-- 习惯打卡 -->
    <div class="card">
      <HabitChecker />
    </div>

    <!-- 本周视图 -->
    <div class="card week-view">
      <div class="section-title">本周日程</div>
      <div class="week-dates">
        <div
          v-for="d in weekDates"
          :key="d.date"
          class="week-date"
          :class="{ today: d.isToday, selected: d.date === selectedDate }"
          @click="selectDate(d.date)"
        >
          <div class="week-weekday">周{{ d.weekday }}</div>
          <div class="week-day">{{ d.day }}</div>
          <div class="week-dot" v-if="getDateTaskCount(d.date) > 0"></div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑任务弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup-content">
        <div class="popup-title">{{ editingTask ? '编辑任务' : '添加任务' }}</div>
        <van-field v-model="form.title" label="任务" placeholder="请输入任务内容" />
        <van-field name="group" label="分组">
          <template #input>
            <van-radio-group v-model="form.group" direction="horizontal">
              <van-radio name="work">工作</van-radio>
              <van-radio name="personal">个人</van-radio>
              <van-radio name="week">本周</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="priority" label="优先级">
          <template #input>
            <van-radio-group v-model="form.priority" direction="horizontal">
              <van-radio name="high">高</van-radio>
              <van-radio name="medium">中</van-radio>
              <van-radio name="low">低</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-model="form.remark" label="备注" type="textarea" rows="2" placeholder="选填" />
        <div class="popup-actions">
          <van-button block type="primary" @click="saveTask">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useHabitsStore } from '@/stores/habits'
import { today, formatDate, getWeekDates } from '@/utils/date'
import TaskItem from '@/components/TaskItem.vue'
import HabitChecker from '@/components/HabitChecker.vue'
import EmptyState from '@/components/EmptyState.vue'

const tasksStore = useTasksStore()
const habitsStore = useHabitsStore()

const selectedDate = ref(today())
const showDatePicker = ref(false)
const showAdd = ref(false)
const editingTask = ref(null)
const minDate = new Date(2024, 0, 1)
const maxDate = new Date(2027, 11, 31)

const form = reactive({
  title: '',
  group: 'personal',
  priority: 'medium',
  remark: ''
})

const groups = ref([
  { key: 'work', label: '工作任务', expanded: true },
  { key: 'personal', label: '个人事项', expanded: true },
  { key: 'week', label: '本周待办', expanded: false }
])

const circumference = 2 * Math.PI * 26
const dashOffset = computed(() => {
  const total = tasksStore.todayTotal
  const completed = tasksStore.todayCompleted
  if (total === 0) return circumference
  return circumference * (1 - completed / total)
})

const remaining = computed(() => tasksStore.todayTotal - tasksStore.todayCompleted)
const weekDates = computed(() => getWeekDates())

const getGroupTasks = (group) => {
  return tasksStore.list.filter(t => {
    if (group === 'week') return t.group === 'week'
    return t.group === group && (t.date === selectedDate.value || !t.date)
  })
}

const getDateTaskCount = (date) => {
  return tasksStore.list.filter(t => t.date === date).length
}

const toggleGroup = (key) => {
  const g = groups.value.find(g => g.key === key)
  if (g) g.expanded = !g.expanded
}

const selectDate = (date) => {
  selectedDate.value = date
}

const onDateConfirm = ({ selectedValues }) => {
  selectedDate.value = formatDate(new Date(selectedValues[0]), 'YYYY-MM-DD')
}

const editTask = (task) => {
  editingTask.value = task
  Object.assign(form, {
    title: task.title,
    group: task.group,
    priority: task.priority,
    remark: task.remark
  })
  showAdd.value = true
}

const saveTask = () => {
  if (!form.title.trim()) return
  if (editingTask.value) {
    tasksStore.update(editingTask.value.id, { ...form })
  } else {
    tasksStore.add({ ...form, date: selectedDate.value })
  }
  showAdd.value = false
  editingTask.value = null
  Object.assign(form, { title: '', group: 'personal', priority: 'medium', remark: '' })
}
</script>

<style scoped>
.tasks-page {
  padding: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.date-selector {
  font-size: 13px;
  color: #4A90D9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.progress-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.progress-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.task-group {
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  font-size: 14px;
  color: #666;
}

.group-title {
  font-weight: 500;
}

.group-count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 1px 8px;
  border-radius: 10px;
}

.week-view {
  margin-top: 12px;
}

.week-dates {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.week-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
}

.week-date.today {
  background: #e6f3ff;
}

.week-date.selected {
  background: #4A90D9;
}

.week-date.selected .week-weekday,
.week-date.selected .week-day {
  color: #fff;
}

.week-weekday {
  font-size: 11px;
  color: #999;
}

.week-day {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.week-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fa8c16;
}

.popup-content {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.popup-title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.popup-actions {
  margin-top: 20px;
}
</style>
