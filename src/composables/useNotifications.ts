import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNotificationStore } from '../stores/notification/notification.store'
import { useAuthStore } from '../stores/auth/auth.store'

/**
 * Composable for notification management
 * Provides reactive notification state and actions
 */
export function useNotifications() {
  const router = useRouter()
  const $q = useQuasar()
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()

  const isPollingEnabled = ref(false)

  // ============================================
  // Computed
  // ============================================
  const notifications = computed(() => notificationStore.notifications)
  const unreadNotifications = computed(() => notificationStore.unreadNotifications)
  const unreadCount = computed(() => notificationStore.unreadCount)
  const totalCount = computed(() => notificationStore.totalCount)
  const hasUnread = computed(() => notificationStore.hasUnread)
  const hasNotifications = computed(() => notificationStore.hasNotifications)
  const preferences = computed(() => notificationStore.preferences)
  const isLoading = computed(() => notificationStore.isLoading)
  const hasMore = computed(() => notificationStore.hasMore)

  // ============================================
  // Navigation Helpers
  // ============================================

  /**
   * Get navigation URL for notification
   */
  function getNotificationUrl(notification: any): string | null {
    if (notification.action_url) {
      return notification.action_url
    }

    if (notification.entity_type && notification.entity_id) {
      const routeMap: Record<string, string> = {
        incident: '/incidents',
        workflow: '/workflows',
        document: '/documents',
        risk: '/risks',
        bcp: '/bcm/bcp',
        bia: '/bcm/bia',
        'critical-function': '/bcm/critical-functions',
        'recovery-strategy': '/bcm/recovery-strategies',
        'exercise-test': '/bcm/exercise-tests',
        compliance: '/compliance',
        rule: '/rules',
        audit: '/audit',
        user: '/users',
        organisation: '/organisations',
      }
      const baseRoute = routeMap[notification.entity_type]
      if (baseRoute) {
        return `${baseRoute}/${notification.entity_id}`
      }
    }

    return null
  }

  /**
   * Handle notification click - navigate to relevant page
   */
  async function handleNotificationClick(notification: any): Promise<void> {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.uuid)
    }

    // Navigate based on notification type
    const url = getNotificationUrl(notification)
    if (url) {
      await router.push(url)
    }
  }

  // ============================================
  // Data Actions
  // ============================================

  /**
   * Load notifications
   */
  async function loadNotifications(reset?: boolean): Promise<void> {
    await notificationStore.loadNotifications(reset)
  }

  /**
   * Load more notifications (pagination)
   */
  async function loadMore(): Promise<void> {
    await notificationStore.loadMore()
  }

  /**
   * Load notification counts
   */
  async function loadCounts(): Promise<void> {
    await notificationStore.loadCounts()
  }

  /**
   * Load notifications by status
   */
  async function loadByStatus(status: string): Promise<void> {
    await notificationStore.loadNotificationsByStatus(status)
  }

  /**
   * Load notifications by type
   */
  async function loadByType(type: string): Promise<void> {
    await notificationStore.loadNotificationsByType(type)
  }

  /**
   * Load notification preferences
   */
  async function loadPreferences(): Promise<void> {
    await notificationStore.loadPreferences()
  }

  // ============================================
  // Action Methods
  // ============================================

  /**
   * Mark a notification as read
   */
  async function markAsRead(id: string): Promise<void> {
    await notificationStore.markAsRead(id)
  }

  /**
   * Mark a notification as unread
   */
  async function markAsUnread(id: string): Promise<void> {
    await notificationStore.markAsUnread(id)
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead(): Promise<void> {
    const count = await notificationStore.markAllAsRead()
    $q.notify({
      type: 'positive',
      message: `${count} notification${count !== 1 ? 's' : ''} marked as read`,
      position: 'top',
      timeout: 2000,
    })
  }

  /**
   * Archive a notification
   */
  async function archiveNotification(id: string): Promise<void> {
    await notificationStore.archiveNotification(id)
    $q.notify({
      type: 'positive',
      message: 'Notification archived',
      position: 'top',
      timeout: 1500,
    })
  }

  /**
   * Dismiss a notification
   */
  async function dismissNotification(id: string): Promise<void> {
    await notificationStore.dismissNotification(id)
    $q.notify({
      type: 'positive',
      message: 'Notification dismissed',
      position: 'top',
      timeout: 1500,
    })
  }

  /**
   * Delete a notification
   */
  async function deleteNotification(id: string, permanent: boolean = false): Promise<void> {
    $q.dialog({
      title: 'Delete Notification',
      message: `Are you sure you want to ${
        permanent ? 'permanently delete' : 'delete'
      } this notification?`,
      cancel: true,
      ok: { color: 'negative', label: 'Delete' },
    }).onOk(async () => {
      if (permanent) {
        await notificationStore.permanentDeleteNotification(id)
        $q.notify({
          type: 'positive',
          message: 'Notification permanently deleted',
          position: 'top',
          timeout: 2000,
        })
      } else {
        await notificationStore.removeNotification(id)
        $q.notify({
          type: 'positive',
          message: 'Notification deleted',
          position: 'top',
          timeout: 1500,
        })
      }
    })
  }

  /**
   * Update notification preference
   */
  async function updatePreference(type: string, enabled: boolean): Promise<void> {
    await notificationStore.updatePreference({
      notification_type: type,
      in_app_enabled: enabled,
    })
  }

  /**
   * Bulk update preferences
   */
  async function updatePreferences(preferences: any[]): Promise<void> {
    for (const pref of preferences) {
      await notificationStore.updatePreference(pref)
    }
    $q.notify({
      type: 'positive',
      message: 'Preferences updated',
      position: 'top',
      timeout: 1500,
    })
  }

  // ============================================
  // Polling
  // ============================================

  /**
   * Start polling for notifications
   */
  function startPolling(intervalMs: number = 30000): void {
    if (!authStore.isAuthenticated) return
    notificationStore.startPolling(intervalMs)
    isPollingEnabled.value = true
  }

  /**
   * Stop polling for notifications
   */
  function stopPolling(): void {
    notificationStore.stopPolling()
    isPollingEnabled.value = false
  }

  /**
   * Clear all notification data
   */
  function clearAll(): void {
    notificationStore.clearAll()
  }

  /**
   * Reset filters and reload
   */
  function resetFilters(): void {
    notificationStore.resetFilters()
  }

  // ============================================
  // Lifecycle
  // ============================================

  onMounted(async () => {
    if (authStore.isAuthenticated) {
      await loadCounts()
      await loadNotifications()
      startPolling()
    }
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    // State
    notifications,
    unreadNotifications,
    unreadCount,
    totalCount,
    hasUnread,
    hasNotifications,
    preferences,
    isLoading,
    hasMore,
    isPollingEnabled,

    // Data Loading
    loadNotifications,
    loadMore,
    loadCounts,
    loadByStatus,
    loadByType,
    loadPreferences,

    // Actions
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    deleteNotification,
    updatePreference,
    updatePreferences,
    getNotificationUrl,
    handleNotificationClick,

    // Polling
    startPolling,
    stopPolling,

    // Utilities
    clearAll,
    resetFilters,
  }
}
