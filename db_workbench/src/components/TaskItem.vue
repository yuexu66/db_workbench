<template>
  <div class="task-item" :class="{ completed: task.completed }">
    <div class="checkbox" :class="task.priority" @click="$emit('toggle', task.id)">
      <van-icon v-if="task.completed" name="success" size="16" color="#fff" />
    </div>
    <div class="task-content" @click="$emit('click', task)">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-meta">
        <span class="priority-tag" :class="task.priority">{{ priorityLabel }}</span>
        <span v-if="task.subtasks && task.subtasks.length" class="subtask-count">
          {{ completedSubtasks }}/{{ task.subtasks.length }}
        </span>
        <van-icon v-if="task.remark" name="description" size="12" color="#ccc" />
      </div>
    </div>
    <van-icon name="ellipsis" size="18" color="#ccc" @click.stop="$emit('more', task)" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true }
})

defineEmits(['toggle', 'click', 'more'])

const priorityLabel = computed(() => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[props.task.priority] || '中'
})

const completedSubtasks = computed(() => {
  if (!props.task.subtasks) return 0
  return props.task.subtasks.filter(s => s.completed).length
})
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.task-item:last-child {
  border-bottom: none;
}

.checkbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox.high { border-color: #f5222d; }
.checkbox.medium { border-color: #fa8c16; }
.checkbox.low { border-color: #8c8c8c; }

.task-item.completed .checkbox {
  background: #52c41a;
  border-color: #52c41a;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  word-break: break-all;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #bbb;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
}

.priority-tag.high { background: #fff1f0; color: #f5222d; }
.priority-tag.medium { background: #fff7e6; color: #fa8c16; }
.priority-tag.low { background: #f5f5f5; color: #8c8c8c; }

.subtask-count {
  font-size: 11px;
  color: #999;
}
</style>
