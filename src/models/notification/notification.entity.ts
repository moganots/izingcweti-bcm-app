import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation, BusinessUnit, Department } from "../organisation/organisation.entity";
import type { User } from "../user/user.entity";

// ============================================
// Notification Module - Enums (Aligned with Backend)
// ============================================

export enum AlertSeverity {
  INFO = "Info",
  WARNING = "Warning",
  ERROR = "Error",
  CRITICAL = "Critical",
}

export enum NotificationChannel {
  EMAIL = "Email",
  SMS = "Sms",
  IN_APP = "InApp",
  DASHBOARD = "Dashboard",
  PUSH = "Push",
}

export enum LogLevel {
  TRACE = "Trace",
  DEBUG = "Debug",
  INFO = "Info",
  WARN = "Warn",
  ERROR = "Error",
  FATAL = "Fatal",
}

export enum NotificationType {
  WORKFLOW_UPDATE = "WorkflowUpdate",
  WORKFLOW_ASSIGNED = "WorkflowAssigned",
  WORKFLOW_APPROVED = "WorkflowApproved",
  WORKFLOW_REJECTED = "WorkflowRejected",
  WORKFLOW_ESCALATED = "WorkflowEscalated",
  DOCUMENT_APPROVED = "DocumentApproved",
  DOCUMENT_REJECTED = "DocumentRejected",
  DOCUMENT_EXPIRING = "DocumentExpiring",
  INCIDENT_REPORTED = "IncidentReported",
  INCIDENT_RESOLVED = "IncidentResolved",
  INCIDENT_ESCALATED = "IncidentEscalated",
  RISK_ASSESSMENT_DUE = "RiskAssessmentDue",
  RISK_THRESHOLD_EXCEEDED = "RiskThresholdExceeded",
  BCP_REVIEW_DUE = "BcpReviewDue",
  BCP_APPROVED = "BcpApproved",
  EXERCISE_SCHEDULED = "ExerciseScheduled",
  EXERCISE_COMPLETED = "ExerciseCompleted",
  COMPLIANCE_AUDIT_DUE = "ComplianceAuditDue",
  COMPLIANCE_NON_COMPLIANT = "ComplianceNonCompliant",
  TRAINING_ASSIGNED = "TrainingAssigned",
  TRAINING_COMPLETED = "TrainingCompleted",
  SYSTEM_ALERT = "SystemAlert",
  SYSTEM_MAINTENANCE = "SystemMaintenance",
  SYNC_CONFLICT = "SyncConflict",
  SYNC_COMPLETED = "SyncCompleted",
  CUSTOM = "Custom",
  BCM_ALERT = "BcmAlert",
  TASK_ASSIGNMENT = "TaskAssignment",
  COMPLIANCE_REMINDER = "ComplianceReminder",
  RISK_ESCALATION = "RiskEscalation",
  DOCUMENT_APPROVAL = "DocumentApproval",
  TEST_SCHEDULED = "TestScheduled",
  RISK_IDENTIFIED = "RiskIdentified",
  COMPLIANCE_ALERT = "ComplianceAlert",
}

export enum NotificationPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent",
  CRITICAL = "Critical",
}

export enum NotificationStatus {
  UNREAD = "Unread",
  READ = "Read",
  ARCHIVED = "Archived",
  DISMISSED = "Dismissed",
}

// ============================================
// Notification Entity - Aligned with Backend
// Backend: src/modules/notification/models/entities/notification.entity.ts
// ============================================

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

  // Relationships
  organisation?: Organisation;
  businessUnit?: BusinessUnit;
  department?: Department;
  recipient?: User;
  sender?: User;
}

/**
 * Notification Preference Entity
 * Backend: src/modules/notification/models/entities/notification.entity.ts
 */
export interface NotificationPreference extends BaseEntity {
  userId: string;
  notificationType: NotificationType;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;

  // Relationships
  user?: User;
}

/**
 * Notification Template Entity
 * Backend: src/modules/notification/models/entities/notification.entity.ts
 */
export interface NotificationTemplate extends BaseEntity {
  organisationId: string;
  notificationType: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;

  // Relationships
  organisation?: Organisation;
}

// ============================================
// Notification Count / Stats Types
// Backend: src/modules/notification/dto/notification-count-response.dto.ts
// ============================================

/**
 * Response from GET /notifications/counts
 * Provides aggregated counts of notifications for the current user
 */
export interface NotificationCountResponse {
  /** Total number of notifications */
  total: number;

