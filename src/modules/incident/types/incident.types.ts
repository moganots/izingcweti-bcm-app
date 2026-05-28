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

export interface IncidentResponsePlan {
  incident_id: string
  plan_id: string
  activated_at: string
  response_team: ResponseTeamMember[]
  actions: ResponseAction[]
  status: 'ACTIVATED' | 'DEACTIVATED' | 'COMPLETED'
  deactivated_at?: string
}

export interface ResponseTeamMember {
  user_id: string
  name: string
  role: string
  contact: string
  assigned_at: string
  responsibilities: string[]
}

export interface ResponseAction {
  id: string
  description: string
  assigned_to: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  started_at?: string
  completed_at?: string
  notes?: string
}

export interface IncidentRecoveryMetrics {
  incident_id: string
  declared_at: string
  resolved_at?: string
  recovery_time_minutes?: number
  rto_target_minutes: number
  rpo_target_minutes: number
  data_loss_minutes?: number
  met_rto: boolean
  met_rpo: boolean
  escalation_count: number
  total_updates: number
}

export interface IncidentReport {
  incident_id: string
  report_type: 'INITIAL' | 'FINAL' | 'LESSONS_LEARNED'
  generated_at: string
  generated_by: string
  content: string
  attachments: string[]
}

export interface IncidentTimeline {
  incident_id: string
  events: IncidentTimelineEvent[]
}

export interface IncidentTimelineEvent {
  id: string
  type: 'DECLARED' | 'UPDATED' | 'ESCALATED' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED'
  timestamp: string
  user: string
  description: string
  metadata?: Record<string, any>
}

export interface IncidentQueryParams {
  incident_severity?: string
  organisation_id?: string
  bcp_id?: string
  active_only?: boolean
  closed_only?: boolean
  declared_after?: string
  declared_before?: string
  closed_after?: string
  closed_before?: string
  root_cause_search?: string
  page?: number
  limit?: number
}

export interface IncidentDashboardStats {
  total: number
  active: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  average_resolution_hours: number
  by_month: Array<{
    month: string
    count: number
  }>
}
