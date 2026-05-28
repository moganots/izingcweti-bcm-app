import { BaseEntity } from '../../../core/base/base.entity'
import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
} from '../enums/notification.enum'

export interface Notification extends BaseEntity {
  recipient_id: string
  sender_id?: string
  notification_type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message?: string
  channel: NotificationChannel
  action_data?: Record<string, any>
  action_url?: string
  entity_id?: string
  entity_type?: string
  is_read: boolean
  read_at?: string
  email_sent: boolean
  sms_sent: boolean
  push_sent: boolean
  scheduled_for?: string
  expires_at?: string
  metadata?: Record<string, any>
}

export interface NotificationPreference extends BaseEntity {
  user_id: string
  notification_type: NotificationType
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
}

export interface NotificationTemplate extends BaseEntity {
  notification_type: NotificationType
  title_template: string
  message_template: string
  is_active: boolean
}

export interface CreateNotificationRequest {
  recipient_id: string
  notification_type: NotificationType
  title: string
  message?: string
  priority?: NotificationPriority
  channel?: NotificationChannel
  action_data?: Record<string, any>
  action_url?: string
  entity_id?: string
  entity_type?: string
  scheduled_for?: string
}

export interface UpdatePreferencesRequest {
  notification_type: NotificationType
  email_enabled?: boolean
  sms_enabled?: boolean
  push_enabled?: boolean
  in_app_enabled?: boolean
}