  /** Number of unread notifications */
  unread: number;

  /** Number of read notifications */
  read: number;

  /** Number of archived notifications */
  archived: number;

  /** Number of dismissed notifications */
  dismissed: number;

  /** Breakdown of unread notifications by priority */
  unreadByPriority?: Record<string, number>;

  /** Breakdown of unread notifications by type */
  unreadByType?: Record<string, number>;

  /** Number of high-priority unread notifications */
  highPriorityUnread?: number;

  /** Number of urgent/critical notifications */
  urgentCount?: number;

  /** Timestamp of the count calculation */
  calculatedAt?: string;
}

/**
 * Notification statistics for admin/organisation dashboards
 */
export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  averageDeliveryTimeMs: number;
}

// ============================================
// Notification Request DTOs
// ============================================

export interface CreateNotificationRequest {
  recipientId: string;
  notificationType: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message?: string;
  channel?: NotificationChannel;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface BulkNotificationRequest {
  recipientIds: string[];
  notificationType: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message?: string;
  channel?: NotificationChannel;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilterParams {
  status?: NotificationStatus;
  priority?: NotificationPriority;
  notificationType?: NotificationType;
  isRead?: boolean;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// ============================================
// Helper Functions
// ============================================

export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    WORKFLOW_UPDATE: 'Workflow Update',
    WORKFLOW_ASSIGNED: 'Workflow Assigned',
    WORKFLOW_APPROVED: 'Workflow Approved',
    WORKFLOW_REJECTED: 'Workflow Rejected',
    WORKFLOW_ESCALATED: 'Workflow Escalated',
    DOCUMENT_APPROVED: 'Document Approved',
    DOCUMENT_REJECTED: 'Document Rejected',
    DOCUMENT_EXPIRING: 'Document Expiring',
    INCIDENT_REPORTED: 'Incident Reported',
    INCIDENT_RESOLVED: 'Incident Resolved',
    INCIDENT_ESCALATED: 'Incident Escalated',
    RISK_ASSESSMENT_DUE: 'Risk Assessment Due',
    RISK_THRESHOLD_EXCEEDED: 'Risk Threshold Exceeded',
    BCP_REVIEW_DUE: 'BCP Review Due',
    BCP_APPROVED: 'BCP Approved',
    EXERCISE_SCHEDULED: 'Exercise Scheduled',
    EXERCISE_COMPLETED: 'Exercise Completed',
    COMPLIANCE_AUDIT_DUE: 'Compliance Audit Due',
    COMPLIANCE_NON_COMPLIANT: 'Non-Compliant',
    TRAINING_ASSIGNED: 'Training Assigned',
    TRAINING_COMPLETED: 'Training Completed',
    SYSTEM_ALERT: 'System Alert',
    SYSTEM_MAINTENANCE: 'System Maintenance',
    SYNC_CONFLICT: 'Sync Conflict',
    SYNC_COMPLETED: 'Sync Completed',
    CUSTOM: 'Custom',
  };
  return labels[type] || type;
}

export function getNotificationPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
    CRITICAL: 'Critical',
  };
  return labels[priority] || priority;
}

export function getNotificationPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'grey',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
    CRITICAL: 'deep-orange',
  };
  return colors[priority] || 'grey';
}

export function getNotificationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    UNREAD: 'Unread',
    READ: 'Read',
    ARCHIVED: 'Archived',
    DISMISSED: 'Dismissed',
  };
  return labels[status] || status;
}

export function getNotificationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    UNREAD: 'primary',
    READ: 'grey',
    ARCHIVED: 'grey-7',
    DISMISSED: 'grey-5',
  };
  return colors[status] || 'grey';
}

export function getNotificationChannelIcon(channel: string): string {
  const icons: Record<string, string> = {
    EMAIL: 'email',
    SMS: 'sms',
    IN_APP: 'notifications',
    DASHBOARD: 'dashboard',
    PUSH: 'phone_android',
  };
  return icons[channel] || 'notifications';
}

// ============================================
// Type Guards
// ============================================

export function isUnread(notification: Notification): boolean {
  return !notification.isRead && notification.status === NotificationStatus.UNREAD;
}

export function isHighPriority(notification: Notification): boolean {
  return (
    notification.priority === NotificationPriority.HIGH ||
    notification.priority === NotificationPriority.URGENT ||
    notification.priority === NotificationPriority.CRITICAL
  );
}

export function isExpired(notification: Notification): boolean {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
}