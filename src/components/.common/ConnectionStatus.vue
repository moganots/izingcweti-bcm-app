<template>
  <div class="connection-status">
    <q-icon :name="connectionIcon" :color="connectionColor" size="18px">
      <q-tooltip>
        <div class="text-body2">{{ connectionLabel }}</div>
        <div v-if="isOnline" class="text-caption">
          {{ signalInfo }}
        </div>
      </q-tooltip>
    </q-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NetworkMonitor } from '../../services/sync/NetworkMonitor'
import {
  ConnectionType,
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_ICONS,
  CONNECTION_TYPE_COLORS,
} from '../../types/sync.types'

const props = defineProps<{
  monitor: NetworkMonitor
}>()

const isOnline = computed(() => props.monitor.isOnline)
const connectionType = computed(() => props.monitor.connectionType)
const connectionIcon = computed(() => CONNECTION_TYPE_ICONS[connectionType.value])
const connectionColor = computed(() => CONNECTION_TYPE_COLORS[connectionType.value])
const connectionLabel = computed(() => CONNECTION_TYPE_LABELS[connectionType.value])

const signalInfo = computed(() => {
  if (!isOnline.value) return ''
  const strength = props.monitor.signalStrength
  if (strength > 0) return `Signal: ${strength}%`
  return ''
})
</script>

<style lang="scss" scoped>
.connection-status {
  display: inline-flex;
  align-items: center;
}
</style>
