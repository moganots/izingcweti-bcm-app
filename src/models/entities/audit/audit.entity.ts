import { BaseEntity } from 'src/core/base/base.entity'
import { User } from './../user/user.entity'
import { QueryParams } from 'src/shared/types/common.types'

export enum AuditAction {
  CREATE = "Create",
  UPDATE = "Update",
  DELETE = "Delete",
  APPROVE = "Approve",
  REJECT = "Reject",
  SYNC = "Sync",
  CONFLICT_RESOLVE = "ConflictResolve",
  VIEW = "View",
  LOGIN = "Login",
  EXPORT = "Export",
  LOGOUT = "Logout",
  SOFT_DELETE = "SoftDelete",
  RESTORE = "Restore",
  PERMANENT_DELETE = "PermanentDelete",
  BULK_CREATE = "BulkCreate",
  BULK_UPDATE = "BulkUpdate",
  BULK_DELETE = "BulkDelete",
}

export enum AuditSeverity {
  INFO = "Info",
  WARNING = "Warning",
  ERROR = "Error",
  CRITICAL = "Critical",
}

export enum AuditCategory {
  USER_ACTIVITY = "UserActivity",
  SYSTEM_EVENT = "SystemEvent",
  SECURITY = "Security",
  DATA_CHANGE = "DataChange",
  ACCESS_CONTROL = "AccessControl",
  WORKFLOW = "Workflow",
  COMPLIANCE = "Compliance",
  SYNC = "Sync",
  CONFIGURATION = "Configuration",
  PERFORMANCE = "Performance",
  SYSTEM_CONFIG = "SystemConfig",
  DOCUMENT_MANAGEMENT = "DocumentManagement",
  USER_MANAGEMENT = "UserManagement",
  BUSINESS_CONTINUITY = "BusinessContinuity",
  RISK_MANAGEMENT = "RiskManagement",
}

export enum AuditStatus {
  SUCCESS = "Success",
  FAILURE = "Failure",
  PENDING = "Pending",
  IN_PROGRESS = "InProgress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum AuditSource {
  API = "API",
  WEB = "Web",
  MOBILE = "Mobile",
  SYSTEM = "System",
  SCHEDULED_TASK = "ScheduledTask",
  MANUAL = "Manual",
  THIRD_PARTY = "ThirdParty",
}

/**
 * Audit Log Entity
 */
export interface AuditLog extends BaseEntity {
  userId: string
  organisationId?: string | null
  action: AuditAction
  auditCategory: AuditCategory
  severity: AuditSeverity
  entityType: string
  entityId: string
  description: string
  oldValue?: Record<string, any> | null
  newValue?: Record<string, any> | null
  metadata?: Record<string, any> | null
  ipAddress?: string | null
  user_agent?: string | null
  sessionId?: string | null
  requestMethod?: string | null
  requestPath?: string | null
  responseStatus?: number | null
  executionTimeMs?: number | null
  isSensitive: boolean
  user?: User
}

/**
 * Audit Query Parameters
 */
export interface AuditQueryParams extends QueryParams {
  userId?: string
  organisationId?: string
  action?: AuditAction
  audit_category?: AuditCategory
  severity?: AuditSeverity
  entity_type?: string
  entityId?: string
  start_date?: string
  end_date?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Audit Stats
 */
export interface AuditStats {
  total_logs: number
  by_action: Record<string, number>
  by_category: Record<string, number>
  by_severity: Record<string, number>
  by_entity_type: Record<string, number>
  logs_today: number
  logs_this_week: number
  logs_this_month: number
  average_execution_time: number
}

/**
 * Audit Retention Policy
 */
export interface AuditRetentionPolicy {
  uuid: string
  organisationId: string
  audit_category: AuditCategory
  retention_days: number
  is_active: boolean
}
