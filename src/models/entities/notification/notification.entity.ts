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
// Notification Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

import type { BaseEntity } from './../../../core/base/base.entity';

/**
 * Notification - Matches backend Notification entity
 */
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
  readAt?: Date | string;
  emailSent: boolean;
  smsSent: boolean;
  pushSent: boolean;
  scheduledFor?: Date | string;
  expiresAt?: Date | string;
  metadata?: any;
  readReceipts?: Array<{
    userId: string;
    readAt: Date;
    deviceId?: string;
  }>;
  isAcknowledged: boolean;
  acknowledgedAt?: Date | string;
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

/**
 * Notification Preference - Matches backend
 */
export interface NotificationPreference extends BaseEntity {
  userId: string;
  notificationType: NotificationType;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

/**
 * Notification Template - Matches backend
 */
export interface NotificationTemplate extends BaseEntity {
  organisationId: string;
  notificationType: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
}

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

export interface CreateNotificationRequest {
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
  scheduledFor?: Date | string;
  expiresAt?: Date | string;
  sendEmail?: boolean;
  sendSms?: boolean;
  sendPush?: boolean;
  metadata?: any;
  organisationId?: string;
}

export interface BulkCreateNotificationRequest {
  notifications: CreateNotificationRequest[];
}

export interface UpdateNotificationRequest {
  status?: NotificationStatus;
  isRead?: boolean;
}

export interface NotificationQueryParams {
  status?: NotificationStatus;
  notificationType?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  organisationId?: string;
  recipientId?: string;
}

export interface NotificationCountResponse {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

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

export function getNotificationTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    WORKFLOW_UPDATE: 'account_tree',
    WORKFLOW_ASSIGNED: 'assignment_ind',
    WORKFLOW_APPROVED: 'check_circle',
    WORKFLOW_REJECTED: 'cancel',
    WORKFLOW_ESCALATED: 'arrow_upward',
    DOCUMENT_APPROVED: 'description',
    DOCUMENT_REJECTED: 'cancel',
    DOCUMENT_EXPIRING: 'timer',
    INCIDENT_REPORTED: 'report',
    INCIDENT_RESOLVED: 'check',
    INCIDENT_ESCALATED: 'arrow_upward',
    RISK_ASSESSMENT_DUE: 'warning',
    RISK_THRESHOLD_EXCEEDED: 'error',
    BCP_REVIEW_DUE: 'event_available',
    BCP_APPROVED: 'check_circle',
    EXERCISE_SCHEDULED: 'playlist_add_check',
    EXERCISE_COMPLETED: 'done_all',
    COMPLIANCE_AUDIT_DUE: 'gavel',
    COMPLIANCE_NON_COMPLIANT: 'warning',
    TRAINING_ASSIGNED: 'school',
    TRAINING_COMPLETED: 'done',
    SYSTEM_ALERT: 'info',
    SYSTEM_MAINTENANCE: 'build',
    SYNC_CONFLICT: 'sync_problem',
    SYNC_COMPLETED: 'sync',
    CUSTOM: 'notifications',
  };
  return icons[type] || 'notifications';
}

export function getNotificationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    WORKFLOW_UPDATE: 'primary',
    WORKFLOW_ASSIGNED: 'blue',
    WORKFLOW_APPROVED: 'green',
    WORKFLOW_REJECTED: 'red',
    WORKFLOW_ESCALATED: 'deep-orange',
    DOCUMENT_APPROVED: 'green',
    DOCUMENT_REJECTED: 'red',
    DOCUMENT_EXPIRING: 'orange',
    INCIDENT_REPORTED: 'negative',
    INCIDENT_RESOLVED: 'green',
    INCIDENT_ESCALATED: 'deep-orange',
    RISK_ASSESSMENT_DUE: 'orange',
    RISK_THRESHOLD_EXCEEDED: 'negative',
    BCP_REVIEW_DUE: 'orange',
    BCP_APPROVED: 'green',
    EXERCISE_SCHEDULED: 'blue',
    EXERCISE_COMPLETED: 'green',
    COMPLIANCE_AUDIT_DUE: 'purple',
    COMPLIANCE_NON_COMPLIANT: 'negative',
    TRAINING_ASSIGNED: 'info',
    TRAINING_COMPLETED: 'green',
    SYSTEM_ALERT: 'grey',
    SYSTEM_MAINTENANCE: 'orange',
    SYNC_CONFLICT: 'deep-orange',
    SYNC_COMPLETED: 'green',
    CUSTOM: 'grey',
  };
  return colors[type] || 'grey';
}

export function getNotificationPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return labels[priority] || priority;
}

export function getNotificationPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'grey',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
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

// ============================================
// Additional Types
// ============================================

export interface UserNotificationSettings extends BaseEntity {
  userId: string;
  settings: UserChannelSettings[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
}

export interface UserChannelSettings {
  notificationType: string;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export interface NotificationClickTracking {
  notificationId: string;
  clickedAt: string | Date;
  userId: string;
  actionUrl: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  highPriorityUnread: number;
}

export interface UpdatePreferencesRequest {
  notificationType: NotificationType;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
}

export interface NotificationBatchRequest {
  recipients: string[];
  notificationType: string;
  title: string;
  message?: string;
  priority?: string;
  channel?: string[];
  actionData?: Record<string, any>;
  scheduledFor?: string;
}

export interface NotificationBatchResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ recipient: string; error: string }>;
}