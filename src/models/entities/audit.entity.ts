import { User } from '.'
import { AuditAction } from './bcm.entity'
import { SyncStatus } from './sync.entity'

/**
 * Audit Severity Enum
 */
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Audit Category Enum
 */
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
}

/**
 * Audit Log Entity
 */
export interface AuditLog {
  uuid: string
  user_id: string
  organisation_id?: string | null
  action: AuditAction
  audit_category: AuditCategory
  severity: AuditSeverity
  entity_type: string
  entity_id: string
  description: string
  old_value?: Record<string, any> | null
  new_value?: Record<string, any> | null
  metadata?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  session_id?: string | null
  request_method?: string | null
  request_path?: string | null
  response_status?: number | null
  execution_time_ms?: number | null
  is_sensitive: boolean
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  user?: User
}

/**
 * Audit Query Parameters
 */
export interface AuditQueryParams {
  user_id?: string
  organisation_id?: string
  action?: AuditAction
  audit_category?: AuditCategory
  severity?: AuditSeverity
  entity_type?: string
  entity_id?: string
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
  organisation_id: string
  audit_category: AuditCategory
  retention_days: number
  is_active: boolean
}
