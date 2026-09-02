<template>
  <q-card class="rule-card cursor-pointer" flat bordered @click="$emit('click', rule)">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <q-badge :color="getTypeColor(rule.rule_type)" :label="formatType(rule.rule_type)" class="q-px-sm q-py-xs" />
          <q-badge :color="getStatusColor(rule.status)" :label="rule.status" outline />
        </div>
        <q-btn flat round size="sm" icon="more_vert" @click.stop>
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="$emit('edit', rule)">
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('test', rule)">
                <q-item-section avatar><q-icon name="play_arrow" /></q-item-section>
                <q-item-section>Test Rule</q-item-section>
              </q-item>
              <q-item v-if="rule.status === 'ACTIVE'" clickable v-close-popup @click="$emit('deactivate', rule)">
                <q-item-section avatar><q-icon name="pause" /></q-item-section>
                <q-item-section>Deactivate</q-item-section>
              </q-item>
              <q-item v-if="rule.status !== 'ACTIVE'" clickable v-close-popup @click="$emit('activate', rule)">
                <q-item-section avatar><q-icon name="play_arrow" color="green" /></q-item-section>
                <q-item-section>Activate</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('duplicate', rule)">
                <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
                <q-item-section>Duplicate</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', rule)">
                <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- Rule Info -->
      <div class="text-h6 q-mb-xs">{{ rule.name }}</div>
      <p v-if="rule.description" class="text-grey-7 text-body2 q-mb-md">
        {{ truncateText(rule.description, 80) }}
      </p>

      <q-separator class="q-mb-sm" />

      <!-- Meta -->
      <div class="row q-col-gutter-sm text-center">
        <div class="col-4">
          <div class="text-caption text-grey-6">Trigger</div>
          <div class="text-body2 text-weight-medium">{{ formatTrigger(rule.rule_trigger) }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-6">Entity</div>
          <div class="text-body2 text-weight-medium">{{ rule.entity_type }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-6">Priority</div>
          <q-badge :color="getPriorityColor(rule.priority)" :label="'P' + rule.priority" />
        </div>
      </div>

      <!-- Conditions & Actions Count -->
      <div class="q-mt-sm row q-gutter-sm">
        <q-badge outline color="blue" :label="conditionCount + ' condition' + (conditionCount !== 1 ? 's' : '')" />
        <q-badge outline color="green" :label="actionCount + ' action' + (actionCount !== 1 ? 's' : '')" />
      </div>

      <!-- Execution Stats -->
      <div class="q-mt-sm row items-center justify-between text-caption text-grey-6">
        <span>Executions: {{ rule.execution_count || 0 }}</span>
        <span v-if="rule.failure_count > 0" class="text-negative">Failures: {{ rule.failure_count }}</span>
        <span v-if="rule.last_executed_at">Last: {{ formatTimeAgo(rule.last_executed_at) }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'
import { truncateText } from '../../utils/formatters'

const props = defineProps<{ rule: any }>()

defineEmits<{
  click: [rule: any]
  edit: [rule: any]
  test: [rule: any]
  activate: [rule: any]
  deactivate: [rule: any]
  duplicate: [rule: any]
  delete: [rule: any]
}>()

const conditionCount = computed(() => props.rule?.conditions?.length || 0)
const actionCount = computed(() => props.rule?.actions?.length || 0)

function formatType(type: string): string {
  const labels: Record<string, string> = {
    VALIDATION: 'Validation',
    NOTIFICATION: 'Notification',
    APPROVAL: 'Approval',
    ESCALATION: 'Escalation',
    COMPLIANCE: 'Compliance',
    RISK_CALCULATION: 'Risk Calc',
    BCM_AUTOMATION: 'BCM Auto',
    DOCUMENT_LIFECYCLE: 'Doc Lifecycle',
    WORKFLOW_AUTOMATION: 'Workflow Auto',
    SYNC_VALIDATION: 'Sync Valid',
    ACCESS_CONTROL: 'Access Ctrl',
    DATA_RETENTION: 'Data Retention',
    CUSTOM: 'Custom',
  }
  return labels[type] || type
}

function formatTrigger(trigger: string): string {
  const labels: Record<string, string> = {
    ON_CREATE: 'On Create',
    ON_UPDATE: 'On Update',
    ON_DELETE: 'On Delete',
    ON_STATUS_CHANGE: 'On Status',
    ON_SCHEDULE: 'Schedule',
    ON_THRESHOLD_BREACH: 'Threshold',
    ON_APPROVAL: 'On Approve',
    ON_REJECTION: 'On Reject',
    ON_ESCALATION: 'On Escalate',
    ON_SYNC: 'On Sync',
    ON_MANUAL: 'Manual',
  }
  return labels[trigger] || trigger
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    VALIDATION: 'blue',
    NOTIFICATION: 'green',
    APPROVAL: 'purple',
    ESCALATION: 'orange',
    COMPLIANCE: 'red',
    RISK_CALCULATION: 'brown',
    BCM_AUTOMATION: 'teal',
    WORKFLOW_AUTOMATION: 'deep-orange',
    CUSTOM: 'grey',
  }
  return colors[type] || 'grey'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'grey',
    DRAFT: 'orange',
    TESTING: 'blue',
    DEPRECATED: 'red',
  }
  return colors[status] || 'grey'
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = { 1: 'red', 2: 'orange', 3: 'yellow', 4: 'blue' }
  return colors[priority] || 'grey'
}
</script>

<style lang="scss" scoped>
.rule-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
