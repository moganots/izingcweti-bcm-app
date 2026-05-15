<template>
  <q-page padding>
    <PageHeader
      title="Notifications"
      :subtitle="unreadCount + ' unread notifications'"
      show-refresh
      @refresh="loadNotifications"
    >
      <template #actions>
        <q-btn
          v-if="unreadCount > 0"
          color="primary"
          icon="done_all"
          label="Mark All Read"
          outline
          @click="confirmMarkAllRead"
        />
        <q-btn flat round icon="settings" @click="showPreferences = true">
          <q-tooltip>Notification Preferences</q-tooltip>
        </q-btn>
      </template>
    </PageHeader>

    <!-- Notification List -->
    <NotificationList
      :notifications="notifications"
      :loading="isLoading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      @notification-click="handleNotificationClick"
      @mark-read="handleMarkRead"
      @archive="handleArchive"
      @dismiss="handleDismiss"
      @delete="handleDelete"
      @load-more="loadMore"
    />

    <!-- Notification Preferences Dialog -->
    <q-dialog v-model="showPreferences" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Notification Preferences</div>
        </q-card-section>
        <q-card-section>
          <NotificationPreferences
            :preferences="preferences"
            @update-preference="handleUpdatePreference"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNotificationStore } from '../../stores/notification.store'
import { useAuthStore } from '../../stores/auth.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import NotificationList from '../../components/notification/NotificationList.vue'
import NotificationPreferences from '../../components/notification/NotificationPreferences.vue'

const router = useRouter()
const $q = useQuasar()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// State
const showPreferences = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)

// Computed
const notifications = computed(() => notificationStore.notifications)
const isLoading = computed(() => notificationStore.isLoading)
const unreadCount = computed(() => notificationStore.unreadCount)

// Preferences
const preferences = ref([
  {
    type: 'WORKFLOW_UPDATE',
    label: 'Workflow Updates',
    description: 'Approval requests and status changes',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'WORKFLOW_ASSIGNED',
    label: 'Workflow Assigned',
    description: 'When a workflow is assigned to you',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'WORKFLOW_APPROVED',
    label: 'Workflow Approved',
    description: 'When your workflow is approved',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'WORKFLOW_REJECTED',
    label: 'Workflow Rejected',
    description: 'When your workflow is rejected',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'INCIDENT_REPORTED',
    label: 'Incident Alerts',
    description: 'New incidents and status updates',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'INCIDENT_RESOLVED',
    label: 'Incident Resolved',
    description: 'When an incident is resolved',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'RISK_THRESHOLD_EXCEEDED',
    label: 'Risk Alerts',
    description: 'Risk threshold breaches',
    in_app: true,
    email: true,
    push: true,
  },
  {
    type: 'BCP_REVIEW_DUE',
    label: 'BCP Review Due',
    description: 'When BCP review is due',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'COMPLIANCE_AUDIT_DUE',
    label: 'Compliance Reminders',
    description: 'Audit due dates',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'TRAINING_ASSIGNED',
    label: 'Training',
    description: 'Training assignments and completions',
    in_app: true,
    email: true,
    push: false,
  },
  {
    type: 'SYSTEM_ALERT',
    label: 'System Notifications',
    description: 'Maintenance and sync updates',
    in_app: true,
    email: false,
    push: false,
  },
  {
    type: 'SYNC_CONFLICT',
    label: 'Sync Conflicts',
    description: 'When sync conflicts occur',
    in_app: true,
    email: false,
    push: false,
  },
])

// Lifecycle
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await notificationStore.loadNotifications(true)
    notificationStore.startPolling(30000)
  }
})

onUnmounted(() => {
  notificationStore.stopPolling()
})

// Methods
async function loadNotifications(): Promise<void> {
  await notificationStore.loadNotifications(true)
}

async function loadMore(): Promise<void> {
  loadingMore.value = true
  try {
    await notificationStore.loadMore()
    hasMore.value = notificationStore.hasMore
  } finally {
    loadingMore.value = false
  }
}

async function handleNotificationClick(notification: any): Promise<void> {
  // Mark as read if unread
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.uuid)
  }

  // Navigate based on notification type
  if (notification.action_url) {
    await router.push(notification.action_url)
  } else if (notification.entity_type && notification.entity_id) {
    const routeMap: Record<string, string> = {
      incident: '/incidents',
      workflow: '/workflows',
      risk: '/risks',
      bcp: '/bcm/bcp',
      document: '/documents',
    }
    const baseRoute = routeMap[notification.entity_type]
    if (baseRoute) {
      await router.push(`${baseRoute}/${notification.entity_id}`)
    }
  }
}

async function handleMarkRead(notification: any): Promise<void> {
  await notificationStore.markAsRead(notification.uuid)
}

async function handleArchive(notification: any): Promise<void> {
  await notificationStore.archiveNotification(notification.uuid)
  $q.notify({ type: 'positive', message: 'Notification archived', timeout: 1500 })
}

async function handleDismiss(notification: any): Promise<void> {
  await notificationStore.dismissNotification(notification.uuid)
  $q.notify({ type: 'positive', message: 'Notification dismissed', timeout: 1500 })
}

function handleDelete(notification: any): void {
  $q.dialog({
    title: 'Delete Notification',
    message: 'Are you sure you want to delete this notification?',
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    await notificationStore.removeNotification(notification.uuid)
    $q.notify({ type: 'positive', message: 'Notification deleted', timeout: 1500 })
  })
}

function confirmMarkAllRead(): void {
  $q.dialog({
    title: 'Mark All as Read',
    message: `Mark all ${unreadCount.value} unread notifications as read?`,
    cancel: true,
  }).onOk(async () => {
    const count = await notificationStore.markAllAsRead()
    $q.notify({ type: 'positive', message: `${count} notifications marked as read` })
  })
}

async function handleUpdatePreference(pref: any): Promise<void> {
  try {
    await notificationStore.updatePreference({
      notification_type: pref.type,
      in_app_enabled: pref.in_app,
      email_enabled: pref.email,
      push_enabled: pref.push,
      sms_enabled: false,
    })
    $q.notify({ type: 'positive', message: 'Preference updated', timeout: 1500 })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to update preference' })
  }
}
</script>
