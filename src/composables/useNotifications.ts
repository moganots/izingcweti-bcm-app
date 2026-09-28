import { computed, ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notification/notification.store'
import { useAuth } from './useAuth'

/**
 * Notifications composable
 * Aligned with useNotificationStore
 */
export function useNotifications() {
  const store = useNotificationStore()
  const auth = useAuth()

  const { isAuthenticated, userId, isAdmin, isBCMManager } = auth

  const {
    notifications,
    preferences,
    templates,
    counts,
    isLoading,
    isSaving,
    isPolling,
    error,
    unreadNotifications,
    unreadCount,
    highPriorityUnread,
    notificationsByType,
    activeTemplates,
    readNotifications,
    archivedNotifications,
    urgentNotifications,
    displayCounts,
    hasUnread,
    hasUrgent,
  } = storeToRefs(store)

  // ============================================
  // Notifications List
  // ============================================
  function useNotificationsList() {
    const page = ref(1)
    const limit = ref(20)

    async function fetchNotifications(): Promise<void> {
      if (!isAuthenticated.value) return
      await store.initialize()
    }

    async function markAsRead(uuid: string) {
      if (!isAuthenticated.value) return null
      return store.markAsRead(uuid)
    }

    async function markAllAsRead() {
      if (!isAuthenticated.value) return 0
      return store.markAllAsRead()
    }

    async function archive(uuid: string) {
      if (!isAuthenticated.value) return null
      return store.archiveNotification(uuid)
    }

    async function dismiss(uuid: string) {
      if (!isAuthenticated.value) return null
      return store.dismissNotification(uuid)
    }

    async function acknowledge(uuid: string) {
      if (!isAuthenticated.value) return null
      return store.acknowledgeNotification(uuid)
    }

    async function remove(uuid: string) {
      if (!isAuthenticated.value) return false
      return store.deleteNotification(uuid)
    }

    return {
      notifications,
      unreadNotifications,
      readNotifications,
      archivedNotifications,
      highPriorityUnread,
      urgentNotifications,
      notificationsByType,
      unreadCount,
      isLoading,
      error,
      page,
      limit,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      archive,
      dismiss,
      acknowledge,
      remove,
    }
  }

  // ============================================
  // Preferences
  // ============================================
  function useNotificationPreferences() {
    async function updatePreference(
      data: Parameters<typeof store.upsertPreference>[0]
    ) {
      if (!isAuthenticated.value) return null
      return store.upsertPreference(data)
    }

    return {
      preferences,
      isLoading,
      isSaving,
      error,
      updatePreference,
      getPreferenceForType: store.getPreferenceForType,
    }
  }

  // ============================================
  // Templates (admin only)
  // ============================================
  function useNotificationTemplates() {
    const canManage = computed(() => isAdmin.value || isBCMManager.value)

    return {
      templates,
      activeTemplates,
      isLoading,
      isSaving,
      error,
      canManage,
    }
  }

  // ============================================
  // Counts
  // ============================================
  function useNotificationCounts() {
    async function fetchCounts() {
      if (!isAuthenticated.value) return null
      return store.fetchCounts()
    }

    return {
      counts,
      displayCounts,
      unreadCount,
      hasUnread,
      hasUrgent,
      isLoading,
      error,
      fetchCounts,
    }
  }

  // ============================================
  // Polling
  // ============================================
  function useNotificationPolling(intervalMs: number = 30000) {
    function start() {
      if (!isAuthenticated.value) return
      store.startPolling(intervalMs)
    }

    function stop() {
      store.stopPolling()
    }

    watch(
      isAuthenticated,
      (auth) => {
        if (auth) start()
        else stop()
      },
      { immediate: false }
    )

    return {
      start,
      stop,
      isActive: isPolling,
      canPoll: isAuthenticated,
    }
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(() => {
    if (isAuthenticated.value) {
      store.fetchCounts().catch(console.error)
    }
  })

  // ============================================
  // Return API
  // ============================================
  return {
    store,
    isAuthenticated,
    userId,
    isAdmin,
    isBCMManager,

    // Sub-composables
    useNotificationsList,
    useNotificationPreferences,
    useNotificationTemplates,
    useNotificationCounts,
    useNotificationPolling,

    // Utilities
    clearError: store.clearError,
    reset: store.reset,
    cleanup: store.cleanup,
  }
}

export default useNotifications