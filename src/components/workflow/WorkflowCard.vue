<template>
  <q-card class="workflow-card cursor-pointer" flat bordered @click="$emit('click', workflow)">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getStateColor(workflow.workflow_state)"
          :label="formatState(workflow.workflow_state)"
          class="q-px-sm q-py-xs"
        />
        <q-badge
          :color="getPriorityColor(workflow.priority)"
          :label="'P' + workflow.priority"
          outline
        />
      </div>

      <div class="text-h6 q-mb-xs">{{ workflow.title }}</div>
      <p v-if="workflow.description" class="text-grey-7 text-body2 q-mb-md ellipsis-2-lines">
        {{ workflow.description }}
      </p>

      <q-separator class="q-mb-sm" />

      <!-- Meta Info -->
      <div class="row q-col-gutter-sm text-center q-mb-sm">
        <div class="col-6">
          <div class="text-caption text-grey-6">Type</div>
          <div class="text-body2 text-weight-medium">{{ formatType(workflow.workflow_type) }}</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Due Date</div>
          <div
            class="text-body2"
            :class="isOverdue(workflow.due_date) ? 'text-negative text-weight-bold' : ''"
          >
            {{ formatDate(workflow.due_date) || 'N/A' }}
          </div>
        </div>
      </div>

      <!-- Progress -->
      <q-linear-progress
        :value="getProgress(workflow)"
        :color="getProgressColor(workflow)"
        size="8px"
        rounded
        class="q-mb-xs"
      />
      <div class="row justify-between text-caption text-grey-6">
        <span>{{ workflow.workflow_state }}</span>
        <span v-if="workflow.completed_at">Completed: {{ formatDate(workflow.completed_at) }}</span>
      </div>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions v-if="showActions" align="right">
      <q-btn
        v-if="workflow.workflow_state === 'Draft'"
        flat
        color="primary"
        label="Submit"
        @click.stop="$emit('submit', workflow)"
      />
      <q-btn
        v-if="workflow.workflow_state === 'Submitted' || workflow.workflow_state === 'InReview'"
        flat
        color="green"
        label="Approve"
        @click.stop="$emit('approve', workflow)"
      />
      <q-btn
        v-if="workflow.workflow_state === 'Submitted' || workflow.workflow_state === 'InReview'"
        flat
        color="red"
        label="Reject"
        @click.stop="$emit('reject', workflow)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

defineProps<{ workflow: any; showActions?: boolean }>()
defineEmits<{
  click: [workflow: any]
  submit: [workflow: any]
  approve: [workflow: any]
  reject: [workflow: any]
}>()

function formatState(state: string): string {
  const labels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    InReview: 'In Review',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Completed: 'Completed',
    Archived: 'Archived',
    Cancelled: 'Cancelled',
    Expired: 'Expired',
    AwaitingInput: 'Awaiting Input',
    ParallelReview: 'Parallel Review',
  }
  return labels[state] || state
}

function formatType(type: string): string {
  const labels: Record<string, string> = {
    PolicyApproval: 'Policy',
    RiskAssessment: 'Risk',
    BIAReview: 'BIA',
    BCPApproval: 'BCP',
    StrategyApproval: 'Strategy',
    TestReview: 'Test',
    IncidentManagement: 'Incident',
    ImprovementTracking: 'Improvement',
    TrainingAttestation: 'Training',
    ComplianceReview: 'Compliance',
  }
  return labels[type] || type
}

function getStateColor(state: string): string {
  const colors: Record<string, string> = {
    Draft: 'grey',
    Submitted: 'blue',
    InReview: 'orange',
    Approved: 'green',
    Rejected: 'red',
    Completed: 'green',
    Archived: 'brown',
    Cancelled: 'grey',
    Expired: 'red',
    AwaitingInput: 'yellow',
  }
  return colors[state] || 'grey'
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'blue',
    5: 'grey',
  }
  return colors[priority] || 'grey'
}

function isOverdue(date: string): boolean {
  return date ? new Date(date) < new Date() : false
}

function getProgress(w: any): number {
  const states: Record<string, number> = {
    Draft: 0.2,
    Submitted: 0.4,
    InReview: 0.6,
    Approved: 0.8,
    Completed: 1,
  }
  return states[w.workflow_state] || 0
}

function getProgressColor(w: any): string {
  const progress = getProgress(w)
  if (progress < 0.3) return 'red'
  if (progress < 0.6) return 'orange'
  if (progress < 0.8) return 'yellow'
  return 'green'
}
</script>

<style lang="scss" scoped>
.workflow-card {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
