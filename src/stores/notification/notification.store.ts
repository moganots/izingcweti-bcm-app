// src/stores/notification/notification.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  NotificationCountResponse,
} from '../../models/notification/notification.entity'
import {
  NotificationStatus,
  NotificationPriority,
} from '../../models/notification/notification.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { notificationService } from '../../services/api/notification/NotificationService'
import { useAuthStore } from '../auth/auth.store'

// ============================================
// Offline-First CRUD Stores
// ============================================
export const useNotificationItemStore = createOfflineCrudStore<Notification>({
  storeId: 'notifications',
  tableName: 'notifications',
})

export const useNotificationPreferenceStore = createOfflineCrudStore<NotificationPreference>({
  storeId: 'notification-preferences',
  tableName: 'notificationPreferences',
})

export const useNotificationTemplateStore = createOfflineCrudStore<NotificationTemplate>({
  storeId: 'notification-templates',
  tableName: 'notificationTemplates',
})

// ============================================
// Main Notification Store (Facade)
// ============================================
export const useNotificationStore = defineStore('notification', () => {
  const notificationStore = useNotificationItemStore()
  const preferenceStore = useNotificationPreferenceStore()
  const templateStore = useNotificationTemplateStore()
  const authStore = useAuthStore()

  const counts = ref<NotificationCountResponse | null>(null)
  const isSaving = ref(false)
  const isPolling = ref(false)
  const isInitialized = ref(false)
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  const notifications = notificationStore.items
  const preferences = preferenceStore.items
  const templates = templateStore.items

  // ============================================
  // Getters - Unread / Read / Archived
  // ============================================
  const unreadNotifications = computed(() =>
    notifications?.filter(
      (n: Notification) => !n.isRead && n.status === NotificationStatus.UNREAD
    )
  )

  const unreadCount = computed(() => unreadNotifications?.value?.length)

  const readNotifications = computed(() =>
    notifications?.filter(
      (n: Notification) => n.status === NotificationStatus.READ
    )
  )

  const archivedNotifications = computed(() =>
    notifications?.filter(
      (n: Notification) => n.status === NotificationStatus.ARCHIVED
    )
  )

  const urgentNotifications = computed(() =>
    notifications?.filter(
      (n: Notification) =>
        n.priority === NotificationPriority.URGENT ||
        n.priority === NotificationPriority.CRITICAL
    )
  )

  // ============================================
  // Getters - Priority
  // ============================================
  const highPriorityUnread = computed(() =>
    unreadNotifications?.value?.filter(
      (n: Notification) =>
        n.priority === NotificationPriority.HIGH ||
        n.priority === NotificationPriority.URGENT ||
        n.priority === NotificationPriority.CRITICAL
    )
  )

  // ============================================
  // Getters - Groupings
  // ============================================
  const notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {}
    notifications?.forEach((n: Notification) => {
      const type = n.notificationType || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(n)
    })
    return grouped
  })

  const activeTemplates = computed(() =>
    templates?.filter((t: NotificationTemplate) => t.isActive)
  )

  // ============================================
  // Getters - Preferences
  // ============================================
  const getPreferenceForType = (
    type: string
  ): NotificationPreference | null =>
    preferences?.find(
      (p: NotificationPreference) => p.notificationType === type
    ) || null

  // ============================================
  // Getters - Counts
  // ============================================
  const displayCounts = computed<NotificationCountResponse>(() => {
    if (counts.value) return counts.value
    return {
      total: notifications?.length,
      unread: unreadNotifications?.value?.length,
      read: readNotifications?.value?.length,
      archived: archivedNotifications?.value?.length,
      dismissed: notifications?.filter(
        (n: Notification) => n.status === NotificationStatus.DISMISSED
      ).length,
      highPriorityUnread: highPriorityUnread?.value?.length,
      urgentCount: urgentNotifications?.value?.length,
    }
  })

  const hasUnread = computed(() => unreadCount.value > 0)

  const hasUrgent = computed(() => urgentNotifications?.value?.length > 0)

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    await Promise.all([
      notificationStore.initialize(),
      preferenceStore.initialize(),
    ])
    await fetchCounts()
    isInitialized.value = true
  }

  async function fetchCounts(): Promise<void> {
    try {
      counts.value = await notificationService.getNotificationCounts()
    } catch (err) {
      console.error('Failed to fetch notification counts:', err)
    }
  }

  async function markAsRead(id: string): Promise<Notification | null> {
    const updated = await notificationStore.update(id, {
      isRead: true,
      status: NotificationStatus.READ,
      readAt: new Date(),
    } as Partial<Notification>)

    await fetchCounts()
    return updated
  }

  async function markAllAsRead(): Promise<number> {
    const unread = unreadNotifications.value
    for (const n of unread) {
      await notificationStore.update(n.uuid, {
        isRead: true,
        status: NotificationStatus.READ,
        readAt: new Date(),
      } as Partial<Notification>)
    }
    await fetchCounts()
    return unread.length
  }

  async function markAsUnread(id: string): Promise<Notification | null> {
    const updated = await notificationStore.update(id, {
      isRead: false,
      status: NotificationStatus.UNREAD,
      readAt: undefined,
    } as unknown as Partial<Notification>)

    await fetchCounts()
    return updated
  }

  async function archiveNotification(id: string): Promise<Notification | null> {
    return notificationStore.update(id, {
      status: NotificationStatus.ARCHIVED,
    } as Partial<Notification>)
  }

  async function dismissNotification(id: string): Promise<Notification | null> {
    return notificationStore.update(id, {
      status: NotificationStatus.DISMISSED,
    } as Partial<Notification>)
  }

  async function acknowledgeNotification(id: string): Promise<Notification | null> {
    return notificationStore.update(id, {
      isAcknowledged: true,
      acknowledgedAt: new Date(),
    } as Partial<Notification>)
  }

  async function deleteNotification(id: string): Promise<boolean> {
    return notificationStore.remove(id)
  }

  async function clearAllRead(): Promise<number> {
    const read = readNotifications.value
    for (const n of read) {
      await notificationStore.remove(n.uuid)
    }
    await fetchCounts()
    return read.length
  }

  async function upsertPreference(
    data: Partial<NotificationPreference>
  ): Promise<NotificationPreference | null> {
    const existing = preferences?.find(
      (p: NotificationPreference) => p.notificationType === data.notificationType
    )
    if (existing) {
      return preferenceStore.update(existing.uuid, data)
    }
    return preferenceStore.create({
      userId: authStore.userId,
      ...data,
    } as Partial<NotificationPreference>)
  }

  function startPolling(intervalMs: number = 30000): void {
    if (isPolling.value) return
    stopPolling()

    isPolling.value = true
    pollingInterval = setInterval(async () => {
      try {
        await fetchCounts()
        if (counts.value && counts?.value?.unread > 0) {
          await notificationStore.loadAll()
        }
      } catch {
        // Ignore polling errors
      }
    }, intervalMs)
  }

  function stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
    isPolling.value = false
  }

  function clearError(): void {
    notificationStore.clearError()
  }

  function reset(): void {
    notificationStore.reset()
    preferenceStore.reset()
    templateStore.reset()
    counts.value = null
    isSaving.value = false
    isInitialized.value = false
    stopPolling()
  }

  function cleanup(): void {
    stopPolling()
    isInitialized.value = false
  }

  // ============================================
  // Return Store Interface
  // ============================================
  return {
    // State
    notifications,
    preferences,
    templates,
    counts,
    isLoading: notificationStore.loading,
    isSaving,
    isPolling,
    isInitialized,
    error: notificationStore.error,

    // Getters - Unread / Read / Archived
    unreadNotifications,
    unreadCount,
    readNotifications,
    archivedNotifications,
    urgentNotifications,

    // Getters - Priority
    highPriorityUnread,

    // Getters - Groupings
    notificationsByType,
    activeTemplates,

    // Getters - Preferences
    getPreferenceForType,

    // Getters - Counts
    displayCounts,
    hasUnread,
    hasUrgent,

    // Actions
    initialize,
    fetchCounts,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    archiveNotification,
    dismissNotification,
    acknowledgeNotification,
    deleteNotification,
    clearAllRead,
    upsertPreference,
    startPolling,
    stopPolling,
    clearError,
    reset,
    cleanup,

    // Sub-stores
    notificationStore,
    preferenceStore,
    templateStore,
  }
})