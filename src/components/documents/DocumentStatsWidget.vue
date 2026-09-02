<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Document Statistics</div>
        <q-btn flat round dense icon="refresh" size="sm" @click="$emit('refresh')">
          <q-tooltip>Refresh Stats</q-tooltip>
        </q-btn>
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
          <q-card flat bordered :class="'bg-' + stat.color + '-1'">
            <q-card-section class="text-center q-py-sm">
              <q-icon :name="stat.icon" :color="stat.color" size="20px" class="q-mb-xs" />
              <div class="text-h6" :class="'text-' + stat.color">{{ stat.value }}</div>
              <div class="text-caption text-grey-7">{{ stat.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- By Type -->
      <div class="q-mt-md">
        <div class="text-body2 q-mb-sm">By Type</div>
        <div v-for="(count, type) in byType" :key="type" class="q-mb-xs">
          <div class="row items-center justify-between">
            <span class="text-caption">{{ formatDocumentType(type) }}</span>
            <span class="text-caption text-grey-7">{{ count }}</span>
          </div>
          <q-linear-progress
            :value="Math.min(count / maxTypeCount, 1)"
            :color="getTypeColor(type)"
            size="8px"
            rounded
          />
        </div>
      </div>

      <!-- By Status -->
      <div class="q-mt-md">
        <div class="text-body2 q-mb-sm">By Status</div>
        <div class="row q-gutter-xs">
          <div v-for="(count, status) in byStatus" :key="status" class="col">
            <q-badge
              :color="getStatusColor(status)"
              :label="formatDocumentStatus(status)"
              class="full-width text-center q-py-sm"
            >
              <div class="text-h6">{{ count }}</div>
            </q-badge>
          </div>
        </div>
      </div>

      <div class="text-caption text-grey-7 text-center q-mt-sm">
        Total Size: {{ formatFileSize(totalSize) }} | Average: {{ formatFileSize(averageSize) }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatFileSize } from '../../utils/formatters'

const props = withDefaults(
  defineProps<{
    stats?: {
      total: number
      byType: Record<string, number>
      byStatus: Record<string, number>
      totalSizeBytes: number
      averageSizeBytes: number
      versionsCount: number
      expiredCount: number
      pendingApprovalCount: number
    }
  }>(),
  {
    stats: () => ({
      total: 0,
      byType: {},
      byStatus: {},
      totalSizeBytes: 0,
      averageSizeBytes: 0,
      versionsCount: 0,
      expiredCount: 0,
      pendingApprovalCount: 0,
    }),
  }
)

defineEmits<{ refresh: [] }>()

const stats = computed(() => [
  { label: 'Total', value: props.stats.total, icon: 'folder', color: 'primary' },
  { label: 'Versions', value: props.stats.versionsCount, icon: 'history', color: 'blue' },
  { label: 'Expired', value: props.stats.expiredCount, icon: 'timer_off', color: 'orange' },
  {
    label: 'Pending Approval',
    value: props.stats.pendingApprovalCount,
    icon: 'hourglass_top',
    color: 'yellow',
  },
])

const byType = computed(() => props.stats.byType || {})
const byStatus = computed(() => props.stats.byStatus || {})
const totalSize = computed(() => props.stats.totalSizeBytes)
const averageSize = computed(() => props.stats.averageSizeBytes)

const maxTypeCount = computed(() => {
  const values = Object.values(byType.value)
  return values.length > 0 ? Math.max(...values) : 1
})

function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
    BCM_POLICY: 'BCM Policy',
    RISK_ASSESSMENT: 'Risk Assessment',
    BIA_REPORT: 'BIA Report',
    BCP_DOCUMENT: 'BCP Document',
    RECOVERY_STRATEGY: 'Recovery Strategy',
    TEST_RESULTS: 'Test Results',
    INCIDENT_REPORT: 'Incident Report',
    COMPLIANCE_EVIDENCE: 'Compliance Evidence',
    TRAINING_MATERIAL: 'Training Material',
    AUDIT_REPORT: 'Audit Report',
    EXERCISE_REPORT: 'Exercise Report',
    MEETING_MINUTES: 'Meeting Minutes',
    PROCEDURE: 'Procedure',
    WORK_INSTRUCTION: 'Work Instruction',
    CONTACT_LIST: 'Contact List',
    VENDOR_CONTRACT: 'Vendor Contract',
    SLA_DOCUMENT: 'SLA Document',
    REGULATORY_DOCUMENT: 'Regulatory Document',
    CERTIFICATE: 'Certificate',
    GAP_ANALYSIS: 'Gap Analysis',
    IMPROVEMENT_PLAN: 'Improvement Plan',
    OTHER: 'Other',
  }
  return labels[type] || type
}

function formatDocumentStatus(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
    UNDER_REVIEW: 'Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
    PENDING_APPROVAL: 'Pending',
    UNDER_REVISION: 'Revision',
    SUPERSEDED: 'Superseded',
  }
  return labels[status] || status
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    BCM_POLICY: 'red',
    RISK_ASSESSMENT: 'orange',
    BIA_REPORT: 'blue',
    BCP_DOCUMENT: 'green',
    RECOVERY_STRATEGY: 'purple',
    TEST_RESULTS: 'teal',
    INCIDENT_REPORT: 'deep-orange',
    COMPLIANCE_EVIDENCE: 'indigo',
    TRAINING_MATERIAL: 'cyan',
    AUDIT_REPORT: 'brown',
    EXERCISE_REPORT: 'pink',
    MEETING_MINUTES: 'grey',
    PROCEDURE: 'blue-grey',
    WORK_INSTRUCTION: 'light-blue',
    CONTACT_LIST: 'amber',
    VENDOR_CONTRACT: 'deep-purple',
    SLA_DOCUMENT: 'light-green',
    REGULATORY_DOCUMENT: 'lime',
    CERTIFICATE: 'green',
    GAP_ANALYSIS: 'orange',
    IMPROVEMENT_PLAN: 'teal',
    OTHER: 'grey',
  }
  return colors[type] || 'grey'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'grey',
    PUBLISHED: 'green',
    ARCHIVED: 'grey-7',
    UNDER_REVIEW: 'blue',
    APPROVED: 'green',
    REJECTED: 'red',
    EXPIRED: 'orange',
    PENDING_APPROVAL: 'yellow',
    UNDER_REVISION: 'purple',
    SUPERSEDED: 'grey',
  }
  return colors[status] || 'grey'
}
</script>