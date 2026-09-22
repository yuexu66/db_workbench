<template>
  <div class="daily-quote">
    <span class="quote-mark">"</span>
    <span class="quote-text">{{ quote }}</span>
    <span class="quote-mark right">"</span>
    <van-icon name="replay" size="16" class="refresh-btn" @click="refresh" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDailyQuote, getRandomQuote } from '@/utils/quote'

const quote = ref('')

const refresh = () => {
  quote.value = getRandomQuote()
}

onMounted(() => {
  quote.value = getDailyQuote()
})
</script>

<style scoped>
.daily-quote {
  background: #f8f9fc;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.quote-mark {
  font-size: 20px;
  color: #4A90D9;
  font-family: Georgia, serif;
  line-height: 1;
}

.quote-mark.right {
  align-self: flex-end;
}

.quote-text {
  flex: 1;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  font-style: italic;
}

.refresh-btn {
  color: #bbb;
  cursor: pointer;
  flex-shrink: 0;
}

.refresh-btn:active {
  color: #4A90D9;
}
</style>
