import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationService } from './../../services/api/notification/NotificationService';
import { useAuth } from './../../composables/useAuth';
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  CreateNotificationRequest,
  NotificationQueryParams,
  NotificationCountResponse,
  NotificationStats,
  TemplateStats,
} from './../../models/entities/notification/notification.entity';
import { NotificationStatus } from './../../models/entities/notification/notification.entity';

export const useNotificationStore = defineStore('notification', () => {
  // ============================================
  // Dependencies
  // ============================================
  const { isAuthenticated, isAdmin, isBCMManager } = useAuth();

  // ============================================
  // State
  // ============================================

  // Notifications
  const notifications = ref<Notification[]>([]);
  const selectedNotification = ref<Notification | null>(null);

  // Preferences
  const preferences = ref<NotificationPreference[]>([]);

  // Templates
  const templates = ref<NotificationTemplate[]>([]);
  const selectedTemplate = ref<NotificationTemplate | null>(null);

  // Counts & Stats
  const counts = ref<NotificationCountResponse | null>(null);
  const stats = ref<NotificationStats | null>(null);
  const templateStats = ref<TemplateStats | null>(null);

  // UI State
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Polling
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const isPolling = ref(false);

  // ============================================
  // Getters
  // ============================================

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.isRead && n.status === NotificationStatus.UNREAD)
  );

  const unreadCount = computed(() => unreadNotifications.value.length);

  const readNotifications = computed(() =>
    notifications.value.filter((n) => n.isRead)
  );

  const archivedNotifications = computed(() =>
    notifications.value.filter((n) => n.status === NotificationStatus.ARCHIVED)
  );

  const highPriorityUnread = computed(() =>
    unreadNotifications.value.filter(
      (n) => n.priority === 'HIGH' || n.priority === 'URGENT'
    )
  );

  const notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {};
    notifications.value.forEach((n) => {
      const type = n.notificationType || 'Unknown';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(n);
    });
    return grouped;
  });

  const activeTemplates = computed(() =>
    templates.value.filter((t) => t.isActive)
  );

  const inactiveTemplates = computed(() =>
    templates.value.filter((t) => !t.isActive)
  );

  // ============================================
  // Actions - Notifications
  // ============================================

  async function fetchNotifications(params?: NotificationQueryParams) {
    // Only fetch if authenticated
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return null;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const response = await notificationService.getMyNotifications(params);
      notifications.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNotificationById(uuid: string) {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return null;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const notification = await notificationService.getNotificationById(uuid);
      selectedNotification.value = notification;
      return notification;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notification';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUnreadCount(): Promise<number> {
    if (!isAuthenticated.value) return 0;

    try {
      const result = await notificationService.getUnreadCount();
      return result.count || 0;
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  }

  async function fetchCounts(): Promise<NotificationCountResponse | null> {
    if (!isAuthenticated.value) return null;

    try {
      counts.value = await notificationService.getNotificationCounts();
      return counts.value;
    } catch (err: any) {
      console.error('Failed to fetch counts:', err);
      throw err;
    }
  }

  async function createNotification(data: CreateNotificationRequest): Promise<Notification | null> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return null;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const notification = await notificationService.createNotification(data);
      notifications.value.unshift(notification);
      return notification;
    } catch (err: any) {
      error.value = err.message || 'Failed to create notification';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsRead(uuid: string): Promise<void> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return;
    }

    try {
      await notificationService.markAsRead(uuid);
      const notification = notifications.value.find((n) => n.uuid === uuid);
      if (notification) {
        notification.isRead = true;
        notification.status = NotificationStatus.READ;
        notification.readAt = new Date();
      }
      if (selectedNotification.value?.uuid === uuid) {
        selectedNotification.value.isRead = true;
        selectedNotification.value.status = NotificationStatus.READ;
        selectedNotification.value.readAt = new Date();
      }
      if (counts.value && counts.value.unread > 0) {
        counts.value = { ...counts.value, unread: counts.value.unread - 1 };
      }
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
      throw err;
    }
  }

  async function markAllAsRead(): Promise<number> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return 0;
    }

    isSaving.value = true;
    error.value = null;
    try {
      const result = await notificationService.markAllAsRead();
      notifications.value.forEach((n) => {
        if (!n.isRead) {
          n.isRead = true;
          n.status = NotificationStatus.READ;
          n.readAt = new Date();
        }
      });
      if (counts.value) {
        counts.value = { ...counts.value, unread: 0 };
      }
      return result.count || 0;
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all as read';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function archiveNotification(uuid: string): Promise<Notification | null> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return null;
    }

    try {
      const notification = await notificationService.archiveNotification(uuid);
      const index = notifications.value.findIndex((n) => n.uuid === uuid);
      if (index !== -1) {
        notifications.value[index] = notification;
      }
      if (selectedNotification.value?.uuid === uuid) {
        selectedNotification.value = notification;
      }
      return notification;
    } catch (err: any) {
      console.error('Failed to archive notification:', err);
      throw err;
    }
  }

  async function deleteNotification(uuid: string): Promise<void> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return;
    }

    try {
      await notificationService.deleteNotification(uuid);
      notifications.value = notifications.value.filter((n) => n.uuid !== uuid);
      if (selectedNotification.value?.uuid === uuid) {
        selectedNotification.value = null;
      }
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
      throw err;
    }
  }

  // ============================================
  // Actions - Preferences
  // ============================================

  async function fetchPreferences(): Promise<NotificationPreference[]> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return [];
    }

    isLoading.value = true;
    error.value = null;
    try {
      preferences.value = await notificationService.getPreferences();
      return preferences.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch preferences';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function upsertPreference(data: {
    notificationType: string;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    inAppEnabled?: boolean;
  }): Promise<NotificationPreference | null> {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return null;
    }

    isSaving.value = true;
    error.value = null;
    try {
      const updated = await notificationService.upsertPreference(data);
      const index = preferences.value.findIndex(
        (p) => p.notificationType === data.notificationType
      );
      if (index !== -1) {
        preferences.value[index] = updated;
      } else {
        preferences.value.push(updated);
      }
      return updated;
    } catch (err: any) {
      error.value = err.message || 'Failed to update preference';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Templates (Admin Only)
  // ============================================

  async function fetchTemplates(params?: { page?: number; limit?: number }) {
    // Only admins and BCM managers can access templates
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const response = await notificationService.getTemplates(params);
      templates.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch templates';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTemplateById(uuid: string): Promise<NotificationTemplate | null> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const template = await notificationService.getTemplateById(uuid);
      selectedTemplate.value = template;
      return template;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch template';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createTemplate(data: {
    notificationType: string;
    titleTemplate: string;
    messageTemplate: string;
    isActive?: boolean;
  }): Promise<NotificationTemplate | null> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    isSaving.value = true;
    error.value = null;
    try {
      const template = await notificationService.createTemplate(data);
      templates.value.unshift(template);
      return template;
    } catch (err: any) {
      error.value = err.message || 'Failed to create template';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateTemplate(
    uuid: string,
    data: Partial<{
      titleTemplate: string;
      messageTemplate: string;
      isActive: boolean;
    }>
  ): Promise<NotificationTemplate | null> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    isSaving.value = true;
    error.value = null;
    try {
      const template = await notificationService.updateTemplate(uuid, data);
      const index = templates.value.findIndex((t) => t.uuid === uuid);
      if (index !== -1) {
        templates.value[index] = template;
      }
      if (selectedTemplate.value?.uuid === uuid) {
        selectedTemplate.value = template;
      }
      return template;
    } catch (err: any) {
      error.value = err.message || 'Failed to update template';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function activateTemplate(uuid: string): Promise<NotificationTemplate | null> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    isSaving.value = true;
    error.value = null;
    try {
      const template = await notificationService.activateTemplate(uuid);
      const index = templates.value.findIndex((t) => t.uuid === uuid);
      if (index !== -1) {
        templates.value[index] = template;
      }
      return template;
    } catch (err: any) {
      error.value = err.message || 'Failed to activate template';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deactivateTemplate(uuid: string): Promise<NotificationTemplate | null> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    isSaving.value = true;
    error.value = null;
    try {
      const template = await notificationService.deactivateTemplate(uuid);
      const index = templates.value.findIndex((t) => t.uuid === uuid);
      if (index !== -1) {
        templates.value[index] = template;
      }
      return template;
    } catch (err: any) {
      error.value = err.message || 'Failed to deactivate template';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteTemplate(uuid: string): Promise<void> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return;
    }

    isSaving.value = true;
    error.value = null;
    try {
      await notificationService.deleteTemplate(uuid);
      templates.value = templates.value.filter((t) => t.uuid !== uuid);
      if (selectedTemplate.value?.uuid === uuid) {
        selectedTemplate.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete template';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function fetchTemplateStats(): Promise<TemplateStats | null> {
    if (!isAdmin.value && !isBCMManager.value) {
      error.value = 'Insufficient permissions';
      return null;
    }

    try {
      templateStats.value = await notificationService.getTemplateStats();
      return templateStats.value;
    } catch (err: any) {
      console.error('Failed to fetch template stats:', err);
      throw err;
    }
  }

  // ============================================
  // Actions - Polling
  // ============================================

  function startPolling(intervalMs: number = 30000) {
    if (isPolling.value || !isAuthenticated.value) return;
    stopPolling();
    isPolling.value = true;
    pollingInterval.value = setInterval(async () => {
      try {
        const newCounts = await fetchCounts();
        if (newCounts && counts.value && newCounts.unread !== counts.value.unread) {
          await fetchNotifications();
        }
      } catch {
        // Ignore polling errors
      }
    }, intervalMs);
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
    isPolling.value = false;
  }

  // ============================================
  // Actions - Utilities
  // ============================================

  function clearError() {
    error.value = null;
  }

  function resetState() {
    stopPolling();
    notifications.value = [];
    selectedNotification.value = null;
    preferences.value = [];
    templates.value = [];
    selectedTemplate.value = null;
    counts.value = null;
    stats.value = null;
    templateStats.value = null;
    isLoading.value = false;
    isSaving.value = false;
    error.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
    };
  }

  return {
    // State
    notifications,
    selectedNotification,
    preferences,
    templates,
    selectedTemplate,
    counts,
    stats,
    templateStats,
    isLoading,
    isSaving,
    error,
    pagination,
    isPolling,

    // Getters
    unreadNotifications,
    unreadCount,
    readNotifications,
    archivedNotifications,
    highPriorityUnread,
    notificationsByType,
    activeTemplates,
    inactiveTemplates,

    // Notification Actions
    fetchNotifications,
    fetchNotificationById,
    fetchUnreadCount,
    fetchCounts,
    createNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,

    // Preference Actions
    fetchPreferences,
    upsertPreference,

    // Template Actions
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    activateTemplate,
    deactivateTemplate,
    deleteTemplate,
    fetchTemplateStats,

    // Polling
    startPolling,
    stopPolling,

    // Utilities
    clearError,
    resetState,
  };
});