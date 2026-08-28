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
          :key="item.uuid || item.id"
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
import type { DashboardIncident } from 'src/modules/dashboard'

export type ActivityType = 'incident' | 'workflow' | 'test' | 'document' | 'notification'

// Activity Item (camelCase)
export interface ActivityItem {
  uuid?: string
  id?: string
  title?: string
  message?: string
  rootCause?: string
  incidentSeverity?: string
  closedAt?: string | null
  declaredAt?: string
  createdAt?: string
  date?: string
  dueDate?: string
  workflowState?: string
  workflowType?: string
  documentType?: string
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
      return item.closedAt ? 'check_circle' : 'report'
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
      if (item.incidentSeverity === 'Critical') return 'negative'
      if (item.incidentSeverity === 'High') return 'warning'
      return 'grey'
    case 'workflow':
      if (item.workflowState === 'Submitted') return 'info'
      if (item.workflowState === 'InReview') return 'warning'
      return 'grey'
    default:
      return 'primary'
  }
}

function getTitle(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      return item.rootCause || 'Incident Reported'
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
      return formatDate(item.declaredAt || item.createdAt || new Date().toISOString())
    case 'workflow':
      return `${item.workflowState || 'Unknown'} | Due: ${
        item.dueDate ? formatDate(item.dueDate) : 'Not set'
      }`
    case 'test':
      return formatDate(item.date || item.createdAt || new Date().toISOString())
    case 'document':
      return `${item.documentType || 'Document'} | ${formatDate(
        item.createdAt || new Date().toISOString()
      )}`
    case 'notification':
      return formatDate(item.createdAt || new Date().toISOString())
    default:
      return formatDate(item.createdAt || new Date().toISOString())
  }
}

function getBadgeLabel(item: ActivityItem): string {
  switch (props.type) {
    case 'incident':
      return item.incidentSeverity || ''
    case 'workflow':
      return item.workflowState || ''
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
      return severityColors[item.incidentSeverity || ''] || 'grey'
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
      return stateColors[item.workflowState || ''] || 'grey'
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