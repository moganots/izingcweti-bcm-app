import { BaseEntity } from '../../../core/base/base.entity'
import { WidgetType, DashboardRole } from '../enums/dashboard.enum'

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
  widgets: DashboardWidget[]
  layout?: Record<string, any>
  preferences?: Record<string, any>
  is_active: boolean
  name?: string
  description?: string
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
