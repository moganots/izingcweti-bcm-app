import { BaseEntity } from '../../../core/base/base.entity'
import { IncidentSeverity, EscalationLevel, EscalationStatus } from '../enums/incident.enum'

export interface EscalationHistoryEntry {
  escalated_at: string
  escalated_by: string
  from_level: EscalationLevel
  to_level: EscalationLevel
  reason: string
  escalated_to: string
  notes?: string
}

export interface IncidentUpdate {
  update_text: string
  updated_by: string
  updated_at: string
  escalation_level?: EscalationLevel
  status?: string
}

export interface Incident extends BaseEntity {
  organisation_id: string
  declared_at: string
  closed_at?: string
  incident_severity: IncidentSeverity
  root_cause: string
  business_continuity_plan_id_activated: string
  recovery_actual_time: string
  resolution_notes?: string
  escalation_level: EscalationLevel
  escalation_status: EscalationStatus
  escalated_to?: string
  escalated_at?: string
  escalation_reason?: string
  escalation_history?: EscalationHistoryEntry[]
  assigned_to?: string
  assigned_at?: string
  incident_updates?: IncidentUpdate[]
  escalation_attempts: number
  acknowledged_at?: string
  acknowledged_by?: string
}

export interface CreateIncidentRequest {
  organisation_id: string
  incident_severity: IncidentSeverity
  root_cause: string
  business_continuity_plan_id_activated: string
  recovery_actual_time?: string
  assigned_to?: string
}

export interface UpdateIncidentRequest {
  root_cause?: string
  resolution_notes?: string
  incident_updates?: IncidentUpdate[]
}

export interface EscalateIncidentRequest {
  reason: string
  escalated_to: string
  notes?: string
}

export interface CloseIncidentRequest {
  resolution_notes: string
  closed_at?: string
}
