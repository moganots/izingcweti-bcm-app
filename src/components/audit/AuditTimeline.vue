<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="timeline" size="sm" class="q-mr-sm" />Activity Timeline
      </div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <div v-else-if="!entries || entries.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="history" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No activity recorded</div>
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="(entry, index) in entries"
          :key="index"
          :icon="getActionIcon(entry.action)"
          :color="getActionColor(entry.action)"
          :title="entry.description"
          :subtitle="formatDateTime(entry.created_at)"
          :side="index % 2 === 0 ? 'left' : 'right'"
        >
          <div class="row q-col-gutter-sm text-caption">
            <div class="col-6" v-if="entry.user">
              <strong>User:</strong> {{ entry.user?.email || entry.user_id }}
            </div>
            <div class="col-6"><strong>Entity:</strong> {{ entry.entity_type }}</div>
          </div>
          <q-badge :color="getActionColor(entry.action)" :label="entry.action" class="q-mt-sm" />
          <q-badge
            v-if="entry.severity === 'ERROR' || entry.severity === 'CRITICAL'"
            color="red"
            :label="entry.severity"
            class="q-ml-sm"
          />
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatDateTime } from '../../utils/date.utils'

defineProps<{
  entries?: any[]
  loading?: boolean
}>()

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    CREATE: 'add_circle',
    UPDATE: 'edit',
    DELETE: 'delete',
    APPROVE: 'check_circle',
    REJECT: 'cancel',
    SYNC: 'sync',
    CONFLICT_RESOLVE: 'build',
  }
  return icons[action] || 'circle'
}

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    APPROVE: 'green',
    REJECT: 'red',
    SYNC: 'orange',
    CONFLICT_RESOLVE: 'purple',
  }
  return colors[action] || 'grey'
}
</script>
