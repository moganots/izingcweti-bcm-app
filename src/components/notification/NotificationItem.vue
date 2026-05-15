<template>
  <q-item
    clickable
    v-ripple
    :class="{ 'bg-blue-1': !notification.is_read }"
    class="notification-item q-pa-md"
    @click="$emit('click', notification)"
  >
    <!-- Avatar Icon -->
    <q-item-section avatar>
      <q-avatar :color="getColor(notification.notification_type)" text-color="white" size="40px">
        <q-icon :name="getIcon(notification.notification_type)" size="20px" />
      </q-avatar>
    </q-item-section>

    <!-- Content -->
    <q-item-section>
      <div class="row items-center q-mb-xs">
        <q-item-label class="text-weight-medium">{{ notification.title }}</q-item-label>
        <q-space />
        <q-badge v-if="!notification.is_read" color="primary" class="q-ml-sm unread-dot" />
      </div>
      <q-item-label caption class="ellipsis-2-lines">{{ notification.message }}</q-item-label>
      <q-item-label caption class="q-mt-xs text-grey-6">
        <q-icon name="schedule" size="12px" class="q-mr-xs" />
        {{ formatTimeAgo(notification.created_at) }}
      </q-item-label>
    </q-item-section>

    <!-- Actions Menu -->
    <q-item-section side>
      <q-btn flat round size="sm" icon="more_vert" @click.stop>
        <q-menu>
          <q-list dense>
            <q-item
              v-if="!notification.is_read"
              clickable
              v-close-popup
              @click="$emit('mark-read', notification)"
            >
              <q-item-section avatar><q-icon name="done" /></q-item-section>
              <q-item-section>Mark as Read</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('archive', notification)">
              <q-item-section avatar><q-icon name="archive" /></q-item-section>
              <q-item-section>Archive</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('dismiss', notification)">
              <q-item-section avatar><q-icon name="close" /></q-item-section>
              <q-item-section>Dismiss</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="$emit('delete', notification)">
              <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
              <q-item-section class="text-negative">Delete</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '../../utils/date.utils'

defineProps<{ notification: any }>()
defineEmits<{
  click: [notification: any]
  'mark-read': [notification: any]
  archive: [notification: any]
  dismiss: [notification: any]
  delete: [notification: any]
}>()

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    WORKFLOW_UPDATE: 'account_tree',
    WORKFLOW_ASSIGNED: 'assignment_ind',
    WORKFLOW_APPROVED: 'check_circle',
    WORKFLOW_REJECTED: 'cancel',
    WORKFLOW_ESCALATED: 'arrow_upward',
    DOCUMENT_APPROVED: 'description',
    DOCUMENT_REJECTED: 'cancel',
    INCIDENT_REPORTED: 'report',
    INCIDENT_RESOLVED: 'check',
    INCIDENT_ESCALATED: 'arrow_upward',
    RISK_ASSESSMENT_DUE: 'warning',
    RISK_THRESHOLD_EXCEEDED: 'error',
    BCP_REVIEW_DUE: 'event_available',
    BCP_APPROVED: 'check_circle',
    EXERCISE_SCHEDULED: 'playlist_add_check',
    EXERCISE_COMPLETED: 'done_all',
    COMPLIANCE_AUDIT_DUE: 'gavel',
    COMPLIANCE_NON_COMPLIANT: 'warning',
    TRAINING_ASSIGNED: 'school',
    TRAINING_COMPLETED: 'done',
    SYSTEM_ALERT: 'info',
    SYSTEM_MAINTENANCE: 'build',
    SYNC_CONFLICT: 'sync_problem',
    SYNC_COMPLETED: 'sync',
  }
  return icons[type] || 'notifications'
}

function getColor(type: string): string {
  const colors: Record<string, string> = {
    WORKFLOW_UPDATE: 'primary',
    WORKFLOW_ASSIGNED: 'blue',
    WORKFLOW_APPROVED: 'green',
    WORKFLOW_REJECTED: 'red',
    WORKFLOW_ESCALATED: 'deep-orange',
    INCIDENT_REPORTED: 'negative',
    INCIDENT_RESOLVED: 'green',
    RISK_THRESHOLD_EXCEEDED: 'orange',
    COMPLIANCE_AUDIT_DUE: 'purple',
    TRAINING_ASSIGNED: 'info',
    SYSTEM_ALERT: 'grey',
    SYNC_CONFLICT: 'deep-orange',
  }
  return colors[type] || 'grey'
}
</script>

<style lang="scss" scoped>
.notification-item {
  transition: background-color 0.3s;
  &:hover {
    background: var(--q-grey-2);
  }
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.unread-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  padding: 0;
}
</style>
