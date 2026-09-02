<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="history" size="sm" class="q-mr-sm" />Audit Log
        <q-badge v-if="audits.length > 0" color="primary" class="q-ml-sm">{{ audits.length }}</q-badge>
      </div>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <div v-else-if="audits.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="history" size="40px" color="grey-4" class="q-mb-sm" />
        <div>No audit history available</div>
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="(audit, index) in sortedAudits"
          :key="index"
          :icon="getAuditIcon(audit.action)"
          :color="getAuditColor(audit.action)"
          :title="formatAuditAction(audit.action)"
          :subtitle="formatDate(audit.changedAt || audit.changed_at || audit.createdAt)"
          :side="index % 2 === 0 ? 'left' : 'right'"
        >
          <div class="row q-col-gutter-sm">
            <div v-if="audit.changedBy || audit.changed_by || audit.auditedBy" class="col-12">
              <span class="text-caption text-grey-7">
                <strong>By:</strong> {{ audit.changedBy || audit.changed_by || audit.auditedBy }}
              </span>
            </div>
            <div v-if="audit.oldValue || audit.old_value" class="col-6">
              <span class="text-caption text-grey-7">
                <strong>Old:</strong> {{ formatAuditValue(audit.oldValue || audit.old_value) }}
              </span>
            </div>
            <div v-if="audit.newValue || audit.new_value" class="col-6">
              <span class="text-caption text-grey-7">
                <strong>New:</strong> {{ formatAuditValue(audit.newValue || audit.new_value) }}
              </span>
            </div>
            <div v-if="audit.reason" class="col-12">
              <span class="text-caption text-grey-7">
                <strong>Reason:</strong> {{ audit.reason }}
              </span>
            </div>
            <div v-if="audit.ipAddress || audit.ip_address" class="col-12">
              <span class="text-caption text-grey-7">
                <strong>IP:</strong> {{ audit.ipAddress || audit.ip_address }}
              </span>
            </div>
          </div>
        </q-timeline-entry>
      </q-timeline>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center q-mt-md">
        <q-btn outline color="primary" label="Load More" :loading="loadingMore" @click="$emit('load-more')" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'

const props = withDefaults(
  defineProps<{
    audits?: any[]
    loading?: boolean
    loadingMore?: boolean
    hasMore?: boolean
  }>(),
  {
    audits: () => [],
    loading: false,
    loadingMore: false,
    hasMore: false,
  }
)

defineEmits<{
  'load-more': []
}>()

const sortedAudits = computed(() => {
  if (!props.audits) return []
  return [...props.audits].sort((a, b) => {
    const dateA = new Date(a.changedAt || a.changed_at || a.createdAt)
    const dateB = new Date(b.changedAt || b.changed_at || b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })
})

function getAuditIcon(action: string): string {
  const icons: Record<string, string> = {
    CREATE: 'add_circle',
    UPDATE: 'edit',
    DELETE: 'delete',
    ACTIVATE: 'play_arrow',
    DEACTIVATE: 'pause',
    ARCHIVE: 'archive',
    OVERRIDE: 'rule',
    EVALUATE: 'science',
  }
  return icons[action] || 'circle'
}

function getAuditColor(action: string): string {
  const colors: Record<string, string> = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    ACTIVATE: 'green',
    DEACTIVATE: 'orange',
    ARCHIVE: 'grey',
    OVERRIDE: 'purple',
    EVALUATE: 'teal',
  }
  return colors[action] || 'grey'
}

function formatAuditAction(action: string): string {
  const labels: Record<string, string> = {
    CREATE: 'Created',
    UPDATE: 'Updated',
    DELETE: 'Deleted',
    ACTIVATE: 'Activated',
    DEACTIVATE: 'Deactivated',
    ARCHIVE: 'Archived',
    OVERRIDE: 'Override Applied',
    EVALUATE: 'Evaluated',
  }
  return labels[action] || action
}

function formatAuditValue(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>