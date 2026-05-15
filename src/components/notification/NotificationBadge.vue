<template>
  <q-badge
    v-if="count > 0"
    :color="color"
    :label="displayCount"
    :floating="floating"
    :class="{ 'notification-pulse': pulse }"
  >
    <q-tooltip v-if="tooltip">{{ tooltipText }}</q-tooltip>
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    count: number
    max?: number
    color?: string
    floating?: boolean
    pulse?: boolean
    tooltip?: boolean
  }>(),
  {
    max: 99,
    color: 'red',
    floating: false,
    pulse: false,
    tooltip: false,
  }
)

const displayCount = computed(() => {
  if (props.count > props.max) return `${props.max}+`
  return String(props.count)
})

const tooltipText = computed(
  () => `${props.count} unread notification${props.count !== 1 ? 's' : ''}`
)
</script>

<style lang="scss" scoped>
.notification-pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
