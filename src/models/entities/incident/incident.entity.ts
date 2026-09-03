import type { BaseEntity } from './../../../core/base/base.entity';
import type { Organisation } from '../organisation/organisation.entity';
import type { BusinessContinuityPlan } from '../bcm/bcm.entity';
import { QueryParams } from 'src/shared/types/common.types'

// ============================================
// Incident Module - Enums (Aligned with Backend)
// ============================================

export enum EscalationLevel {
  NO_ESCALATION = "NoEscalation",
  LEVEL_1_SUPERVISOR = "Level1Supervisor",
  LEVEL_2_DEPARTMENT_HEAD = "Level2DepartmentHead",
  LEVEL_3_BUSINESS_UNIT_MANAGER = "Level3BusinessUnitManager",
  LEVEL_4_EXECUTIVE_DIRECTOR = "Level4ExecutiveDirector",
  LEVEL_5_BOARD = "Level5Board",
  CRITICAL = "Critical",
}

export enum EscalationStatus {
  NOT_ESCALATED = "NotEscalated",
  ESCALATED = "Escalated",
  ACKNOWLEDGED = "Acknowledged",
  IN_PROGRESS = "InProgress",
  RESOLVED = "Resolved",
  REJECTED = "Rejected",
  DECLINED = "Declined",
}

export enum IncidentCategory {
  TECHNICAL = "Technical",
  PROCESS = "Process",
  PEOPLE = "People",
  EXTERNAL = "External",
  ENVIRONMENTAL = "Environmental",
  CYBERSECURITY = "Cybersecurity",
  PHYSICAL = "Physical",
  COMPLIANCE = "Compliance",
}

export enum IncidentSeverity {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
  CATASTROPHIC = "Catastrophic",
  INFORMATIONAL = "Informational",
  UNKNOWN = 'Unknown',
}

export enum IncidentStatus {
  ACTIVE = 'Active',
  DETECTED = 'Detected',
  REPORTED = 'Reported',
  ASSESSING = 'Assessing',
  CLASSIFIED = 'Classified',
  ESCALATED = 'Escalated',
  RESPONDING = 'Responding',
  MITIGATING = 'Mitigating',
  STABILISED = 'Stabilised',
  RECOVERING = 'Recovering',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  REOPENED = 'Reopened',
  MONITORING = 'Monitoring',
  UNDER_INVESTIGATION = 'UnderInvestigation',
  AWAITING_APPROVAL = 'AwaitingApproval',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  DUPLICATE = 'Duplicate',
  OPEN = "Open",
  IN_PROGRESS = "InProgress",
  MITIGATED = "Mitigated",
}

export enum ReopenReason {
  NEW_EVIDENCE = "NewEvidence",
  INCORRECT_RESOLUTION = "IncorrectResolution",
  RELATED_INCIDENT = "RelatedIncident",
  ONGOING_IMPACT = "OngoingImpact",
  CUSTOMER_REQUEST = "CustomerRequest",
  REGULATORY_REQUIREMENT = "RegulatoryRequirement",
  AUDIT_FINDING = "AuditFinding",
  ROOT_CAUSE_NOT_ADDRESSED = "RootCauseNotAddressed",
  PREMATURE_CLOSURE = "PrematureClosure",
  SYSTEM_REOPENED = "SystemReopened",
  ADMIN_OVERRIDE = "AdminOverride",
  OTHER = "Other",
}

// ============================================
// Incident Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

export interface EscalationHistoryEntry {
  escalatedAt: string | Date
  escalatedBy: string
  fromLevel: EscalationLevel
  toLevel: EscalationLevel
  reason: string
  escalatedTo: string
  notes?: string
}

export interface IncidentUpdate {
  updateText: string
  updatedBy: string
  updatedAt: string | Date
  escalationLevel?: EscalationLevel
  status?: string
  severity?: IncidentSeverity
}

/**
 * Incident - Matches backend Incident entity
 */
export interface Incident extends BaseEntity {
  organisationId: string
  incidentTitle: string
  declaredAt: string | Date
  declaredBy?: string
  closedAt?: string | Date | null
  closedBy?: string
  incidentSeverity: IncidentSeverity
  incidentStatus: IncidentStatus
  rootCause: string
  businessContinuityPlanIdActivated: string
  recoveryActualTime: string
  resolutionNotes?: string
  escalationLevel: EscalationLevel
  escalationStatus: EscalationStatus
  escalatedTo?: string
  escalatedAt?: string | Date
  escalatedBy?: string
  escalationReason?: string
  escalationHistory?: EscalationHistoryEntry[]
  assignedTo?: string
  assignedAt?: string | Date
  assignedBy?: string
  incidentUpdates?: IncidentUpdate[]
  escalationAttempts: number
  acknowledgedAt?: string | Date
  acknowledgedBy?: string
  impactAnalysis?: ImpactAnalysis
  organisation?: Organisation
  businessContinuityPlan?: BusinessContinuityPlan
  declarer?: { uuid: string; email: string }
  closer?: { uuid: string; email: string }
  assignee?: { uuid: string; email: string }
  escalator?: { uuid: string; email: string }
}

export interface ImpactAnalysis {
  financialImpact: number
  operationalImpact: string
  reputationalImpact: string
  regulatoryImpact: string
  affectedCustomers: number
  affectedEmployees: number
  downtimeMinutes: number
}

export interface IncidentResponsePlan {
  incidentId: string
  planId: string
  activatedAt: string | Date
  responseTeam: ResponseTeamMember[]
  actions: ResponseAction[]
  status: 'ACTIVATED' | 'DEACTIVATED' | 'COMPLETED'
  deactivatedAt?: string | Date
}

