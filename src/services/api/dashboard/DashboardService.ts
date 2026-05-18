import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import { useAuthStore } from '../../../stores/auth/auth.store'
import type {
  DashboardKPIs,
  DashboardIncident,
  DashboardTest,
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
  MaturityProgress,
  IncidentTrend,
} from './../../../types'

/**
 * Dashboard Overview Response
 */
export interface DashboardOverview {
  kpis: DashboardKPIs
  recent_incidents: DashboardIncident[]
  upcoming_tests: DashboardTest[]
  pending_workflows: DashboardWorkflow[]
  compliance_overview: ComplianceOverview[]
}

/**
 * Risk Summary Response
 */
export interface RiskSummary {
  total_risks: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  risk_trends: RiskTrend[]
  top_risk_categories: Array<{ category: string; count: number; percentage: number }>
}

/**
 * BCM Summary Response
 */
export interface BcmSummary {
  total_bcp_plans: number
  active_plans: number
  draft_plans: number
  archived_plans: number
  plans_due_for_review: number
  maturity_score: number
  maturity_level: string
  maturity_progress: MaturityProgress
  recovery_strategies_count: number
  exercise_tests_completed: number
  exercise_tests_pending: number
}

/**
 * Incident Summary Response
 */
export interface IncidentSummary {
  total_incidents: number
  active_incidents: number
  resolved_incidents: number
  closed_incidents: number
  critical_incidents: number
  high_incidents: number
  medium_incidents: number
  low_incidents: number
  incident_trends: IncidentTrend[]
  average_resolution_time_hours: number
}

/**
 * Compliance Summary Response
 */
export interface ComplianceSummary {
  overall_compliance_rate: number
  compliant_count: number
  partially_compliant_count: number
  non_compliant_count: number
  overdue_audits: number
  upcoming_audits: number
  compliance_by_standard: ComplianceOverview[]
}

/**
 * Workflow Summary Response
 */
export interface WorkflowSummary {
  total_workflows: number
  pending_approvals: number
  in_review: number
  completed: number
  rejected: number
  overdue: number
  average_completion_days: number
  recent_workflows: DashboardWorkflow[]
}

/**
 * Recent Activity Response
 */
export interface RecentActivity {
  activities: Array<{
    id: string
    action: string
    user: string
    entity_type: string
    entity_name: string
    timestamp: string
    icon: string
    color: string
  }>
}

/**
 * Upcoming Tasks Response
 */
export interface UpcomingTasks {
  tasks: Array<{
    id: string
    title: string
    type: string
    due_date: string
    priority: 'high' | 'medium' | 'low'
    status: string
    days_remaining: number
  }>
}

/**
 * KPI Metrics Response
 */
export interface KpiMetrics {
  activeBCPs: number
  activeIncidents: number
  highRisks: number
  pendingApprovals: number
  complianceRate: number
  maturityScore: number
}

/**
 * Dashboard API Service
 */
