// ============================================
// Dashboard Module - Enums (Aligned with Backend)
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
// Dashboard Module - Types (camelCase - Aligned with Backend DTOs)
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

/**
 * Dashboard Widget - Matches backend DashboardWidgetDto
 */
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

/**
 * Dashboard Config - Matches backend DashboardConfig entity
 */
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
  businessUnitId?: string
  departmentId?: string
  isPersonal?: boolean
  widgetCount?: number
}

/**
 * Dashboard KPIs - Matches backend DashboardKPIsDto
 */
export interface DashboardKPIs {
  activeBCPs: number
  activeIncidents: number
  highRisks: number
  pendingApprovals: number
  complianceRate: number
  maturityScore: number
}

/**
 * Compliance Overview - Matches backend ComplianceOverviewDto
 */
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

/**
 * Risk Trend - Matches backend RiskTrendDto
 */
export interface RiskTrend {
  period: string
  label: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
}

/**
 * Incident Trend - Matches backend IncidentTrend
 */
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

/**
 * Dashboard Query Params - Matches backend DashboardQueryParams
 */
export interface DashboardQueryParams extends QueryParams {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  organisationId?: string
  startDate?: string
  endDate?: string
}

/**
 * Dashboard Data - Matches backend getCompleteDashboard response
 */
export interface DashboardData {
  kpis: DashboardKPIs
  riskSummary: {
    totalRisks: number
    criticalRisks: number
    highRisks: number
    mediumRisks: number
    lowRisks: number
    riskTrends: RiskTrend[]
    topRiskCategories: Array<{ category: string; count: number; percentage: number }>
  }
  bcmSummary: {
    totalBcpPlans: number
    activePlans: number
    draftPlans: number
    archivedPlans: number
    plansDueForReview: number
    maturityScore: number
    maturityLevel: string
    maturityProgress: MaturityProgress
    recoveryStrategiesCount: number
    exerciseTestsCompleted: number
    exerciseTestsPending: number
  }
  incidentSummary: {
    totalIncidents: number
    activeIncidents: number
    resolvedIncidents: number
    closedIncidents: number
    criticalIncidents: number
    highIncidents: number
    mediumIncidents: number
    lowIncidents: number
    incidentTrends: IncidentTrend[]
    averageResolutionTimeHours: number
  }
  complianceSummary: {
    overallComplianceRate: number
    compliantCount: number
    partiallyCompliantCount: number
    nonCompliantCount: number
    overdueAudits: number
    upcomingAudits: number
    complianceByStandard: ComplianceOverview[]
  }
  workflowSummary: {
    totalWorkflows: number
    pendingApprovals: number
    inReview: number
    completed: number
    rejected: number
    overdue: number
    averageCompletionDays: number
    recentWorkflows: DashboardWorkflow[]
  }
  recentActivity: {
    activities: RecentActivity[]
  }
  upcomingTasks: {
    tasks: UpcomingTask[]
  }
}

/**
 * Dashboard Incident
 */
export interface DashboardIncident {
  uuid: string
  incidentSeverity: string
  rootCause: string
  declaredAt: string
  closedAt?: string
  organisation?: { uuid: string; name: string }
}

/**
 * Dashboard Test
 */
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

/**
 * Dashboard Workflow - Matches backend DashboardWorkflow
 */
export interface DashboardWorkflow {
  uuid: string
  workflowType: string
  workflowState: string
  priority: number
  title: string
  dueDate?: string
  assignedTo?: string
}

/**
 * Recent Activity - Matches backend RecentActivityDto
 */
export interface RecentActivity {
  id: string
  action: string
  user: string
  entityType: string
  entityName: string
  timestamp: string
  icon?: string
  color?: string
}

/**
 * Upcoming Task - Matches backend UpcomingTaskDto
 */
export interface UpcomingTask {
  id: string
  title: string
  type: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: string
  daysRemaining: number
  assignedTo?: string
}

/**
 * Maturity Progress
 */
export interface MaturityProgress {
  overall: number
  domains: MaturityDomain[]
  target: number
  progress: number
  lastAssessment?: string
}

/**
 * Maturity Domain
 */
export interface MaturityDomain {
  name: string
  score: number
  target: number
  gap: number
  recommendations: string[]
}

/**
 * Create Dashboard Config Request - Matches backend CreateDashboardConfigDto
 */
export interface CreateDashboardConfigRequest {
  organisationId: string
  userId?: string
  role?: DashboardRole
  name?: string
  description?: string
  widgets: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
}

/**
 * Update Dashboard Config Request - Matches backend UpdateDashboardConfigDto
 */
export interface UpdateDashboardConfigRequest {
  name?: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
  isActive?: boolean
}