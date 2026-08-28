// ============================================
// Dashboard Module - Enums
// ============================================

export enum WidgetType {
  KPI = 'KPI',
  CHART = 'CHART',
  TABLE = 'TABLE',
  LIST = 'LIST',
  CARD = 'CARD',
}

export enum DashboardRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

import { QueryParams } from 'src/shared/types/common.types'

// ============================================
// Dashboard Module - Types (camelCase)
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  config: Record<string, any>
  position: { x: number; y: number; w: number; h: number }
  dataSource: string
  refreshInterval?: number
  isVisible?: boolean
}

export interface DashboardConfig extends BaseEntity {
  organisationId: string
  userId?: string
  role: DashboardRole
  name?: string
  description?: string
  widgets: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
  isActive: boolean
}

export interface DashboardKPIs {
  activeBCPs: number
  activeIncidents: number
  highRisks: number
  pendingApprovals: number
  complianceRate: number
  maturityScore: number
}

export interface ComplianceOverview {
  standard: string
  compliant: number
  partially: number
  nonCompliant: number
  total: number
  complianceRate: number
  lastAuditDate?: string
  nextAuditDue?: string
}

export interface RiskTrend {
  period: string
  label: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
}

export interface IncidentTrend {
  period: string
  label: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
  avgResolutionTime: number
}

export interface DashboardQueryParams extends QueryParams {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  organisationId?: string
  startDate?: string
  endDate?: string
}

export interface DashboardData {
  kpis: DashboardKPIs
  recentIncidents: DashboardIncident[]
  upcomingTests: DashboardTest[]
  pendingWorkflows: DashboardWorkflow[]
  complianceOverview: ComplianceOverview[]
  riskTrends: RiskTrend[]
  incidentTrends: IncidentTrend[]
  recentActivity: RecentActivity[]
  upcomingTasks: UpcomingTask[]
}

export interface DashboardIncident {
  uuid: string
  incidentSeverity: string
  rootCause: string
  declaredAt: string
  closedAt?: string
  organisation?: { uuid: string; name: string }
}

export interface DashboardTest {
  uuid: string
  exerciseTestType: string
  date: string
  passed: boolean
  businessContinuityPlan?: {
    uuid: string
    criticalFunction?: { name: string }
  }
}

export interface DashboardWorkflow {
  uuid: string
  workflowType: string
  workflowState: string
  priority: number
  title: string
  dueDate?: string
  assignedTo?: string
}

export interface RecentActivity {
  id: string
  type: string
  action: string
  description: string
  user: {
    uuid: string
    email: string
  }
  timestamp: string
  entityType: string
  entityId: string
}

export interface UpcomingTask {
  id: string
  title: string
  type: string
  dueDate: string
  priority: string
  status: string
  assignedTo?: string
}

export interface MaturityProgress {
  overall: number
  domains: MaturityDomain[]
  target: number
  progress: number
  lastAssessment?: string
}

export interface MaturityDomain {
  name: string
  score: number
  target: number
  gap: number
  recommendations: string[]
}

export interface CreateDashboardConfigRequest {
  organisationId: string
  userId?: string
  role: DashboardRole
  name?: string
  description?: string
  widgets: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
}

export interface UpdateDashboardConfigRequest {
  name?: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
  isActive?: boolean
}