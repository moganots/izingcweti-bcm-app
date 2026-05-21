import { BusinessContinuityPlan } from './../bcm/bcm.entity'
import { Organisation } from './../organisation/organisation.entity'
import { SyncStatus } from './../sync/sync.entity'

/**
 * Incident Severity Enum
 */
export enum IncidentSeverity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFORMATIONAL = 'Informational',
}

/**
 * Incident Status Enum
 */
export enum IncidentStatus {
  REPORTED = 'Reported',
  INVESTIGATING = 'Investigating',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  ESCALATED = 'Escalated',
}

/**
 * Incident Entity
 */
export interface Incident {
  uuid: string
  organisation_id: string
  declared_at: string
  closed_at?: string | null
  incident_severity: IncidentSeverity
  root_cause: string
  business_continuity_plan_id_activated: string
  recovery_actual_time: string
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  organisation?: Organisation
  bcp?: BusinessContinuityPlan
}

/**
 * Create Incident DTO
 */
export interface CreateIncidentDTO {
  organisation_id: string
  incident_severity: IncidentSeverity
  root_cause: string
  business_continuity_plan_id_activated: string
  recovery_actual_time?: string
}

/**
 * Update Incident DTO
 */
export interface UpdateIncidentDTO {
  incident_severity?: IncidentSeverity
  root_cause?: string
  business_continuity_plan_id_activated?: string
  recovery_actual_time?: string
}

/**
 * Close Incident DTO
 */
export interface CloseIncidentDTO {
  closed_at: string
}

/**
 * Incident Stats
 */
export interface IncidentStats {
  total: number
  active: number
  closed: number
  critical: number
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  avgResolutionTime: number
  incidentsThisMonth: number
  incidentsThisWeek: number
  trend: number // Percentage change from previous period
}
