// ============================================
// Notification Module - Enums
// ============================================

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  INCIDENT_DECLARED = 'INCIDENT_DECLARED',
  TEST_SCHEDULED = 'TEST_SCHEDULED',
  POLICY_UPDATE = 'POLICY_UPDATE',
  RISK_ESCALATED = 'RISK_ESCALATED',
  TRAINING_REMINDER = 'TRAINING_REMINDER',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  WORKFLOW_UPDATE = 'WORKFLOW_UPDATE',
  WORKFLOW_ASSIGNED = 'WORKFLOW_ASSIGNED',
  WORKFLOW_APPROVED = 'WORKFLOW_APPROVED',
  WORKFLOW_REJECTED = 'WORKFLOW_REJECTED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
  RISK_IDENTIFIED = 'RISK_IDENTIFIED',
  COMPLIANCE_AUDIT_DUE = 'COMPLIANCE_AUDIT_DUE',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

import { QueryParams } from 'src/shared/types/common.types'
// ============================================
// Notification Module - Types
// ============================================

import type { BaseEntity } from './../../../core/base/base.entity';

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

export interface UserNotificationSettings extends BaseEntity {
  user_id: string
  settings: UserChannelSettings[]
  quiet_hours_start?: string
  quiet_hours_end?: string
  timezone: string
}

export interface UserChannelSettings {
  notification_type: string
  channels: {
    email: boolean
    push: boolean
    sms: boolean
    in_app: boolean
  }
}

export interface NotificationClickTracking {
  notification_id: string
  clicked_at: string
  user_id: string
  action_url: string
}

export interface NotificationSummary {
  total_sent: number
  total_read: number
  read_rate: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
  by_channel: Record<string, number>
  daily_stats: NotificationDailyStats[]
}

export interface NotificationDailyStats {
  date: string
  sent: number
  read: number
  clicked: number
}

export interface NotificationCounts {
  total: number
  unread: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
  high_priority_unread: number
}

// Request Types
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

export interface NotificationBatchRequest {
  recipients: string[]
  notification_type: string
  title: string
  message?: string
  priority?: string
  channel?: string[]
  action_data?: Record<string, any>
  scheduled_for?: string
}

export interface NotificationBatchResult {
  total: number
  successful: number
  failed: number
  errors: Array<{ recipient: string; error: string }>
}

export interface NotificationQueryParams extends QueryParams {
  notification_type?: string
  priority?: string
  status?: string
  unread_only?: boolean
  entity_type?: string
  entity_id?: string
  created_after?: string
  created_before?: string
  scheduled_only?: boolean
}
