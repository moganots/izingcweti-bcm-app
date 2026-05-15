import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Notification,
  NotificationCounts,
  NotificationPreference,
} from '../models/entities/notification.entity'
import {
  notificationService,
  type UpdatePreferencesRequest,
} from '../services/api/NotificationService'
import { useAuthStore } from './auth.store'

export const useNotificationStore = defineStore('notification', () => {
  // ============================================
  // State
  // ============================================
  const notifications = ref<Notification[]>([])
  const preferences = ref<NotificationPreference[]>([])
  const counts = ref<NotificationCounts | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(false)
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const isPolling = ref(false)

  // ============================================
  // Getters
  // ============================================
  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.is_read && n.status !== 'ARCHIVED')
  )

  const unreadCount = computed(() => unreadNotifications.value.length)
  const totalCount = computed(() => notifications.value.length)
  const hasNotifications = computed(() => notifications.value.length > 0)
  const hasUnread = computed(() => unreadCount.value > 0)

  const readNotifications = computed(() =>
    notifications.value.filter((n) => n.is_read && n.status !== 'ARCHIVED')
  )

  const archivedNotifications = computed(() =>
    notifications.value.filter((n) => n.status === 'ARCHIVED')
  )

  const dismissedNotifications = computed(() =>
    notifications.value.filter((n) => n.status === 'DISMISSED')
  )

  const notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {}
    notifications.value.forEach((n) => {
      const type = n.notification_type || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(n)
    })
    return grouped
  })

  const highPriorityUnread = computed(() =>
    unreadNotifications.value.filter((n) => n.priority === 'HIGH' || n.priority === 'URGENT')
  )

  // ============================================
  // Actions
  // ============================================

  async function loadNotifications(reset: boolean = true): Promise<void> {
    if (reset) {
      isLoading.value = true
      currentPage.value = 1
    }
    error.value = null

    try {
      const response = await notificationService.getNotifications({
        page: currentPage.value,
        limit: 20,
      })

      if (reset) {
        notifications.value = response.data || []
      } else {
        notifications.value.push(...(response.data || []))
      }
      hasMore.value = (response.data || []).length === 20
    } catch (err: any) {
      console.error('Failed to load notifications:', err)
      error.value = err.message || 'Failed to load notifications'
    } finally {
      if (reset) isLoading.value = false
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoading.value) return
    currentPage.value++
    await loadNotifications(false)
  }

  async function loadUnread(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await notificationService.getUnreadNotifications()
      notifications.value = response.data || []
      hasMore.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to load unread notifications'
    } finally {
      isLoading.value = false
    }
  }

  async function loadCounts(): Promise<void> {
    try {
      counts.value = await notificationService.getNotificationCounts()
    } catch (err: any) {
      console.error('Failed to load counts:', err)
    }
  }

  async function loadPreferences(): Promise<void> {
    try {
      preferences.value = await notificationService.getPreferences()
    } catch (err: any) {
      console.error('Failed to load preferences:', err)
    }
  }

  async function updatePreference(pref: UpdatePreferencesRequest): Promise<NotificationPreference> {
    isSaving.value = true
    error.value = null
    try {
      const updated = await notificationService.updatePreferences(pref)
      const index = preferences.value.findIndex(
        (p) => p.notification_type === pref.notification_type
      )
      if (index !== -1) {
        preferences.value[index] = updated
      } else {
        preferences.value.push(updated)
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update preference'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function markAsRead(notificationId: string): Promise<void> {
    try {
      await notificationService.markAsRead(notificationId)
      const notification = notifications.value.find((n) => n.uuid === notificationId)
      if (notification) {
        notification.is_read = true
        notification.status = 'READ' as any
        notification.read_at = new Date().toISOString()
      }
      if (counts.value && counts.value.unread > 0) {
        counts.value = { ...counts.value, unread: counts.value.unread - 1 }
      }
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
    }
  }

  async function markAllAsRead(): Promise<number> {
    isSaving.value = true
    error.value = null
    try {
      await notificationService.markAllAsRead()
      const count = unreadCount.value
      notifications.value.forEach((n) => {
        if (!n.is_read) {
          n.is_read = true
          n.status = 'READ' as any
          n.read_at = new Date().toISOString()
        }
      })
      if (counts.value) {
        counts.value = { ...counts.value, unread: 0 }
      }
      return count
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all as read'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function archiveNotification(notificationId: string): Promise<void> {
    try {
      await notificationService.archive(notificationId)
      const notification = notifications.value.find((n) => n.uuid === notificationId)
      if (notification) {
        notification.status = 'ARCHIVED' as any
      }
    } catch (err: any) {
      console.error('Failed to archive:', err)
    }
  }

  async function dismissNotification(notificationId: string): Promise<void> {
    try {
      await notificationService.dismiss(notificationId)
      const notification = notifications.value.find((n) => n.uuid === notificationId)
      if (notification) {
        notification.status = 'DISMISSED' as any
      }
    } catch (err: any) {
      console.error('Failed to dismiss:', err)
    }
  }

  async function removeNotification(notificationId: string): Promise<void> {
    try {
      await notificationService.deleteNotification(notificationId)
      const wasUnread =
        notifications.value.find((n) => n.uuid === notificationId)?.is_read === false
      notifications.value = notifications.value.filter((n) => n.uuid !== notificationId)
      if (wasUnread && counts.value && counts.value.unread > 0) {
        counts.value = { ...counts.value, unread: counts.value.unread - 1 }
      }
    } catch (err: any) {
      console.error('Failed to delete:', err)
    }
  }

  function startPolling(intervalMs: number = 30000): void {
    if (isPolling.value) return
    stopPolling()
    isPolling.value = true
    pollingInterval.value = setInterval(async () => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        try {
          await loadCounts()
          if (counts.value && counts.value.unread !== unreadCount.value) {
            await loadNotifications(true)
          }
        } catch {
          /* ignore polling errors */
        }
      }
    }, intervalMs)
  }

  function stopPolling(): void {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    isPolling.value = false
  }

  function clearAll(): void {
    stopPolling()
    notifications.value = []
    preferences.value = []
    counts.value = null
    error.value = null
    currentPage.value = 1
    hasMore.value = false
  }

  return {
    // State
    notifications,
    preferences,
    counts,
    isLoading,
    isSaving,
    error,
    currentPage,
    hasMore,
    isPolling,
    // Getters
    unreadNotifications,
    unreadCount,
    totalCount,
    hasNotifications,
    hasUnread,
    readNotifications,
    archivedNotifications,
    dismissedNotifications,
    notificationsByType,
    highPriorityUnread,
    // Actions
    loadNotifications,
    loadMore,
    loadUnread,
    loadCounts,
    loadPreferences,
    updatePreference,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    removeNotification,
    startPolling,
    stopPolling,
    clearAll,
  }
})
