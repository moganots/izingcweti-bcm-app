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
          :key="item.uuid"
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

const props = withDefaults(
  defineProps<{
    title: string
    items: any[]
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
  'item-click': [item: any]
}>()

function getIcon(item: any): string {
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

function getColor(item: any): string {
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

function getTitle(item: any): string {
  switch (props.type) {
    case 'incident':
      return item.root_cause || 'Incident Reported'
    case 'workflow':
      return item.title || 'Workflow'
    case 'test':
      return item.exercise_test_type || 'Exercise Test'
    case 'document':
      return item.title || 'Document'
    case 'notification':
      return item.title || 'Notification'
    default:
      return item.title || item.message || ''
  }
}

function getSubtitle(item: any): string {
  switch (props.type) {
    case 'incident':
      return formatDate(item.declared_at)
    case 'workflow':
      return `${item.workflow_state} | Due: ${
        item.due_date ? formatDate(item.due_date) : 'Not set'
      }`
    case 'test':
      return formatDate(item.date)
    case 'document':
      return `${item.document_type || 'Document'} | ${formatDate(item.created_at)}`
    case 'notification':
      return formatDate(item.created_at)
    default:
      return formatDate(item.created_at)
  }
}

function getBadgeLabel(item: any): string {
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

function getBadgeColor(item: any): string {
  switch (props.type) {
    case 'incident': {
      const severityColors: Record<string, string> = {
        Critical: 'negative',
        High: 'warning',
        Medium: 'orange',
        Low: 'positive',
        Informational: 'info',
      }
      return severityColors[item.incident_severity] || 'grey'
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
      return stateColors[item.workflow_state] || 'grey'
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
      return statusColors[item.status] || 'grey'
    }
    default:
      return 'grey'
  }
}
</script>
