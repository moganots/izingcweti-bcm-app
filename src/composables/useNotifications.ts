import { computed, ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notification/notification.store';
import { useAuth } from '@/composables/auth/useAuth';
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  CreateNotificationDto,
  NotificationPreferenceDto,
  NotificationTemplateDto,
  NotificationQueryDto,
} from '@/types/notification';
import { NotificationStatus } from '@/types/notification/enums';

export function useNotification() {
  const store = useNotificationStore();
  const auth = useAuth();

  // Auth state
  const { isAuthenticated, userId, isAdmin, isBCMManager } = auth;

  // Store refs
  const {
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
    unreadNotifications,
    unreadCount,
    readNotifications,
    archivedNotifications,
    highPriorityUnread,
    notificationsByType,
    activeTemplates,
    inactiveTemplates,
  } = storeToRefs(store);

  // ============================================
  // Composable: useNotifications
  // ============================================
  function useNotifications(initialParams?: NotificationQueryDto) {
    const params = ref<NotificationQueryDto>(initialParams || {});
    const page = ref(1);
    const limit = ref(20);

    const canFetch = computed(() => isAuthenticated.value);

    const fetchNotifications = async () => {
      if (!canFetch.value) {
        console.warn('Cannot fetch notifications: User not authenticated');
        return null;
      }
      return store.fetchNotifications({
        ...params.value,
        page: page.value,
        limit: limit.value,
      });
    };

    const loadMore = () => {
      if (pagination.value.currentPage < pagination.value.totalPages) {
        page.value++;
        fetchNotifications();
      }
    };

    const markAsRead = async (uuid: string) => {
      if (!canFetch.value) {
        console.warn('Cannot mark as read: User not authenticated');
        return;
      }
      return store.markAsRead(uuid);
    };

    const markAllAsRead = async () => {
      if (!canFetch.value) {
        console.warn('Cannot mark all as read: User not authenticated');
        return 0;
      }
      return store.markAllAsRead();
    };

    const archive = async (uuid: string) => {
      if (!canFetch.value) {
        console.warn('Cannot archive: User not authenticated');
        return null;
      }
      return store.archiveNotification(uuid);
    };

    const remove = async (uuid: string) => {
      if (!canFetch.value) {
        console.warn('Cannot delete: User not authenticated');
        return;
      }
      return store.deleteNotification(uuid);
    };

    const create = async (data: CreateNotificationDto) => {
      if (!canFetch.value) {
        console.warn('Cannot create: User not authenticated');
        return null;
      }
      return store.createNotification(data);
    };

    // Auto-fetch on param changes if authenticated
    watch([params, page, limit], () => {
      if (canFetch.value) {
        fetchNotifications();
      }
    }, { immediate: false });

    // Auto-fetch on authentication
    watch(isAuthenticated, (authenticated) => {
      if (authenticated) {
        fetchNotifications();
      }
    }, { immediate: false });

    return {
      // State
      notifications,
      selectedNotification,
      isLoading,
      error,
      pagination,
      unreadNotifications,
      unreadCount,
      readNotifications,
      archivedNotifications,
      highPriorityUnread,
      notificationsByType,
      canFetch,

      // Params
      params,
      page,
      limit,

      // Actions
      fetchNotifications,
      loadMore,
      markAsRead,
      markAllAsRead,
      archive,
      remove,
      create,
    };
  }

  // ============================================
  // Composable: useNotificationPreferences
  // ============================================
  function useNotificationPreferences() {
    const canFetch = computed(() => isAuthenticated.value);

    const fetchPreferences = async () => {
      if (!canFetch.value) {
        console.warn('Cannot fetch preferences: User not authenticated');
        return [];
      }
      return store.fetchPreferences();
    };

    const updatePreference = async (data: NotificationPreferenceDto) => {
      if (!canFetch.value) {
        console.warn('Cannot update preference: User not authenticated');
        return null;
      }
      return store.upsertPreference(data);
    };

    // Auto-fetch on mount if authenticated
    const initialized = ref(false);
    const initialize = async () => {
      if (!initialized.value && canFetch.value) {
        await fetchPreferences();
        initialized.value = true;
      }
    };

    // Watch authentication and fetch if needed
    watch(isAuthenticated, async (authenticated) => {
      if (authenticated && !initialized.value) {
        await initialize();
      }
    });

    return {
      // State
      preferences,
      isLoading,
      isSaving,
      error,
      canFetch,

      // Actions
      fetchPreferences,
      updatePreference,
      initialize,
    };
  }

  // ============================================
  // Composable: useNotificationTemplates (Admin Only)
  // ============================================
  function useNotificationTemplates(initialParams?: { page?: number; limit?: number }) {
    const params = ref(initialParams || {});
    const page = ref(1);
    const limit = ref(20);

    const canManageTemplates = computed(() => isAdmin.value || isBCMManager.value);

    const fetchTemplates = async () => {
      if (!canManageTemplates.value) {
        console.warn('Cannot fetch templates: Insufficient permissions');
        return null;
      }
      return store.fetchTemplates({
        ...params.value,
        page: page.value,
        limit: limit.value,
      });
    };

    const create = async (data: NotificationTemplateDto) => {
      if (!canManageTemplates.value) {
        console.warn('Cannot create template: Insufficient permissions');
        return null;
      }
      return store.createTemplate(data);
    };

    const update = async (uuid: string, data: Partial<NotificationTemplateDto>) => {
      if (!canManageTemplates.value) {
        console.warn('Cannot update template: Insufficient permissions');
        return null;
      }
      return store.updateTemplate(uuid, data);
    };

    const activate = async (uuid: string) => {
      if (!canManageTemplates.value) {
        console.warn('Cannot activate template: Insufficient permissions');
        return null;
      }
      return store.activateTemplate(uuid);
    };

    const deactivate = async (uuid: string) => {
      if (!canManageTemplates.value) {
        console.warn('Cannot deactivate template: Insufficient permissions');
        return null;
      }
      return store.deactivateTemplate(uuid);
    };

    const remove = async (uuid: string) => {
      if (!canManageTemplates.value) {
        console.warn('Cannot delete template: Insufficient permissions');
        return;
      }
      return store.deleteTemplate(uuid);
    };

    const getById = async (uuid: string) => {
      if (!canManageTemplates.value) {
        console.warn('Cannot get template: Insufficient permissions');
        return null;
      }
      return store.fetchTemplateById(uuid);
    };

    const getStats = async () => {
      if (!canManageTemplates.value) {
        console.warn('Cannot get template stats: Insufficient permissions');
        return null;
      }
      return store.fetchTemplateStats();
    };

    // Auto-fetch on param changes if authorized
    watch([params, page, limit], () => {
      if (canManageTemplates.value) {
        fetchTemplates();
      }
    }, { immediate: false });

    return {
      // State
      templates,
      selectedTemplate,
      templateStats,
      isLoading,
      isSaving,
      error,
      pagination,
      activeTemplates,
      inactiveTemplates,
      canManageTemplates,

      // Params
      params,
      page,
      limit,

      // Actions
      fetchTemplates,
      getById,
      create,
      update,
      activate,
      deactivate,
      remove,
      getStats,
    };
  }

  // ============================================
  // Composable: useNotificationCounts
  // ============================================
  function useNotificationCounts() {
    const canFetch = computed(() => isAuthenticated.value);

    const fetchCounts = async () => {
      if (!canFetch.value) {
        console.warn('Cannot fetch counts: User not authenticated');
        return null;
      }
      return store.fetchCounts();
    };

    const fetchUnreadCount = async () => {
      if (!canFetch.value) {
        console.warn('Cannot fetch unread count: User not authenticated');
        return 0;
      }
      return store.fetchUnreadCount();
    };

    // Auto-fetch on mount if authenticated
    const initialized = ref(false);
    const initialize = async () => {
      if (!initialized.value && canFetch.value) {
        await Promise.all([fetchCounts(), fetchUnreadCount()]);
        initialized.value = true;
      }
    };

    // Watch authentication and fetch if needed
    watch(isAuthenticated, async (authenticated) => {
      if (authenticated && !initialized.value) {
        await initialize();
      }
    });

    return {
      // State
      counts,
      unreadCount,
      isLoading,
      error,
      canFetch,

      // Actions
      fetchCounts,
      fetchUnreadCount,
      initialize,
    };
  }

  // ============================================
  // Composable: useNotificationPolling
  // ============================================
  function useNotificationPolling(intervalMs: number = 30000) {
    const canPoll = computed(() => isAuthenticated.value);

    const start = () => {
      if (canPoll.value) {
        store.startPolling(intervalMs);
      } else {
        console.warn('Cannot start polling: User not authenticated');
      }
    };

    const stop = () => {
      store.stopPolling();
    };

    const isActive = computed(() => isPolling.value);

    // Auto-start polling when authenticated
    watch(isAuthenticated, (authenticated) => {
      if (authenticated) {
        start();
      } else {
        stop();
      }
    }, { immediate: false });

    return {
      start,
      stop,
      isActive,
      canPoll,
    };
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(() => {
    // Initialize notification counts if authenticated
    if (isAuthenticated.value) {
      store.fetchCounts();
    }
  });

  // ============================================
  // Utility Functions
  // ============================================
  const clearError = () => store.clearError();
  const resetState = () => store.resetState();

  return {
    // Main store access
    store,

    // Auth state
    isAuthenticated,
    userId,
    isAdmin,
    isBCMManager,

    // Specialized composables
    useNotifications,
    useNotificationPreferences,
    useNotificationTemplates,
    useNotificationCounts,
    useNotificationPolling,

    // Utility
    clearError,
    resetState,
  };
}

export default useNotification;