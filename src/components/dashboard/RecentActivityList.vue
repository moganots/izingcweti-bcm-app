<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">{{ title }}</div>
        <q-btn
          v-if="viewAllRoute"
          flat
          color="primary"
          label="View All"
          :to="viewAllRoute"
          dense
          no-caps
        />
      </div>
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>
      <div v-else-if="items.length === 0" class="text-center q-py-md text-grey-7">
        <q-icon name="inbox" size="40px" color="grey-4" class="q-mb-sm" />
        <div>{{ emptyMessage }}</div>
      </div>
      <q-list v-else separator>
        <q-item
          v-for="item in items"
          :key="(item.uuid || item.id)!"
          clickable
          v-ripple
          @click="emit('item-click', item)"
        >
          <q-item-section avatar>
            <q-icon :name="getIcon(item)" :color="getColor(item)" size="28px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ getTitle(item) }}</q-item-label>
            <q-item-label caption class="text-grey-7">{{ getSubtitle(item) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="getBadgeColor(item)" :label="getBadgeLabel(item)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

export type ActivityType = 'incident' | 'workflow' | 'test' | 'document' | 'notification'

export interface ActivityItem {
  uuid?: string
  id?: string
  title?: string
  message?: string
  root_cause?: string
  incident_severity?: string
  closed_at?: string | null
  declared_at?: string
  created_at?: string
  date?: string
  due_date?: string
  workflow_state?: string
  workflow_type?: string
  document_type?: string
  status?: string
  passed?: boolean
  priority?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    items: ActivityItem[]
    type: ActivityType
    loading?: boolean
    emptyMessage?: string
    viewAllRoute?: string
  }>(),
  {
    loading: false,
    emptyMessage: 'No items to display',
    viewAllRoute: '',
  }
)

const emit = defineEmits<{
  'item-click': [item: ActivityItem]
}>()

function getIcon(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      return item.closed_at ? 'check_circle' : 'report'
    case 'workflow':
      return 'account_tree'
    case 'test':
      return 'playlist_add_check'
    case 'document':
      return 'description'
    case 'notification':
      return 'notifications'
    default:
      return 'circle'
  }
}

function getColor(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      if (item.incident_severity === 'Critical') return 'negative'
      if (item.incident_severity === 'High') return 'warning'
      return 'grey'
    case 'workflow':
      if (item.workflow_state === 'Submitted') return 'info'
      if (item.workflow_state === 'InReview') return 'warning'
      return 'grey'
    default:
      return 'primary'
  }
}

function getTitle(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      return item.root_cause || 'Incident Reported'
    case 'workflow':
      return item.title || 'Workflow'
    case 'test':
      return item.title || 'Exercise Test'
    case 'document':
      return item.title || 'Document'
    case 'notification':
      return item.title || 'Notification'
    default:
      return item.title || item.message || ''
  }
}

function getSubtitle(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      return formatDate(item.declared_at || item.created_at || new Date().toISOString())
    case 'workflow':
      return `${item.workflow_state || 'Unknown'} | Due: ${
        item.due_date ? formatDate(item.due_date) : 'Not set'
      }`
    case 'test':
      return formatDate(item.date || item.created_at || new Date().toISOString())
    case 'document':
      return `${item.document_type || 'Document'} | ${formatDate(
        item.created_at || new Date().toISOString()
      )}`
    case 'notification':
      return formatDate(item.created_at || new Date().toISOString())
    default:
      return formatDate(item.created_at || new Date().toISOString())
  }
}

function getBadgeLabel(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      return item.incident_severity || ''
    case 'workflow':
      return item.workflow_state || ''
    case 'test':
      return item.passed ? 'Passed' : 'Pending'
    case 'document':
      return item.status || ''
    case 'notification':
      return item.priority || ''
    default:
      return ''
  }
}

function getBadgeColor(item: ActivityItem): string {
  switch (props.type) {
    case 'incident': {
      const severityColors: Record<string, string> = {
        Critical: 'negative',
        High: 'warning',
        Medium: 'orange',
        Low: 'positive',
        Informational: 'info',
      }
      return severityColors[item.incident_severity || ''] || 'grey'
    }
    case 'workflow': {
      const stateColors: Record<string, string> = {
        Draft: 'grey',
        Submitted: 'info',
        InReview: 'warning',
        Approved: 'positive',
        Rejected: 'negative',
        Completed: 'positive',
      }
      return stateColors[item.workflow_state || ''] || 'grey'
    }
    case 'test':
      return item.passed ? 'positive' : 'warning'
    case 'document': {
      const statusColors: Record<string, string> = {
        DRAFT: 'grey',
        APPROVED: 'positive',
        REJECTED: 'negative',
        PUBLISHED: 'info',
        ARCHIVED: 'grey',
      }
      return statusColors[item.status || ''] || 'grey'
    }
    default:
      return 'grey'
  }
}
</script>
