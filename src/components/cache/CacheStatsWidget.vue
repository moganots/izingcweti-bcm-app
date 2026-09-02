<template>
  <q-card flat bordered class="cache-stats-widget">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Cache Performance</div>
        <q-btn flat round dense icon="refresh" size="sm" @click="$emit('refresh')">
          <q-tooltip>Refresh Stats</q-tooltip>
        </q-btn>
      </div>

      <!-- Stats Grid -->
      <div class="row q-col-gutter-sm">
        <div class="col-6" v-for="stat in stats" :key="stat.label">
          <q-card flat bordered :class="'bg-' + stat.color + '-1'">
            <q-card-section class="text-center q-py-sm">
              <q-icon :name="stat.icon" :color="stat.color" size="20px" class="q-mb-xs" />
              <div class="text-h6" :class="'text-' + stat.color">{{ stat.value }}</div>
              <div class="text-caption text-grey-7">{{ stat.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="q-mt-md">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <div class="text-caption text-grey-6">Hit Ratio</div>
            <q-linear-progress
              :value="hitRatio / 100"
              :color="hitRatioColor"
              size="15px"
              rounded
              class="q-mt-xs"
            />
            <div class="text-caption text-right">{{ hitRatio }}%</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-6">Storage Used</div>
            <q-linear-progress
              :value="storagePercentage / 100"
              :color="storageColor"
              size="15px"
              rounded
              class="q-mt-xs"
            />
            <div class="text-caption text-right">{{ storageUsed }} / {{ storageTotal }}</div>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="row q-col-gutter-sm q-mt-sm text-caption text-grey-7">
        <div class="col-6">Evictions: {{ evictions || 0 }}</div>
        <div class="col-6">Expirations: {{ expirations || 0 }}</div>
        <div class="col-12 q-mt-xs">
          Avg TTL: {{ formatTimeDuration(averageTTLSeconds) || 'N/A' }}
        </div>
      </div>

      <div class="text-caption text-grey-7 text-center q-mt-sm">
        Last updated: {{ lastUpdatedText }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'
import { formatFileSize } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    entries?: number
    size?: number
    hits?: number
    misses?: number
    hitRatio?: number
    evictions?: number
    expirations?: number
    averageTTLSeconds?: number
    maxSizeBytes?: number
    lastUpdated?: string | null
  }>(),
  {
    entries: 0,
    size: 0,
    hits: 0,
    misses: 0,
    hitRatio: 0,
    evictions: 0,
    expirations: 0,
    averageTTLSeconds: 0,
    maxSizeBytes: 50 * 1024 * 1024,
    lastUpdated: null,
  }
)

defineEmits<{ refresh: [] }>()

const stats = computed(() => [
  { label: 'Entries', value: props.entries, icon: 'storage', color: 'primary' },
  { label: 'Hits', value: props.hits, icon: 'touch_app', color: 'green' },
  { label: 'Misses', value: props.misses, icon: 'do_not_disturb', color: 'orange' },
  { label: 'Size', value: formatFileSize(props.size), icon: 'data_usage', color: 'blue' },
])

const storageUsed = computed(() => formatFileSize(props.size))
const storageTotal = computed(() => formatFileSize(props.maxSizeBytes))
const storagePercentage = computed(() => {
  if (props.maxSizeBytes === 0) return 0
  return Math.min((props.size / props.maxSizeBytes) * 100, 100)
})

const storageColor = computed(() => {
  if (storagePercentage.value > 90) return 'red'
  if (storagePercentage.value > 70) return 'orange'
  if (storagePercentage.value > 50) return 'yellow'
  return 'green'
})

const hitRatioColor = computed(() => {
  if (props.hitRatio >= 80) return 'green'
  if (props.hitRatio >= 50) return 'orange'
  return 'red'
})

const lastUpdatedText = computed(() => {
  if (!props.lastUpdated) return 'Never'
  return formatTimeAgo(props.lastUpdated)
})

function formatTimeDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return ''
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return `${seconds}s`
  const hours = Math.floor(minutes / 60)
  if (hours < 1) return `${minutes}m`
  const days = Math.floor(hours / 24)
  if (days < 1) return `${hours}h`
  return `${days}d ${hours % 24}h`
}
</script>