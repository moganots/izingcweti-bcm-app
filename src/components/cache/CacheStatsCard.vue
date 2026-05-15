<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Cache Statistics</div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-md-3" v-for="stat in statsData" :key="stat.label">
          <q-card flat bordered :class="'bg-' + stat.color + '-1'">
            <q-card-section class="text-center">
              <q-icon :name="stat.icon" :color="stat.color" size="24px" class="q-mb-sm" />
              <div class="text-h5" :class="'text-' + stat.color">{{ stat.value }}</div>
              <div class="text-caption text-grey-7">{{ stat.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Storage Bar -->
      <div class="q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-body2">Storage Used</span>
          <span class="text-caption text-grey-7">{{ storageUsed }} / {{ storageTotal }}</span>
        </div>
        <q-linear-progress
          :value="storagePercentage / 100"
          :color="storageColor"
          size="20px"
          rounded
        />
      </div>

      <!-- Hit Ratio -->
      <div class="q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-body2">Cache Hit Ratio</span>
          <span class="text-caption text-grey-7">{{ hitRatio }}%</span>
        </div>
        <q-linear-progress :value="hitRatio / 100" :color="hitRatioColor" size="15px" rounded />
      </div>

      <div class="text-caption text-grey-7 text-center">Last updated: {{ lastUpdatedText }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'
import { formatFileSize } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    totalEntries?: number
    activeEntries?: number
    expiredEntries?: number
    totalHits?: number
    hitRatio?: number
    totalSizeBytes?: number
    maxSizeBytes?: number
    lastUpdated?: string | null
  }>(),
  {
    totalEntries: 0,
    activeEntries: 0,
    expiredEntries: 0,
    totalHits: 0,
    hitRatio: 0,
    totalSizeBytes: 0,
    maxSizeBytes: 50 * 1024 * 1024,
    lastUpdated: null,
  }
)

const statsData = computed(() => [
  { label: 'Total Entries', value: props.totalEntries, icon: 'storage', color: 'primary' },
  { label: 'Active', value: props.activeEntries, icon: 'check_circle', color: 'green' },
  { label: 'Expired', value: props.expiredEntries, icon: 'timer_off', color: 'orange' },
  { label: 'Total Hits', value: props.totalHits, icon: 'touch_app', color: 'blue' },
])

const storageUsed = computed(() => formatFileSize(props.totalSizeBytes))
const storageTotal = computed(() => formatFileSize(props.maxSizeBytes))
const storagePercentage = computed(() => {
  if (props.maxSizeBytes === 0) return 0
  return Math.min((props.totalSizeBytes / props.maxSizeBytes) * 100, 100)
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
</script>
