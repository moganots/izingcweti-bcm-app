import type { BaseEntity } from './../../../core/base/base.entity';

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

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  DISMISSED = 'DISMISSED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

export interface Notification extends BaseEntity {
  organisationId: string;
  businessUnitId?: string;
  departmentId?: string;
  recipientId: string;
  senderId?: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message?: string;
  channel: NotificationChannel;
  actionData?: any;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  readAt?: Date;
  emailSent: boolean;
  smsSent: boolean;
  pushSent: boolean;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: any;
  readReceipts?: Array<{
    userId: string;
    readAt: Date;
    deviceId?: string;
  }>;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  deliveryStatus?: {
    emailDelivered: boolean;
    emailDeliveredAt?: Date;
    smsDelivered: boolean;
    smsDeliveredAt?: Date;
    pushDelivered: boolean;
    pushDeliveredAt?: Date;
    inAppDelivered: boolean;
    inAppDeliveredAt?: Date;
  };
}

export interface NotificationPreference extends BaseEntity {
  userId: string;
  notificationType: NotificationType;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

export interface NotificationTemplate extends BaseEntity {
  organisationId: string;
  notificationType: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
}

// DTOs
export interface NotificationDto {
  uuid: string;
  recipientId: string;
  senderId?: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message?: string;
  channel: NotificationChannel;
  actionData?: any;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  readAt?: Date;
  emailSent: boolean;
  smsSent: boolean;
  pushSent: boolean;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: any;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt: Date;
  version: number;
  deletedBy?: string;
  deletedAt?: Date;
  syncStatus?: string;
}

export interface CreateNotificationDto {
  recipientId: string;
  senderId?: string;
  notificationType: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message?: string;
  channel?: NotificationChannel;
  actionData?: any;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  scheduledFor?: Date;
  expiresAt?: Date;
  sendEmail?: boolean;
  sendSms?: boolean;
  sendPush?: boolean;
  metadata?: any;
  organisationId?: string;
}

export interface BulkCreateNotificationDto {
  notifications: CreateNotificationDto[];
}

export type UpdateNotificationDto = {
  status?: NotificationStatus;
  isRead?: boolean;
};

export interface NotificationPreferenceDto {
  userId?: string;
  notificationType: NotificationType;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
}

export interface NotificationTemplateDto {
  notificationType: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  isActive?: boolean;
}

export interface NotificationQueryDto {
  status?: NotificationStatus;
  notificationType?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export interface NotificationCountDto {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

// Metrics
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface NotificationSummary {
  totalSent: number;
  totalRead: number;
  readRate: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byChannel: Record<string, number>;
  dailyStats: NotificationDailyStats[];
}

export interface NotificationDailyStats {
  date: string;
  sent: number;
  read: number;
  clicked: number;
}

export interface TemplateStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}