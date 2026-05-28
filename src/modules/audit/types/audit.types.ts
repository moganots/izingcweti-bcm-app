import { BaseEntity } from '../../../core/base/base.entity'
import { AuditAction, AuditCategory, AuditSeverity } from '../enums/audit.enum'
import { User } from '../../user/types/user.types'
import { Organisation } from '../../organisation/types/organisation.types'

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
