<template>
  <q-card class="compliance-card cursor-pointer" flat bordered @click="$emit('click', record)">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="getStandardColor(record.compliance_standard)"
          :label="formatStandard(record.compliance_standard)"
          class="q-px-sm q-py-xs"
        />
        <q-badge
          :color="getStatusColor(record.compliance_status)"
          :label="record.compliance_status"
          outline
        />
      </div>

      <div class="text-h6 q-mb-xs">{{ record.organisation?.name || 'Unknown' }}</div>

      <q-separator class="q-mb-sm" />

      <!-- Audit Dates -->
      <div class="row q-col-gutter-sm text-center q-mb-sm">
        <div class="col-6">
          <div class="text-caption text-grey-6">Last Audit</div>
          <div class="text-body2 text-weight-medium">{{ formatDate(record.last_audit_date) }}</div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-6">Next Audit</div>
          <div
            class="text-body2"
            :class="isOverdue(record.next_audit_due) ? 'text-negative text-weight-bold' : ''"
          >
            {{ formatDate(record.next_audit_due) }}
          </div>
        </div>
      </div>

      <!-- Progress -->
      <q-linear-progress
        :value="getProgress(record)"
        :color="getProgressColor(record)"
        size="8px"
        rounded
        class="q-mb-xs"
      />
      <div class="row justify-between text-caption text-grey-6">
        <span>Compliance</span>
        <span>{{ getProgressLabel(record) }}</span>
      </div>

      <!-- Evidence -->
      <div v-if="record.evidence_links?.length" class="q-mt-sm">
        <q-badge outline color="info" :label="record.evidence_links.length + ' evidence'" />
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        v-if="isOverdue(record.next_audit_due)"
        flat
        color="red"
        icon="warning"
        label="Overdue"
        size="sm"
      />
      <q-btn
        v-if="isDueSoon(record.next_audit_due)"
        flat
        color="orange"
        icon="event"
        label="Due Soon"
        size="sm"
      />
      <q-btn flat round size="sm" icon="more_vert" @click.stop>
        <q-menu>
          <q-list dense>
            <q-item clickable v-close-popup @click="$emit('edit', record)">
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>Edit</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('update-status', record)">
              <q-item-section avatar><q-icon name="refresh" /></q-item-section>
              <q-item-section>Update Status</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('add-evidence', record)">
              <q-item-section avatar><q-icon name="attach_file" /></q-item-section>
              <q-item-section>Add Evidence</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="$emit('delete', record)">
              <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
              <q-item-section class="text-negative">Delete</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'

defineProps<{ record: any }>()
defineEmits<{
  click: [record: any]
  edit: [record: any]
  'update-status': [record: any]
  'add-evidence': [record: any]
  delete: [record: any]
}>()

function formatStandard(standard: string): string {
  const labels: Record<string, string> = {
    ISO22301: 'ISO 22301',
    'NIST800-34': 'NIST 800-34',
    FFIEC: 'FFIEC',
    COBIT2019: 'COBIT 2019',
  }
  return labels[standard] || standard
}

function getStandardColor(standard: string): string {
  const colors: Record<string, string> = {
    ISO22301: 'blue',
    'NIST800-34': 'green',
    FFIEC: 'orange',
    COBIT2019: 'purple',
  }
  return colors[standard] || 'grey'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Compliant: 'green',
    Partially: 'orange',
    NonCompliant: 'red',
  }
  return colors[status] || 'grey'
}

function isOverdue(date: string): boolean {
  return date ? new Date(date) < new Date() : false
}

function isDueSoon(date: string): boolean {
  if (!date) return false
  const due = new Date(date)
  const now = new Date()
  const thirtyDays = new Date()
  thirtyDays.setDate(now.getDate() + 30)
  return due <= thirtyDays && due > now
}

function getProgress(record: any): number {
  switch (record.compliance_status) {
    case 'Compliant':
      return 1
    case 'Partially':
      return 0.5
    case 'NonCompliant':
      return 0.1
    default:
      return 0
  }
}

function getProgressColor(record: any): string {
  switch (record.compliance_status) {
    case 'Compliant':
      return 'green'
    case 'Partially':
      return 'orange'
    case 'NonCompliant':
      return 'red'
    default:
      return 'grey'
  }
}

function getProgressLabel(record: any): string {
  switch (record.compliance_status) {
    case 'Compliant':
      return 'Fully Compliant'
    case 'Partially':
      return 'Partially Compliant'
    case 'NonCompliant':
      return 'Non-Compliant'
    default:
      return 'Unknown'
  }
}
</script>

<style lang="scss" scoped>
.compliance-card {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
