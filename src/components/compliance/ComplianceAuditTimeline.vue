<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="timeline" size="sm" class="q-mr-sm" />Audit Timeline
      </div>

      <div v-if="!audits || audits.length === 0" class="text-center q-py-md text-grey-7">
        No audit history available
      </div>

      <q-timeline v-else color="primary">
        <q-timeline-entry
          v-for="(audit, index) in sortedAudits"
          :key="index"
          :icon="getAuditIcon(audit.status)"
          :color="getAuditColor(audit.status)"
          :title="audit.title"
          :subtitle="formatDate(audit.date)"
          :side="index % 2 === 0 ? 'left' : 'right'"
        >
          <div class="text-body2">{{ audit.description }}</div>
          <div v-if="audit.findings" class="text-caption text-grey-7 q-mt-xs">
            <strong>Findings:</strong> {{ audit.findings }}
          </div>
          <div v-if="audit.auditor" class="text-caption text-grey-7">
            <strong>Auditor:</strong> {{ audit.auditor }}
          </div>
          <q-badge
            :color="getStatusBadgeColor(audit.status)"
            :label="audit.status"
            class="q-mt-sm"
          />
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../../utils/date.utils'

const props = defineProps<{ audits?: any[] }>()

const sortedAudits = computed(() => {
  if (!props.audits) return []
  return [...props.audits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function getAuditIcon(status: string): string {
  const icons: Record<string, string> = {
    Completed: 'check_circle',
    'In Progress': 'hourglass_top',
    Scheduled: 'event',
    Failed: 'error',
  }
  return icons[status] || 'circle'
}

function getAuditColor(status: string): string {
  const colors: Record<string, string> = {
    Completed: 'green',
    'In Progress': 'orange',
    Scheduled: 'blue',
    Failed: 'red',
  }
  return colors[status] || 'grey'
}

function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    Completed: 'green',
    'In Progress': 'orange',
    Scheduled: 'blue',
    Failed: 'red',
  }
  return colors[status] || 'grey'
}
</script>
