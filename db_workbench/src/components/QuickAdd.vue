<template>
  <div class="quick-add">
    <div class="fab" @click="show = !show">
      <van-icon name="plus" size="28" color="#fff" />
    </div>
    <transition name="fade">
      <div v-if="show" class="overlay" @click="show = false">
        <div class="menu" @click.stop>
          <div class="menu-title">快速添加</div>
          <div class="menu-grid">
            <div class="menu-item" @click="add('task')">
              <div class="menu-icon blue"><van-icon name="records" size="22" /></div>
              <span>任务</span>
            </div>
            <div class="menu-item" @click="add('reminder')">
              <div class="menu-icon green"><van-icon name="bell" size="22" /></div>
              <span>提醒</span>
            </div>
            <div class="menu-item" @click="add('expense')">
              <div class="menu-icon orange"><van-icon name="balance-list" size="22" /></div>
              <span>支出</span>
            </div>
            <div class="menu-item" @click="add('asset')">
              <div class="menu-icon purple"><van-icon name="gold-coin" size="22" /></div>
              <span>持仓</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const show = ref(false)
const router = useRouter()

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
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;
}

.fab {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90D9, #357ABD);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.4);
  cursor: pointer;
  transition: transform 0.2s;
}

.fab:active {
  transform: scale(0.92);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.menu {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.menu-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.menu-icon.blue { background: #4A90D9; }
.menu-icon.green { background: #52c41a; }
.menu-icon.orange { background: #fa8c16; }
.menu-icon.purple { background: #722ed1; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
