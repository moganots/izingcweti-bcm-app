<template>
  <q-card class="bcp-card cursor-pointer" flat bordered @click="$emit('click', bcp)">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getStatusColor(bcp.plan_status)"
          :label="bcp.plan_status"
          class="q-px-sm q-py-xs"
        />
        <q-badge outline color="primary" :label="'v' + bcp.version" />
      </div>

      <div class="text-h6 q-mb-xs">{{ bcp.critical_function?.name || 'Unknown Function' }}</div>
      <p class="text-grey-7 text-body2 q-mb-md">{{ bcp.critical_function?.department?.name }}</p>

      <q-separator class="q-mb-sm" />

      <div class="row q-col-gutter-sm text-center">
        <div class="col-6">
          <div class="text-caption text-grey-6">Review Due</div>
          <div
            class="text-body2"
            :class="isOverdue(bcp.review_due_date) ? 'text-negative text-weight-bold' : ''"
          >
            {{ formatDate(bcp.review_due_date) }}
          </div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Approval Date</div>
          <div class="text-body2">{{ formatDate(bcp.approval_date) || 'Not approved' }}</div>
        </div>
      </div>

      <div class="q-mt-sm">
        <q-linear-progress
          :value="getProgress(bcp)"
          :color="getProgressColor(bcp)"
          class="q-mb-xs"
        />
        <div class="row justify-between text-caption text-grey-6">
          <span>Progress</span>
          <span>{{ Math.round(getProgress(bcp) * 100) }}%</span>
        </div>
      </div>

      <div class="row q-gutter-xs q-mt-sm">
        <q-badge v-if="bcp.recovery_strategies?.length" outline color="primary">
          {{ bcp.recovery_strategies.length }} strategies
        </q-badge>
        <q-badge v-if="bcp.exercise_tests?.length" outline color="info">
          {{ bcp.exercise_tests.length }} tests
        </q-badge>
        <q-badge v-if="bcp.plan_document_url" outline color="green">Document</q-badge>
      </div>
    </q-card-section>

    <q-card-actions v-if="showActions" align="right">
      <q-btn
        v-if="bcp.plan_status === 'Draft'"
        flat
        color="primary"
        label="Submit"
        @click.stop="$emit('submit', bcp)"
      />
      <q-btn
        v-if="bcp.plan_status === 'Approved'"
        flat
        color="green"
        label="Activate"
        @click.stop="$emit('activate', bcp)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

const props = withDefaults(defineProps<{ bcp: any; showActions?: boolean }>(), {
  showActions: true,
})

defineEmits<{ click: [bcp: any]; submit: [bcp: any]; activate: [bcp: any] }>()

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Draft: 'grey',
    Approved: 'blue',
    Active: 'green',
    Archived: 'orange',
  }
  return colors[status] || 'grey'
}

function isOverdue(date: string): boolean {
  return date ? new Date(date) < new Date() : false
}

function getProgress(bcp: any): number {
  let progress = 0
  if (bcp.plan_status === 'Draft') progress = 0.25
  if (bcp.plan_status === 'Approved') progress = 0.5
  if (bcp.plan_status === 'Active') progress = 0.75
  if (bcp.recovery_strategies?.length > 0) progress += 0.1
  if (bcp.exercise_tests?.length > 0) progress += 0.15
  return Math.min(progress, 1)
}

function getProgressColor(bcp: any): string {
  const progress = getProgress(bcp)
  if (progress < 0.3) return 'red'
  if (progress < 0.6) return 'orange'
  if (progress < 0.8) return 'yellow'
  return 'green'
}
</script>
