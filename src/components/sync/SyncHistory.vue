<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Sync History</div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <div v-else-if="history!?.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="history" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No sync history</div>
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="entry in history"
          :key="entry.id"
          :icon="getSyncIcon(entry.type)"
          :color="getSyncColor(entry.status)"
          :title="getSyncTitle(entry)"
          :subtitle="formatTimeAgo(entry.timestamp)"
        >
          <div v-if="entry.details" class="text-caption text-grey-7">
            {{ entry.details }}
          </div>
          <div class="row q-gutter-xs q-mt-sm">
            <q-badge v-if="entry.pushed! > 0" color="blue" :label="entry.pushed + ' pushed'" />
            <q-badge v-if="entry.pulled! > 0" color="green" :label="entry.pulled + ' pulled'" />
            <q-badge
              v-if="entry.conflicts! > 0"
              color="red"
              :label="entry.conflicts + ' conflicts'"
            />
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '../../utils/date.utils'

defineProps<{
  history?: Array<{
    id: string
    type: 'push' | 'pull' | 'full'
    status: 'success' | 'failed' | 'partial'
    timestamp: string
    details?: string
    pushed?: number
    pulled?: number
    conflicts?: number
  }>
  loading?: boolean
}>()

function getSyncIcon(type: string): string {
  const icons: Record<string, string> = {
    push: 'cloud_upload',
    pull: 'cloud_download',
    full: 'sync',
  }
  return icons[type] || 'sync'
}

function getSyncColor(status: string): string {
  const colors: Record<string, string> = { success: 'green', failed: 'red', partial: 'orange' }
  return colors[status] || 'grey'
}

function getSyncTitle(entry: any): string {
  const type = entry.type === 'full' ? 'Full Sync' : entry.type === 'push' ? 'Push' : 'Pull'
  const status =
    entry.status === 'success'
      ? 'Completed'
      : entry.status === 'failed'
      ? 'Failed'
      : 'Partially Completed'
  return `${type} - ${status}`
}
</script>
