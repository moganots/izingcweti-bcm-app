import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import { useAuthStore } from '../../../stores/auth/auth.store'
import type {
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
  MaturityProgress,
  IncidentTrend,
} from './../../../types'

// Define response types matching backend
export interface KpiMetricsResponse {
  activeBCPs: number
  activeIncidents: number
  highRisks: number
  pendingApprovals: number
  complianceRate: number
  maturityScore: number
}

export interface RiskSummaryResponse {
  total_risks: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  risk_trends: RiskTrend[]
  top_risk_categories: Array<{ category: string; count: number; percentage: number }>
}

export interface BcmSummaryResponse {
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

export interface IncidentSummaryResponse {
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

export interface ComplianceSummaryResponse {
  overall_compliance_rate: number
  compliant_count: number
  partially_compliant_count: number
  non_compliant_count: number
  overdue_audits: number
  upcoming_audits: number
  compliance_by_standard: ComplianceOverview[]
}

export interface WorkflowSummaryResponse {
  total_workflows: number
  pending_approvals: number
  in_review: number
  completed: number
  rejected: number
  overdue: number
  average_completion_days: number
  recent_workflows: DashboardWorkflow[]
}

export interface RecentActivityResponse {
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

export interface UpcomingTasksResponse {
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
 * Dashboard API Service
 */
export class DashboardService extends BaseService {
  /**
   * Get dashboard KPIs
   */
  async getKPIs(organisationId?: string): Promise<KpiMetricsResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<KpiMetricsResponse>(API_ENDPOINTS.DASHBOARD.KPI_METRICS(orgId))
    return this.extractData(response)
  }

  /**
   * Get risk summary for dashboard
   */
  async getRiskSummary(organisationId?: string): Promise<RiskSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<RiskSummaryResponse>(
      API_ENDPOINTS.DASHBOARD.RISK_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get BCM summary for dashboard
   */
  async getBcmSummary(organisationId?: string): Promise<BcmSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<BcmSummaryResponse>(API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(orgId))
    return this.extractData(response)
  }

  /**
   * Get incident summary for dashboard
   */
  async getIncidentSummary(organisationId?: string): Promise<IncidentSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<IncidentSummaryResponse>(
      API_ENDPOINTS.DASHBOARD.INCIDENT_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get compliance summary for dashboard
   */
  async getComplianceSummary(organisationId?: string): Promise<ComplianceSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<ComplianceSummaryResponse>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get workflow summary for dashboard
   */
  async getWorkflowSummary(organisationId?: string): Promise<WorkflowSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<WorkflowSummaryResponse>(
      API_ENDPOINTS.DASHBOARD.WORKFLOW_SUMMARY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(
    limit: number = 10,
    organisationId?: string
  ): Promise<RecentActivityResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<RecentActivityResponse>(
      API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(
    limit: number = 10,
    organisationId?: string
  ): Promise<UpcomingTasksResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<UpcomingTasksResponse>(
      API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(orgId)
    )
    return this.extractData(response)
  }

  /**
   * Get risk trends
   */
  async getRiskTrends(period: string = 'month', organisationId?: string): Promise<RiskTrend[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<RiskTrend[]>(API_ENDPOINTS.DASHBOARD.RISK_TRENDS(orgId))
    return this.extractData(response) || []
  }

  /**
   * Get compliance overview
   */
  async getComplianceOverview(organisationId?: string): Promise<ComplianceOverview[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<ComplianceOverview[]>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_OVERVIEW(orgId)
    )
    return this.extractData(response) || []
  }

  /**
   * Get complete dashboard data in one call
   */
  async getCompleteDashboard(organisationId?: string): Promise<{
    kpis: KpiMetricsResponse
    riskSummary: RiskSummaryResponse
    bcmSummary: BcmSummaryResponse
    incidentSummary: IncidentSummaryResponse
    complianceSummary: ComplianceSummaryResponse
    workflowSummary: WorkflowSummaryResponse
    recentActivity: RecentActivityResponse
    upcomingTasks: UpcomingTasksResponse
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
