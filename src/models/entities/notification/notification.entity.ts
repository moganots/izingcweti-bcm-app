import { User } from './../user/user.entity'
import { SyncStatus } from './../sync/sync.entity'

/**
 * Notification Type Enum
 */
export enum NotificationType {
  WORKFLOW_UPDATE = 'WORKFLOW_UPDATE',
  WORKFLOW_ASSIGNED = 'WORKFLOW_ASSIGNED',
  WORKFLOW_APPROVED = 'WORKFLOW_APPROVED',
  WORKFLOW_REJECTED = 'WORKFLOW_REJECTED',
  WORKFLOW_ESCALATED = 'WORKFLOW_ESCALATED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  DOCUMENT_EXPIRING = 'DOCUMENT_EXPIRING',
  INCIDENT_REPORTED = 'INCIDENT_REPORTED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
  INCIDENT_ESCALATED = 'INCIDENT_ESCALATED',
  RISK_ASSESSMENT_DUE = 'RISK_ASSESSMENT_DUE',
  RISK_THRESHOLD_EXCEEDED = 'RISK_THRESHOLD_EXCEEDED',
  BCP_REVIEW_DUE = 'BCP_REVIEW_DUE',
  BCP_APPROVED = 'BCP_APPROVED',
  EXERCISE_SCHEDULED = 'EXERCISE_SCHEDULED',
  EXERCISE_COMPLETED = 'EXERCISE_COMPLETED',
  COMPLIANCE_AUDIT_DUE = 'COMPLIANCE_AUDIT_DUE',
  COMPLIANCE_NON_COMPLIANT = 'COMPLIANCE_NON_COMPLIANT',
  TRAINING_ASSIGNED = 'TRAINING_ASSIGNED',
  TRAINING_COMPLETED = 'TRAINING_COMPLETED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  SYNC_COMPLETED = 'SYNC_COMPLETED',
  CUSTOM = 'CUSTOM',
}

/**
 * Notification Priority Enum
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Notification Status Enum
 */
export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  DISMISSED = 'DISMISSED',
}

/**
 * Notification Channel Enum
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in-app',
  DASHBOARD = 'dashboard',
}

/**
 * Notification Entity
 */
export interface Notification {
  uuid: string
  recipient_id: string
  sender_id?: string | null
  notification_type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message?: string | null
  channel: NotificationChannel
  action_data?: Record<string, any> | null
  action_url?: string | null
  entity_id?: string | null
  entity_type?: string | null
  is_read: boolean
  read_at?: string | null
  email_sent: boolean
  sms_sent: boolean
  push_sent: boolean
  scheduled_for?: string | null
  expires_at?: string | null
  metadata?: Record<string, any> | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  recipient?: User
  sender?: User
}

/**
 * Notification Preference Entity
 */
export interface NotificationPreference {
  uuid: string
  user_id: string
  notification_type: NotificationType
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
}

/**
 * Notification Counts
 */
export interface NotificationCounts {
  total: number
  unread: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

/**
 * Create Notification DTO
 */
export interface CreateNotificationDTO {
  recipient_id: string
  sender_id?: string
  notification_type: NotificationType
  priority?: NotificationPriority
  title: string
  message?: string
  channel?: NotificationChannel
  action_data?: Record<string, any>
  action_url?: string
  entity_id?: string
  entity_type?: string
  scheduled_for?: string
  expires_at?: string
}