export interface ResponseTeamMember {
  userId: string
  name: string
  role: string
  contact: string
  assignedAt: string | Date
  responsibilities: string[]
}

export interface ResponseAction {
  id: string
  description: string
  assignedTo: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  startedAt?: string | Date
  completedAt?: string | Date
  notes?: string
}

export interface IncidentRecoveryMetrics {
  incidentId: string
  declaredAt: string | Date
  resolvedAt?: string | Date
  recoveryTimeMinutes?: number
  rtoTargetMinutes: number
  rpoTargetMinutes: number
  dataLossMinutes?: number
  metRto: boolean
  metRpo: boolean
  escalationCount: number
  totalUpdates: number
}

export interface IncidentReport {
  incidentId: string
  reportType: 'INITIAL' | 'FINAL' | 'LESSONS_LEARNED'
  generatedAt: string | Date
  generatedBy: string
  content: string
  attachments: string[]
}

export interface IncidentTimeline {
  incidentId: string
  events: IncidentTimelineEvent[]
}

export interface IncidentTimelineEvent {
  id: string
  type: 'DECLARED' | 'UPDATED' | 'ESCALATED' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED'
  timestamp: string | Date
  user: string
  description: string
  metadata?: Record<string, any>
}

export interface IncidentDashboardStats {
  total: number
  active: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  averageResolutionHours: number
  byMonth: Array<{ month: string; count: number }>
}

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

export interface CreateIncidentRequest {
  organisationId: string
  incidentSeverity: IncidentSeverity
  rootCause: string
  businessContinuityPlanIdActivated: string
  recoveryActualTime?: string
  assignedTo?: string
  incidentTitle: string
  declaredBy?: string
}

export interface UpdateIncidentRequest {
  incidentSeverity?: IncidentSeverity
  rootCause?: string
  businessContinuityPlanIdActivated?: string
  recoveryActualTime?: string
  resolutionNotes?: string
  incidentStatus?: IncidentStatus
}

export interface CloseIncidentRequest {
  resolutionNotes: string
  closedAt?: string | Date
  closedBy?: string
}

export interface EscalateIncidentRequest {
  escalationLevel: EscalationLevel
  escalatedTo: string
  reason: string
  notes?: string
}

export interface AssignIncidentRequest {
  assignedTo: string
  assignedBy: string
}

export interface AcknowledgeIncidentRequest {
  acknowledgedBy: string
}

export interface AddIncidentUpdateRequest {
  updateText: string
}

export interface IncidentQueryParams extends QueryParams {
  organisationId?: string
  incidentSeverity?: IncidentSeverity
  incidentStatus?: IncidentStatus
  bcpId?: string
  activeOnly?: boolean
  closedOnly?: boolean
  declaredAfter?: string | Date
  declaredBefore?: string | Date
  closedAfter?: string | Date
  closedBefore?: string | Date
  rootCauseSearch?: string
  businessContinuityPlanIdActivated?: string
  assignedTo?: string
  escalatedTo?: string
  search?: string
}

export interface IncidentStats {
  total: number
  active: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  avgResolutionTime: number
  incidentsThisMonth: number
  incidentsThisWeek: number
  trend: number
}

// ============================================
// Helper Functions
// ============================================

export function getIncidentSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    INFORMATIONAL: 'Informational',
  }
  return labels[severity] || severity
}

export function getIncidentSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'negative',
    HIGH: 'warning',
    MEDIUM: 'orange',
    LOW: 'positive',
    INFORMATIONAL: 'info',
  }
  return colors[severity] || 'grey'
}

export function getIncidentSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    CRITICAL: 'error',
    HIGH: 'warning',
    MEDIUM: 'info',
    LOW: 'check_circle',
    INFORMATIONAL: 'info',
  }
  return icons[severity] || 'help'
}

export function getIncidentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: 'Open',
    INVESTIGATING: 'Investigating',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    ESCALATED: 'Escalated',
  }
  return labels[status] || status
}

export function getIncidentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'warning',
    INVESTIGATING: 'info',
    RESOLVED: 'positive',
    CLOSED: 'grey',
    ESCALATED: 'negative',
  }
  return colors[status] || 'grey'
}

export function getEscalationLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    NO_ESCALATION: 'No Escalation',
    LEVEL_1_SUPERVISOR: 'Level 1 - Supervisor',
    LEVEL_2_DEPARTMENT_HEAD: 'Level 2 - Department Head',
    LEVEL_3_BUSINESS_UNIT_MANAGER: 'Level 3 - Business Unit Manager',
    LEVEL_4_EXECUTIVE_DIRECTOR: 'Level 4 - Executive Director',
    LEVEL_5_BOARD: 'Level 5 - Board',
    CRITICAL: 'Critical Escalation',
  }
  return labels[level] || level
}

export function getEscalationLevelColor(level: string): string {
  const colors: Record<string, string> = {
    NO_ESCALATION: 'grey',
    LEVEL_1_SUPERVISOR: 'info',
    LEVEL_2_DEPARTMENT_HEAD: 'primary',
    LEVEL_3_BUSINESS_UNIT_MANAGER: 'warning',
    LEVEL_4_EXECUTIVE_DIRECTOR: 'orange',
    LEVEL_5_BOARD: 'negative',
    CRITICAL: 'negative',
  }
  return colors[level] || 'grey'
}

export function calculateResolutionTime(declaredAt: string | Date, closedAt?: string | Date | null): number | null {
  if (!closedAt) return null
  const declared = new Date(declaredAt)
  const closed = new Date(closedAt)
  const diffMs = closed.getTime() - declared.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // Hours
}