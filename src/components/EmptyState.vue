<template>
  <div class="empty-state">
    <van-icon :name="icon" size="48" color="#ddd" />
    <div class="empty-text">{{ text }}</div>
    <div v-if="actionText" class="empty-action" @click="$emit('action')">{{ actionText }}</div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'info-o' },
  text: { type: String, default: '暂无数据' },
  actionText: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.empty-action {
  font-size: 14px;
  color: #6366f1;
  padding: 8px 20px;
  border: 1px solid #6366f1;
  border-radius: 20px;
  margin-top: 8px;
}
</style>
