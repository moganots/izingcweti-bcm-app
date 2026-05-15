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
          @click="$emit('item-click', item)"
        >
          <q-item-section avatar>
            <q-icon :name="getIcon(item)" :color="getColor(item)" size="24px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getTitle(item) }}</q-item-label>
            <q-item-label caption>{{ getSubtitle(item) }}</q-item-label>
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

const props = withDefaults(
  defineProps<{
    title: string
    items: any[]
    type: 'incident' | 'workflow' | 'test' | 'document' | 'notification'
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

defineEmits<{ 'item-click': [item: any] }>()

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
      if (item.incident_severity === 'Critical') return 'red'
      if (item.incident_severity === 'High') return 'orange'
      return 'grey'
    case 'workflow':
      if (item.workflow_state === 'Submitted') return 'blue'
      if (item.workflow_state === 'InReview') return 'orange'
      return 'grey'
    default:
      return 'primary'
  }
}

function getTitle(item: any): string {
  switch (props.type) {
    case 'incident':
      return item.root_cause || 'Incident'
    case 'workflow':
      return item.title || 'Workflow'
    case 'test':
      return item.exercise_test_type || 'Test'
    case 'document':
      return item.title || 'Document'
    default:
      return item.title || item.message || ''
  }
}

function getSubtitle(item: any): string {
  switch (props.type) {
    case 'incident':
      return formatDate(item.declared_at)
    case 'workflow':
      return `${item.workflow_state} | Due: ${formatDate(item.due_date)}`
    case 'test':
      return formatDate(item.date)
    case 'document':
      return `${item.document_type} | ${formatDate(item.created_at)}`
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
    default:
      return ''
  }
}

function getBadgeColor(item: any): string {
  switch (props.type) {
    case 'incident':
      const severityColors: Record<string, string> = {
        Critical: 'red',
        High: 'orange',
        Medium: 'yellow',
        Low: 'green',
      }
      return severityColors[item.incident_severity] || 'grey'
    case 'workflow':
      const stateColors: Record<string, string> = {
        Draft: 'grey',
        Submitted: 'blue',
        InReview: 'orange',
        Approved: 'green',
        Rejected: 'red',
        Completed: 'green',
      }
      return stateColors[item.workflow_state] || 'grey'
    case 'test':
      return item.passed ? 'green' : 'orange'
    default:
      return 'grey'
  }
}
</script>
