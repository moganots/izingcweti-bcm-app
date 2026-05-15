import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../stores/notification.store';
import { useAuthStore } from '../stores/auth.store';

/**
 * Composable for notification management
 */
export function useNotifications() {
    const notificationStore = useNotificationStore();
    const authStore = useAuthStore();

    const isPollingEnabled = ref(false);

    // ============================================
    // Computed
    // ============================================
    const notifications = computed(() => notificationStore.notifications);
    const unreadNotifications = computed(() => notificationStore.unreadNotifications);
    const unreadCount = computed(() => notificationStore.unreadCount);
    const hasUnread = computed(() => notificationStore.hasUnread);
    const preferences = computed(() => notificationStore.preferences);

    // ============================================
    // Actions
    // ============================================

    /**
     * Load notifications
     */
    async function loadNotifications(): Promise<void> {
        await notificationStore.loadNotifications(true);
    }

    /**
     * Load more notifications (pagination)
     */
    async function loadMore(): Promise<void> {
        await notificationStore.loadMore();
    }

    /**
     * Load notification counts
     */
    async function loadCounts(): Promise<void> {
        await notificationStore.loadCounts();
    }

    /**
     * Mark a notification as read
     */
    async function markAsRead(id: string): Promise<void> {
        await notificationStore.markAsRead(id);
    }

    /**
     * Mark all notifications as read
     */
    async function markAllAsRead(): Promise<void> {
        await notificationStore.markAllAsRead();
    }

    /**
     * Archive a notification
     */
    async function archiveNotification(id: string): Promise<void> {
        await notificationStore.archiveNotification(id);
    }

    /**
     * Delete a notification
     */
    async function deleteNotification(id: string): Promise<void> {
        await notificationStore.removeNotification(id);
    }

    /**
     * Load notification preferences
     */
    async function loadPreferences(): Promise<void> {
        await notificationStore.loadPreferences();
    }

    /**
     * Update notification preference
     */
    async function updatePreference(type: string, enabled: boolean): Promise<void> {
        await notificationStore.updatePreference({
            notification_type: type,
            in_app_enabled: enabled,
        });
    }

    /**
     * Start polling for notifications
     */
    function startPolling(intervalMs: number = 30000): void {
        if (!authStore.isAuthenticated) return;
        notificationStore.startPolling(intervalMs);
        isPollingEnabled.value = true;
    }

    /**
     * Stop polling for notifications
     */
    function stopPolling(): void {
        notificationStore.stopPolling();
        isPollingEnabled.value = false;
    }

    /**
     * Handle notification click - navigate to relevant page
     */
    function handleNotificationClick(notification: any): string | null {
        if (notification.action_url) {
            return notification.action_url;
        }

        if (notification.entity_type && notification.entity_id) {
            switch (notification.entity_type) {
                case 'incident':
                    return `/incidents/${notification.entity_id}`;
                case 'workflow':
                    return `/workflows/${notification.entity_id}`;
                case 'document':
                    return `/documents`;
                case 'risk':
                    return `/risks/${notification.entity_id}`;
                case 'bcp':
                    return `/bcm/bcp/${notification.entity_id}`;
                default:
                    return null;
            }
        }

        return null;
    }

    onMounted(async () => {
        if (authStore.isAuthenticated) {
            await loadCounts();
            startPolling();
        }
    });

    onUnmounted(() => {
        stopPolling();
    });

    return {
        // State
        notifications,
        unreadNotifications,
        unreadCount,
        hasUnread,
        preferences,
        isPollingEnabled,
        // Actions
        loadNotifications,
        loadMore,
        loadCounts,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        deleteNotification,
        loadPreferences,
        updatePreference,
        startPolling,
        stopPolling,
        handleNotificationClick,
    };
}