// ============================================================
//  Notification Components - Barrel Export
//  All notification management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as NotificationCenter } from './NotificationCenter.vue'
export { default as NotificationList } from './NotificationList.vue'
export { default as NotificationItem } from './NotificationItem.vue'

// ----- Status & Badges -----
export { default as NotificationBadge } from './NotificationBadge.vue'

// ----- Preferences -----
export { default as NotificationPreferences } from './NotificationPreferences.vue'

// ----- Toast -----
export { default as NotificationToast } from './NotificationToast.vue'

// ============================================================
//  Composables
//  Export shared notification composable
// ============================================================

export { useNotifications } from './../../composables/useNotifications'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for notification components
//  Aligned with notification.entity.ts
// ============================================================

export type {
  // Core Notification Entity
  Notification,
  NotificationPreference,
  NotificationTemplate,
  
  // Request/Response DTOs
  CreateNotificationRequest,
  BulkCreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationQueryParams,
  NotificationCountResponse,
  NotificationStats,
  NotificationSummary,
  NotificationDailyStats,
  TemplateStats,
  
  // Additional Types
  NotificationCounts,
  UserNotificationSettings,
  UserChannelSettings,
  NotificationClickTracking,
  UpdatePreferencesRequest,
  NotificationBatchRequest,
  NotificationBatchResult,
} from './../../models/entities/notification/notification.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for notification
//  Aligned with notification.entity.ts
// ============================================================

export {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  getNotificationTypeLabel,
  getNotificationTypeIcon,
  getNotificationTypeColor,
  getNotificationPriorityLabel,
  getNotificationPriorityColor,
  getNotificationStatusLabel,
  getNotificationStatusColor,
} from './../../models/entities/notification/notification.entity'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import NotificationCenter from './NotificationCenter.vue'
import NotificationList from './NotificationList.vue'
import NotificationItem from './NotificationItem.vue'
import NotificationBadge from './NotificationBadge.vue'
import NotificationPreferences from './NotificationPreferences.vue'
import NotificationToast from './NotificationToast.vue'

export default {
  install(app: App) {
    app.component('NotificationCenter', NotificationCenter)
    app.component('NotificationList', NotificationList)
    app.component('NotificationItem', NotificationItem)
    app.component('NotificationBadge', NotificationBadge)
    app.component('NotificationPreferences', NotificationPreferences)
    app.component('NotificationToast', NotificationToast)
  },
} as Plugin