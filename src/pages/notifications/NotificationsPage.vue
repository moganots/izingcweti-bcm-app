<!-- src/pages/notifications/NotificationsPage.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Notifications</h4>
          <p class="text-grey-7 q-mb-none">{{ unreadCount }} unread notifications</p>
        </div>
        <div class="q-gutter-sm">
          <q-btn
            v-if="unreadCount > 0"
            color="primary"
            icon="done_all"
            label="Mark All Read"
            outline
            @click="markAllAsRead"
          />
          <q-btn
            outline
            color="grey"
            icon="archive"
            label="Archive"
            @click="showArchiveDialog = true"
          />
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="activeTab"
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="all" label="All" :badge="totalCount" />
      <q-tab name="unread" label="Unread" :badge="unreadCount" badge-color="red" />
      <q-tab name="read" label="Read" />
      <q-tab name="archived" label="Archived" />
    </q-tabs>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredNotifications.length === 0"
      icon="notifications_off"
      :title="emptyTitle"
      :description="emptyDescription"
    />

    <!-- Notification List -->
    <q-list v-else separator>
      <transition-group name="slide">
        <q-item
          v-for="notification in filteredNotifications"
          :key="notification.uuid"
          clickable
          v-ripple
          :class="{ 'bg-blue-1': !notification.is_read }"
          class="notification-item q-pa-md"
          @click="handleNotificationClick(notification)"
        >
          <q-item-section avatar>
            <q-avatar
              :color="getNotificationColor(notification.notification_type)"
              text-color="white"
              size="40px"
            >
              <q-icon :name="getNotificationIcon(notification.notification_type)" size="20px" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <div class="row items-center q-mb-xs">
              <q-item-label class="text-weight-medium">{{ notification.title }}</q-item-label>
              <q-space />
              <q-badge
                v-if="!notification.is_read"
                color="primary"
                class="q-ml-sm"
                style="width: 8px; height: 8px; min-width: 8px; border-radius: 50%"
              />
            </div>
            <q-item-label caption class="ellipsis-2-lines">{{ notification.message }}</q-item-label>
            <q-item-label caption class="q-mt-xs text-grey-6">
              <q-icon name="schedule" size="12px" class="q-mr-xs" />
              {{ formatTimeAgo(notification.created_at) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round size="sm" icon="more_vert" @click.stop>
              <q-menu>
                <q-list dense>
                  <q-item
                    v-if="!notification.is_read"
                    clickable
                    v-close-popup
                    @click="markAsRead(notification)"
                  >
                    <q-item-section avatar><q-icon name="done" /></q-item-section>
                    <q-item-section>Mark as Read</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="archiveNotification(notification)">
                    <q-item-section avatar><q-icon name="archive" /></q-item-section>
                    <q-item-section>Archive</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="deleteNotification(notification)">
                    <q-item-section avatar
                      ><q-icon name="delete" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative">Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </transition-group>
    </q-list>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center q-mt-lg">
      <q-btn outline color="primary" label="Load More" :loading="isLoadingMore" @click="loadMore" />
    </div>

    <!-- Notification Preferences Dialog -->
    <q-dialog v-model="showPreferencesDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Notification Preferences</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item v-for="pref in preferences" :key="pref.type">
              <q-item-section>
                <q-item-label>{{ pref.label }}</q-item-label>
                <q-item-label caption>{{ pref.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="pref.enabled"
                  color="primary"
                  @update:model-value="updatePreference(pref)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { NotificationService } from '../../services/api/NotificationService'
import { useNotificationStore } from '../../stores/notification.store'
import EmptyState from '../../components/common/EmptyState.vue'

const router = useRouter()
const $q = useQuasar()
const notificationStore = useNotificationStore()

const notifications = ref<any[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const activeTab = ref('all')
const currentPage = ref(1)
const hasMore = ref(false)
const showPreferencesDialog = ref(false)
const showArchiveDialog = ref(false)

const preferences = ref([
  {
    type: 'WORKFLOW',
    label: 'Workflow Updates',
    description: 'Approval requests and status changes',
    enabled: true,
  },
  {
    type: 'INCIDENT',
    label: 'Incident Alerts',
    description: 'New incidents and status updates',
    enabled: true,
  },
  { type: 'RISK', label: 'Risk Alerts', description: 'Risk threshold breaches', enabled: true },
  {
    type: 'COMPLIANCE',
    label: 'Compliance Reminders',
    description: 'Audit due dates and status changes',
    enabled: true,
  },
  {
    type: 'TRAINING',
    label: 'Training',
    description: 'Training assignments and completions',
    enabled: true,
  },
  {
    type: 'SYSTEM',
    label: 'System Notifications',
    description: 'Maintenance and sync updates',
    enabled: true,
  },
])

const unreadCount = computed(() => notificationStore.unreadCount)
const totalCount = computed(() => notifications.value.length)

const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notifications.value.filter((n) => !n.is_read && n.status !== 'ARCHIVED')
    case 'read':
      return notifications.value.filter((n) => n.is_read && n.status !== 'ARCHIVED')
    case 'archived':
      return notifications.value.filter((n) => n.status === 'ARCHIVED')
    default:
      return notifications.value.filter((n) => n.status !== 'ARCHIVED')
  }
})

const emptyTitle = computed(() => {
  const titles: Record<string, string> = {
    all: 'No Notifications',
    unread: 'No Unread Notifications',
    read: 'No Read Notifications',
    archived: 'No Archived Notifications',
  }
  return titles[activeTab.value] || 'No Notifications'
})

const emptyDescription = computed(() => {
  const descriptions: Record<string, string> = {
    all: "You're all caught up! New notifications will appear here.",
    unread: "Great job! You've read all your notifications.",
    read: 'No read notifications yet.',
    archived: 'No archived notifications.',
  }
  return descriptions[activeTab.value] || ''
})

onMounted(() => loadNotifications())

async function loadNotifications(reset = true): Promise<void> {
  if (reset) {
    isLoading.value = true
    currentPage.value = 1
  } else {
    isLoadingMore.value = true
  }

  try {
    const response = await NotificationService.getNotifications({
      page: currentPage.value,
      limit: 20,
      status: activeTab.value === 'archived' ? 'ARCHIVED' : undefined,
      unread_only: activeTab.value === 'unread' ? true : undefined,
    })

    if (reset) {
      notifications.value = response.data || []
    } else {
      notifications.value.push(...(response.data || []))
    }
    hasMore.value = (response.data || []).length === 20
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

async function loadMore(): Promise<void> {
  currentPage.value++
  await loadNotifications(false)
}

async function handleNotificationClick(notification: any): Promise<void> {
  if (!notification.is_read) {
    await markAsRead(notification)
  }

  // Navigate based on notification type
  if (notification.action_url) {
    router.push(notification.action_url)
  } else if (notification.entity_type === 'incident' && notification.entity_id) {
    router.push(`/incidents/${notification.entity_id}`)
  } else if (notification.entity_type === 'workflow' && notification.entity_id) {
    router.push(`/workflows/${notification.entity_id}`)
  } else if (notification.entity_type === 'document' && notification.entity_id) {
    router.push('/documents')
  }
}

async function markAsRead(notification: any): Promise<void> {
  try {
    await NotificationService.markAsRead(notification.uuid)
    notification.is_read = true
    notification.status = 'READ'
    notification.read_at = new Date().toISOString()
    notificationStore.decrementUnread()
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

async function markAllAsRead(): Promise<void> {
  $q.dialog({
    title: 'Mark All as Read',
    message: `Mark all ${unreadCount.value} unread notifications as read?`,
    cancel: true,
  }).onOk(async () => {
    try {
      await NotificationService.markAllAsRead()
      notifications.value.forEach((n) => {
        if (!n.is_read) {
          n.is_read = true
          n.status = 'READ'
          n.read_at = new Date().toISOString()
        }
      })
      notificationStore.clearUnread()
      $q.notify({ type: 'positive', message: 'All notifications marked as read' })
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to mark all as read' })
    }
  })
}

async function archiveNotification(notification: any): Promise<void> {
  try {
    await NotificationService.archive(notification.uuid)
    notification.status = 'ARCHIVED'
    if (!notification.is_read) notificationStore.decrementUnread()
    $q.notify({ type: 'positive', message: 'Notification archived' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to archive notification' })
  }
}

function deleteNotification(notification: any): void {
  $q.dialog({
    title: 'Delete Notification',
    message: 'Are you sure? This cannot be undone.',
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await NotificationService.delete(notification.uuid)
      notifications.value = notifications.value.filter((n) => n.uuid !== notification.uuid)
      if (!notification.is_read) notificationStore.decrementUnread()
      $q.notify({ type: 'positive', message: 'Notification deleted' })
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete notification' })
    }
  })
}

async function updatePreference(pref: any): Promise<void> {
  try {
    await NotificationService.updatePreferences({
      notification_type: pref.type,
      in_app_enabled: pref.enabled,
    })
  } catch (error) {
    console.error('Failed to update preference:', error)
  }
}

function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    WORKFLOW_UPDATE: 'primary',
    WORKFLOW_ASSIGNED: 'blue',
    WORKFLOW_APPROVED: 'green',
    WORKFLOW_REJECTED: 'red',
    INCIDENT_REPORTED: 'negative',
    INCIDENT_RESOLVED: 'green',
    RISK_THRESHOLD_EXCEEDED: 'orange',
    BCP_REVIEW_DUE: 'warning',
    COMPLIANCE_AUDIT_DUE: 'purple',
    TRAINING_ASSIGNED: 'info',
    SYSTEM_ALERT: 'grey',
    SYNC_CONFLICT: 'deep-orange',
  }
  return colors[type] || 'grey'
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    WORKFLOW_UPDATE: 'account_tree',
    WORKFLOW_ASSIGNED: 'assignment_ind',
    WORKFLOW_APPROVED: 'check_circle',
    WORKFLOW_REJECTED: 'cancel',
    INCIDENT_REPORTED: 'report',
    INCIDENT_RESOLVED: 'check',
    RISK_THRESHOLD_EXCEEDED: 'warning',
    BCP_REVIEW_DUE: 'event_available',
    COMPLIANCE_AUDIT_DUE: 'gavel',
    TRAINING_ASSIGNED: 'school',
    SYSTEM_ALERT: 'info',
    SYNC_CONFLICT: 'sync_problem',
  }
  return icons[type] || 'notifications'
}

function formatTimeAgo(date: string): string {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

watch(activeTab, () => loadNotifications())
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

.slide-enter-active {
  transition: all 0.3s ease-out;
}
.slide-leave-active {
  transition: all 0.2s ease-in;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
