<template>
  <transition name="toast">
    <div v-if="visible" class="notification-toast" :class="'toast-' + type">
      <div class="toast-content">
        <q-icon :name="icon" size="20px" class="q-mr-sm" />
        <div class="toast-text">
          <div class="toast-title">{{ title }}</div>
          <div v-if="message" class="toast-message">{{ message }}</div>
        </div>
      </div>
      <q-btn
        v-if="actionLabel"
        flat
        dense
        :label="actionLabel"
        :color="actionColor"
        class="toast-action"
        @click="$emit('action')"
      />
      <q-btn flat dense round icon="close" size="sm" class="toast-close" @click="dismiss" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    message?: string
    type?: 'info' | 'success' | 'warning' | 'error'
    duration?: number
    actionLabel?: string
    actionColor?: string
  }>(),
  {
    type: 'info',
    duration: 5000,
    actionLabel: '',
    actionColor: 'white',
  }
)

const emit = defineEmits<{ dismiss: []; action: [] }>()

const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

const icon = computed(() => {
  const icons: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  }
  return icons[props.type] || 'info'
})

function dismiss(): void {
  visible.value = false
  emit('dismiss')
}

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(dismiss, props.duration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.notification-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 300px;
  max-width: 90vw;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.toast-info {
  background: #1976d2;
  color: white;
}
.toast-success {
  background: #388e3c;
  color: white;
}
.toast-warning {
  background: #f57c00;
  color: white;
}
.toast-error {
  background: #d32f2f;
  color: white;
}
.toast-content {
  display: flex;
  align-items: center;
  flex: 1;
}
.toast-title {
  font-weight: 600;
  font-size: 14px;
}
.toast-message {
  font-size: 12px;
  opacity: 0.9;
}
.toast-action {
  flex-shrink: 0;
}
.toast-close {
  flex-shrink: 0;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