export class DashboardService extends BaseService {
  /**
   * Get complete dashboard overview
   */
  async getOverview(organisationId?: string): Promise<DashboardOverview> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<DashboardOverview>(API_ENDPOINTS.DASHBOARD.OVERVIEW(orgId))
    return this.extractData(response)
  }

  /**
   * Get dashboard KPIs (simplified version)
   */
  async getKPIs(organisationId?: string): Promise<KpiMetrics> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<KpiMetrics>(API_ENDPOINTS.DASHBOARD.KPI_METRICS(orgId))
    return this.extractData(response)
  }

  /**
   * Get risk summary for dashboard
   */
  async getRiskSummary(organisationId?: string): Promise<RiskSummary> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<RiskSummary>(API_ENDPOINTS.DASHBOARD.RISK_SUMMARY(orgId))
    return this.extractData(response)
  }

  /**
   * Get BCM summary for dashboard
   */
  async getBcmSummary(organisationId?: string): Promise<BcmSummary> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<BcmSummary>(API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(orgId))
    return this.extractData(response)
  }

  /**
   * Get incident summary for dashboard
   */
  async getIncidentSummary(organisationId?: string): Promise<IncidentSummary> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<IncidentSummary>(
      API_ENDPOINTS.DASHBOARD.INCIDENT_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get compliance summary for dashboard
   */
  async getComplianceSummary(organisationId?: string): Promise<ComplianceSummary> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<ComplianceSummary>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get workflow summary for dashboard
   */
  async getWorkflowSummary(organisationId?: string): Promise<WorkflowSummary> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<WorkflowSummary>(
      API_ENDPOINTS.DASHBOARD.WORKFLOW_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get recent incidents for dashboard
   */
  async getRecentIncidents(
    limit: number = 5,
    organisationId?: string
  ): Promise<DashboardIncident[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<DashboardIncident[]>(
      `${API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(orgId)}?type=incident&limit=${limit}`
    )
    return this.extractData(response) || []
  }

  /**
   * Get upcoming tests for dashboard
   */
  async getUpcomingTests(limit: number = 5, organisationId?: string): Promise<DashboardTest[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<DashboardTest[]>(
      `${API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(orgId)}?type=test&limit=${limit}`
    )
    return this.extractData(response) || []
  }

  /**
   * Get pending workflows for dashboard
   */
  async getPendingWorkflows(
    limit: number = 5,
    organisationId?: string
  ): Promise<DashboardWorkflow[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const summary = await this.getWorkflowSummary(orgId)
    return (summary.recent_workflows || []).slice(0, limit)
  }

  /**
   * Get compliance overview
   */
  async getComplianceOverview(organisationId?: string): Promise<ComplianceOverview[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const summary = await this.getComplianceSummary(orgId)
    return summary.compliance_by_standard || []
  }

  /**
   * Get risk trends
   */
  async getRiskTrends(period: string = 'month', organisationId?: string): Promise<RiskTrend[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const summary = await this.getRiskSummary(orgId)
    return summary.risk_trends || []
  }

  /**
   * Get BCM maturity progress
   */
  async getMaturityProgress(organisationId?: string): Promise<MaturityProgress> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const summary = await this.getBcmSummary(orgId)
    return summary.maturity_progress || { overall: 0, domains: [], target: 0, progress: 0 }
  }

  /**
   * Get incident trends
   */
  async getIncidentTrends(
    period: string = 'month',
    organisationId?: string
  ): Promise<IncidentTrend[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const summary = await this.getIncidentSummary(orgId)
    return summary.incident_trends || []
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit: number = 10, organisationId?: string): Promise<RecentActivity> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<RecentActivity>(
      `${API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(orgId)}?limit=${limit}`
    )
    return this.extractData(response)
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(limit: number = 10, organisationId?: string): Promise<UpcomingTasks> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<UpcomingTasks>(
      `${API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(orgId)}?limit=${limit}`
    )
    return this.extractData(response)
  }

  /**
   * Get complete dashboard data in one call
   */
  async getCompleteDashboard(organisationId?: string): Promise<{
    kpis: KpiMetrics
    riskSummary: RiskSummary
    bcmSummary: BcmSummary
    incidentSummary: IncidentSummary
    complianceSummary: ComplianceSummary
    workflowSummary: WorkflowSummary
    recentActivity: RecentActivity
    upcomingTasks: UpcomingTasks
  }> {
    const orgId = organisationId || this.getCurrentOrganisationId()

    const [
      kpis,
      riskSummary,
      bcmSummary,
      incidentSummary,
      complianceSummary,
      workflowSummary,
      recentActivity,
      upcomingTasks,
    ] = await Promise.all([
      this.getKPIs(orgId),
      this.getRiskSummary(orgId),
      this.getBcmSummary(orgId),
      this.getIncidentSummary(orgId),
      this.getComplianceSummary(orgId),
      this.getWorkflowSummary(orgId),
      this.getRecentActivity(10, orgId),
      this.getUpcomingTasks(10, orgId),
    ])

    return {
      kpis,
      riskSummary,
      bcmSummary,
      incidentSummary,
      complianceSummary,
      workflowSummary,
      recentActivity,
      upcomingTasks,
    }
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(organisationId?: string, format: 'pdf' | 'csv' = 'pdf'): Promise<void> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    await this.download(
      API_ENDPOINTS.DASHBOARD.EXPORT(orgId),
      `dashboard_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  // ============================================
  // Private Helpers
  // ============================================

  private getCurrentOrganisationId(): string {
    const authStore = useAuthStore()
    return authStore.userOrganisationId
  }
}

// Export singleton
export const dashboardService = new DashboardService()
