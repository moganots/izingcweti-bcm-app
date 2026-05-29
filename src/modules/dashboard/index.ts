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

// ============================================
// Dashboard Module - Types
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
  organisation_id: string
  user_id?: string
  role: DashboardRole
  name?: string
  description?: string
  widgets: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
  is_active: boolean
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

export interface DashboardQueryParams {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  organisation_id?: string
  limit?: number
  start_date?: string
  end_date?: string
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
  incident_severity: string
  root_cause: string
  declared_at: string
  closed_at?: string
  organisation?: { uuid: string; name: string }
}

export interface DashboardTest {
  uuid: string
  exercise_test_type: string
  date: string
  passed: boolean
  business_continuity_plan?: {
    uuid: string
    critical_function?: { name: string }
  }
}

export interface DashboardWorkflow {
  uuid: string
  workflow_type: string
  workflow_state: string
  priority: number
  title: string
  due_date?: string
  assigned_to?: string
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
  entity_type: string
  entity_id: string
}

export interface UpcomingTask {
  id: string
  title: string
  type: string
  due_date: string
  priority: string
  status: string
  assigned_to?: string
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
  organisation_id: string
  user_id?: string
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
  is_active?: boolean
}
