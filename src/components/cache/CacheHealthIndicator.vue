<template>
  <div class="cache-health-indicator">
    <div class="row items-center q-gutter-sm">
      <q-icon
        :name="healthIcon"
        :color="healthColor"
        size="24px"
      >
        <q-tooltip>
          <div class="text-body2">Cache Health: {{ healthLabel }}</div>
          <div v-if="healthDetails" class="text-caption q-mt-xs">
            {{ healthDetails }}
          </div>
        </q-tooltip>
      </q-icon>

      <div class="text-caption text-grey-7">
        <span class="text-weight-medium">Health:</span>
        <span :class="'text-' + healthColor">{{ healthLabel }}</span>
      </div>

      <q-badge
        v-if="pendingItems > 0"
        color="orange"
        class="q-ml-sm"
      >
        {{ pendingItems }} pending
      </q-badge>
    </div>

    <!-- Health Details (Expandable) -->
    <q-expansion-item
      v-if="showDetails"
      icon="info"
      label="Health Details"
      dense
      class="q-mt-sm"
      header-class="text-caption text-primary"
    >
      <div class="row q-col-gutter-sm q-pa-sm">
        <div class="col-6">
          <div class="text-caption text-grey-6">Hit Ratio</div>
          <div class="text-body2">{{ hitRatio }}%</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Storage</div>
          <div class="text-body2">{{ storageUsed }} / {{ storageTotal }}</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Active Entries</div>
          <div class="text-body2">{{ activeEntries }}</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Evictions</div>
          <div class="text-body2">{{ evictions }}</div>
        </div>
        <div class="col-12">
          <div class="text-caption text-grey-6">Status</div>
          <q-linear-progress
            :value="healthScore / 100"
            :color="healthColor"
            size="12px"
            rounded
            class="q-mt-xs"
          />
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatFileSize } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    hitRatio?: number
    activeEntries?: number
    totalEntries?: number
    storageUsedBytes?: number
    storageTotalBytes?: number
    evictions?: number
    errors?: number
    pendingItems?: number
    showDetails?: boolean
  }>(),
  {
    hitRatio: 0,
    activeEntries: 0,
    totalEntries: 0,
    storageUsedBytes: 0,
    storageTotalBytes: 50 * 1024 * 1024,
    evictions: 0,
    errors: 0,
    pendingItems: 0,
    showDetails: false,
  }
)

const healthScore = computed(() => {
  let score = 100

  // Hit ratio penalty
  if (props.hitRatio < 30) score -= 30
  else if (props.hitRatio < 50) score -= 20
  else if (props.hitRatio < 70) score -= 10

  // Storage penalty
  const storagePercent = (props.storageUsedBytes / props.storageTotalBytes) * 100
  if (storagePercent > 90) score -= 20
  else if (storagePercent > 80) score -= 10

  // Errors penalty
  if (props.errors > 10) score -= 20
  else if (props.errors > 5) score -= 10
  else if (props.errors > 0) score -= 5

  // Evictions penalty (if many evictions)
  if (props.evictions > 100) score -= 10

  return Math.max(0, Math.min(100, score))
})

const healthLabel = computed(() => {
  if (healthScore.value >= 80) return 'Healthy'
  if (healthScore.value >= 60) return 'Degraded'
  if (healthScore.value >= 40) return 'Unstable'
  return 'Critical'
})

const healthColor = computed(() => {
  if (healthScore.value >= 80) return 'green'
  if (healthScore.value >= 60) return 'orange'
  if (healthScore.value >= 40) return 'red'
  return 'darkred'
})

const healthIcon = computed(() => {
  if (healthScore.value >= 80) return 'check_circle'
  if (healthScore.value >= 60) return 'warning'
  if (healthScore.value >= 40) return 'error'
  return 'dangerous'
})

const healthDetails = computed(() => {
  const details: string[] = []
  if (props.hitRatio < 50) details.push(`Low hit ratio (${props.hitRatio}%)`)
  if (props.errors > 0) details.push(`${props.errors} errors detected`)
  const storagePercent = (props.storageUsedBytes / props.storageTotalBytes) * 100
  if (storagePercent > 80) details.push(`Storage at ${storagePercent.toFixed(0)}%`)
  return details.join('. ') || 'All systems normal'
})

const storageUsed = computed(() => formatFileSize(props.storageUsedBytes))
const storageTotal = computed(() => formatFileSize(props.storageTotalBytes))
</script>

<style lang="scss" scoped>
.cache-health-indicator {
  padding: 4px 0;
}
</style>