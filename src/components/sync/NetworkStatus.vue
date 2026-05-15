<template>
  <div class="network-status">
    <div class="row items-center q-gutter-sm">
      <q-icon
        :name="isOnline ? connectionIcon : 'wifi_off'"
        :color="isOnline ? connectionColor : 'grey'"
        size="18px"
      />
      <div>
        <div class="text-body2">{{ isOnline ? connectionLabel : 'Offline' }}</div>
        <div v-if="isOnline && signalStrength > 0" class="text-caption text-grey-7">
          Signal: {{ signalStrength }}%
        </div>
      </div>
      <q-badge v-if="isOnline && isMetered" color="orange" label="Metered" class="q-ml-sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_ICONS,
  CONNECTION_TYPE_COLORS,
  ConnectionType,
} from '../../types/sync.types'

const props = withDefaults(
  defineProps<{
    isOnline?: boolean
    connectionType?: string
    signalStrength?: number
    isMetered?: boolean
  }>(),
  {
    isOnline: true,
    connectionType: 'unknown',
    signalStrength: 0,
    isMetered: false,
  }
)

const connectionIcon = computed(
  () => CONNECTION_TYPE_ICONS[props.connectionType as ConnectionType] || 'help'
)
const connectionColor = computed(
  () => CONNECTION_TYPE_COLORS[props.connectionType as ConnectionType] || 'grey'
)
const connectionLabel = computed(
  () => CONNECTION_TYPE_LABELS[props.connectionType as ConnectionType] || 'Unknown'
)
</script>
