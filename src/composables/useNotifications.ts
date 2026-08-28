import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNotificationStore } from '../stores/notification/notification.store'
import { useAuthStore } from '../stores/auth/auth.store'

export function useNotifications() {
  const router = useRouter()
  const $q = useQuasar()
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()

  const isPollingEnabled = ref(false)

  const notifications = computed(() => notificationStore.notifications)
  const unreadNotifications = computed(() => notificationStore.unreadNotifications)
  const unreadCount = computed(() => notificationStore.unreadCount)
  const totalCount = computed(() => notificationStore.totalCount)
  const hasUnread = computed(() => notificationStore.hasUnread)
  const hasNotifications = computed(() => notificationStore.hasNotifications)
  const preferences = computed(() => notificationStore.preferences)
  const isLoading = computed(() => notificationStore.isLoading)
  const hasMore = computed(() => notificationStore.hasMore)

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

  async function handleNotificationClick(notification: any): Promise<void> {
    if (!notification.is_read) {
      await markAsRead(notification.uuid)
    }
    const url = getNotificationUrl(notification)
    if (url) {
      await router.push(url)
    }
  }

  async function loadNotifications(reset?: boolean): Promise<void> {
    await notificationStore.loadNotifications(reset)
  }

  async function loadMore(): Promise<void> {
    await notificationStore.loadMore()
  }

  async function loadCounts(): Promise<void> {
    await notificationStore.loadCounts()
  }

  async function loadByStatus(status: string): Promise<void> {
    await notificationStore.loadNotificationsByStatus(status)
  }

  async function loadByType(type: string): Promise<void> {
    await notificationStore.loadNotificationsByType(type)
  }

  async function loadPreferences(): Promise<void> {
    await notificationStore.loadPreferences()
  }

  async function markAsRead(id: string): Promise<void> {
    await notificationStore.markAsRead(id)
  }

  async function markAsUnread(id: string): Promise<void> {
    await notificationStore.markAsUnread(id)
  }

  async function markAllAsRead(): Promise<void> {
    const count = await notificationStore.markAllAsRead()
    $q.notify({
      type: 'positive',
      message: `${count} notification${count !== 1 ? 's' : ''} marked as read`,
      position: 'top',
      timeout: 2000,
    })
  }

  async function archiveNotification(id: string): Promise<void> {
    await notificationStore.archiveNotification(id)
    $q.notify({
      type: 'positive',
      message: 'Notification archived',
      position: 'top',
      timeout: 1500,
    })
  }

  async function dismissNotification(id: string): Promise<void> {
    await notificationStore.dismissNotification(id)
    $q.notify({
      type: 'positive',
      message: 'Notification dismissed',
      position: 'top',
      timeout: 1500,
    })
  }

  async function deleteNotification(id: string, permanent: boolean = false): Promise<void> {
    $q.dialog({
      title: 'Delete Notification',
      message: `Are you sure you want to ${permanent ? 'permanently delete' : 'delete'} this notification?`,
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

  async function updatePreference(type: string, enabled: boolean): Promise<void> {
    await notificationStore.updatePreference({
      notification_type: type,
      in_app_enabled: enabled,
    })
  }

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

  function startPolling(intervalMs: number = 30000): void {
    if (!authStore.isAuthenticated) return
    notificationStore.startPolling(intervalMs)
    isPollingEnabled.value = true
  }

  function stopPolling(): void {
    notificationStore.stopPolling()
    isPollingEnabled.value = false
  }

  function clearAll(): void {
    notificationStore.clearAll()
  }

  function resetFilters(): void {
    notificationStore.resetFilters()
  }

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

    loadNotifications,
    loadMore,
    loadCounts,
    loadByStatus,
    loadByType,
    loadPreferences,

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

    startPolling,
    stopPolling,

    clearAll,
    resetFilters,
  }
}