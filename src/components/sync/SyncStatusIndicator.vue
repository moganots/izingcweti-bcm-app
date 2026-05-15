<template>
  <div class="sync-status-indicator">
    <q-icon
      :name="statusIcon"
      :color="statusColor"
      size="18px"
      :class="{ 'rotate-animation': isSyncing }"
    >
      <q-tooltip>
        <div class="text-body2">{{ statusLabel }}</div>
        <div v-if="lastSyncText" class="text-caption">Last sync: {{ lastSyncText }}</div>
        <div v-if="pendingCount > 0" class="text-caption">{{ pendingCount }} pending changes</div>
      </q-tooltip>
    </q-icon>
    <q-badge v-if="pendingCount > 0 && !isSyncing" floating color="orange" class="sync-badge">
      {{ pendingCount > 99 ? '99+' : pendingCount }}
    </q-badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'idle' | 'syncing' | 'error' | 'offline'
    pendingCount?: number
    lastSyncAt?: string | null
  }>(),
  {
    status: 'idle',
    pendingCount: 0,
    lastSyncAt: null,
  }
)

const isSyncing = computed(() => props.status === 'syncing')
const isOffline = computed(() => props.status === 'offline')
const hasError = computed(() => props.status === 'error')

const statusIcon = computed(() => {
  if (isSyncing.value) return 'sync'
  if (isOffline.value) return 'wifi_off'
  if (hasError.value) return 'sync_problem'
  if (props.pendingCount > 0) return 'sync'
  return 'check_circle'
})

const statusColor = computed(() => {
  if (isSyncing.value) return 'orange'
  if (isOffline.value) return 'grey'
  if (hasError.value) return 'red'
  if (props.pendingCount > 0) return 'orange'
  return 'green'
})

const statusLabel = computed(() => {
  if (isSyncing.value) return 'Syncing...'
  if (isOffline.value) return 'Offline'
  if (hasError.value) return 'Sync Error'
  if (props.pendingCount > 0) return `${props.pendingCount} pending changes`
  return 'Synced'
})

const lastSyncText = computed(() => {
  if (!props.lastSyncAt) return ''
  const diff = Date.now() - new Date(props.lastSyncAt).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
})
</script>

<style lang="scss" scoped>
.sync-status-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.sync-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
}
.rotate-animation {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
