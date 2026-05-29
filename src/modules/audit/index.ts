// ============================================
// Audit Module - Enums
// ============================================

import { QueryParams } from "src/shared/types/common.types"
import { BaseEntity } from "../../core/base/base.entity"
import { Organisation } from "../organisation"
import { User } from "../user"

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SYNC = 'SYNC',
  CONFLICT_RESOLVE = 'CONFLICT_RESOLVE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
  BULK_CREATE = 'BULK_CREATE',
  BULK_UPDATE = 'BULK_UPDATE',
  BULK_DELETE = 'BULK_DELETE',
}

export enum AuditCategory {
  USER_ACTIVITY = 'USER_ACTIVITY',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  SECURITY = 'SECURITY',
  DATA_CHANGE = 'DATA_CHANGE',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  WORKFLOW = 'WORKFLOW',
  COMPLIANCE = 'COMPLIANCE',
  SYNC = 'SYNC',
  CONFIGURATION = 'CONFIGURATION',
  PERFORMANCE = 'PERFORMANCE',
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  BUSINESS_CONTINUITY = 'BUSINESS_CONTINUITY',
  RISK_MANAGEMENT = 'RISK_MANAGEMENT',
  BCM_OPERATION = 'BCM_OPERATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// ============================================
// Audit Module - Types
// ============================================

export interface AuditLog extends BaseEntity {
  user_id: string
  organisation_id?: string
  action: AuditAction
  audit_category: AuditCategory
  severity: AuditSeverity
  entity_type: string
  entity_id: string
  description: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  request_method?: string
  request_path?: string
  response_status?: number
  execution_time_ms?: number
  is_sensitive: boolean
  user_email?: string
  organisation_name?: string
  user?: User
  organisation?: Organisation
}

export interface AuditRetentionPolicy extends BaseEntity {
  organisation_id: string
  audit_category: AuditCategory
  retention_days: number
  is_active: boolean
}

export interface AuditStats {
  total_logs: number
  logs_today: number
  logs_this_week: number
  logs_this_month: number
  by_action: Record<string, number>
  by_category: Record<string, number>
  by_severity: Record<string, number>
  by_entity_type: Record<string, number>
  average_execution_time: number
}

export interface AuditSummary {
  total_logs: number
  logs_today: number
  logs_this_week: number
  logs_this_month: number
  by_action: Record<string, number>
  by_category: Record<string, number>
  by_severity: Record<string, number>
  by_entity_type: Record<string, number>
  average_execution_time: number
  sensitive_logs_count: number
}

export interface AuditCleanupResult {
  deleted_count: number
  archived_count: number
  freed_space_bytes: number
  retention_applied: number
  errors: string[]
}

export interface AuditExportOptions {
  format: 'CSV' | 'JSON' | 'PDF'
  date_range?: { start: string; end: string }
  categories?: string[]
  actions?: string[]
  users?: string[]
  include_sensitive?: boolean
  include_metadata?: boolean
}

export interface AuditReplayRequest {
  log_ids: string[]
  target_environment: 'STAGING' | 'DEVELOPMENT' | 'TESTING'
}

export interface AuditReplayResult {
  total: number
  successful: number
  failed: number
  results: Array<{
    log_id: string
    success: boolean
    error?: string
    replayed_at: string
  }>
}

export interface AuditAnomalyDetection {
  period: string
  anomalies: AuditAnomaly[]
  summary: {
    total_anomalies: number
    high_risk_count: number
    medium_risk_count: number
    low_risk_count: number
  }
}

export interface AuditAnomaly {
  id: string
  type: 'UNUSUAL_PATTERN' | 'EXCESSIVE_ACTIONS' | 'SUSPICIOUS_TIMING' | 'UNAUTHORIZED_ACCESS'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affected_user?: string
  affected_entity?: string
  detected_at: string
  related_logs: string[]
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'
}

// Request/Query Types
export interface CreateAuditLogRequest {
  action: AuditAction
  audit_category: AuditCategory
  severity?: AuditSeverity
  entity_type: string
  entity_id: string
  description: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  request_method?: string
  request_path?: string
  response_status?: number
  execution_time_ms?: number
  is_sensitive?: boolean
}

export interface GetAuditLogsParams {
  page?: number
  limit?: number
  search?: string
  user_id?: string
  organisation_id?: string
  action?: AuditAction
  audit_category?: AuditCategory
  severity?: AuditSeverity
  entity_type?: string
  entity_id?: string
  start_date?: string
  end_date?: string
}

export interface AuditQueryParams extends QueryParams {
  user_id?: string
  organisation_id?: string
  action?: string
  audit_category?: string
  severity?: string
  entity_type?: string
  entity_id?: string
  start_date?: string
  end_date?: string
  search?: string
  sensitive_only?: boolean
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}

export interface AuditRetentionPolicyRequest {
  organisation_id: string
  audit_category: string
  retention_days: number
  is_active?: boolean
}

export interface ExportAuditRequest {
  audit_category?: string
  start_date?: string
  end_date?: string
  format?: 'csv' | 'json'
}
