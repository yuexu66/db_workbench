<template>
  <div class="quick-add">
    <transition name="pop">
      <div v-show="!show" class="fab" @click="open">
        <van-icon name="plus" size="26" color="#fff" />
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="show" class="overlay" @click="close">
        <div class="menu" @click.stop>
          <div class="menu-handle"></div>
          <div class="menu-title">快速添加</div>
          <div class="menu-grid">
            <div class="menu-item" @click="add('task')">
              <div class="menu-icon blue"><van-icon name="records" size="24" /></div>
              <span>任务</span>
            </div>
            <div class="menu-item" @click="add('reminder')">
              <div class="menu-icon green"><van-icon name="bell" size="24" /></div>
              <span>提醒</span>
            </div>
            <div class="menu-item" @click="add('expense')">
              <div class="menu-icon orange"><van-icon name="balance-list-o" size="24" /></div>
              <span>支出</span>
            </div>
            <div class="menu-item" @click="add('asset')">
              <div class="menu-icon purple"><van-icon name="gold-coin-o" size="24" /></div>
              <span>持仓</span>
            </div>
          </div>
          <div class="menu-cancel" @click="close">取消</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const show = ref(false)
const router = useRouter()

const open = () => { show.value = true }
const close = () => { show.value = false }

const add = (type) => {
  show.value = false
  switch (type) {
    case 'task':
      router.push('/tasks?add=1')
      break
    case 'reminder':
      router.push('/reminders?add=1')
      break
    case 'expense':
      router.push('/finance?tab=expense&add=1')
      break
    case 'asset':
      router.push('/finance?tab=asset&add=1')
      break
  }
}
</script>

<style scoped>
.quick-add {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}

.fab {
  position: absolute;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s;
}

.fab:active {
  transform: translateX(-50%) scale(0.92);
}

.pop-enter-active, .pop-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.6);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: auto;
}

.menu {
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 500px;
}

.menu-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  margin: 0 auto 14px;
}

.menu-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1e1b4b;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.menu-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s;
}

.menu-item:active .menu-icon {
  transform: scale(0.9);
}

.menu-icon.blue { background: linear-gradient(135deg, #818cf8, #6366f1); }
.menu-icon.green { background: linear-gradient(135deg, #34d399, #10b981); }
.menu-icon.orange { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.menu-icon.purple { background: linear-gradient(135deg, #a78bfa, #8b5cf6); }

.menu-cancel {
  margin-top: 18px;
  text-align: center;
  font-size: 15px;
  color: #64748b;
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
}

.sheet-enter-active, .sheet-leave-active {
  transition: opacity 0.25s;
}
.sheet-enter-active .menu, .sheet-leave-active .menu {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-enter-from, .sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .menu, .sheet-leave-to .menu {
  transform: translateY(100%);
}
</style>
