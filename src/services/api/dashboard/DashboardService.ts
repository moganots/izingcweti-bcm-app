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
    const response = await this.get<{ data: KpiMetricsResponse }>(
      API_ENDPOINTS.DASHBOARD.KPI_METRICS(orgId)
    )
    return this.extractData(response) as unknown as KpiMetricsResponse
  }

  /**
   * Get risk summary for dashboard
   */
  async getRiskSummary(organisationId?: string): Promise<RiskSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: RiskSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.RISK_SUMMARY(orgId)
    )
    return this.extractData(response) as unknown as RiskSummaryResponse
  }

  /**
   * Get BCM summary for dashboard
   */
  async getBcmSummary(organisationId?: string): Promise<BcmSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: BcmSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(orgId)
    )
    return this.extractData(response) as unknown as BcmSummaryResponse
  }

  /**
   * Get incident summary for dashboard
   */
  async getIncidentSummary(organisationId?: string): Promise<IncidentSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: IncidentSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.INCIDENT_SUMMARY(orgId)
    )
    return this.extractData(response) as unknown as IncidentSummaryResponse
  }

  /**
   * Get compliance summary for dashboard
   */
  async getComplianceSummary(organisationId?: string): Promise<ComplianceSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: ComplianceSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_SUMMARY(orgId)
    )
    return this.extractData(response) as unknown as ComplianceSummaryResponse
  }

  /**
   * Get workflow summary for dashboard
   */
  async getWorkflowSummary(organisationId?: string): Promise<WorkflowSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: WorkflowSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.WORKFLOW_SUMMARY(orgId)
    )
    return this.extractData(response) as unknown as WorkflowSummaryResponse
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(
    limit: number = 10,
    organisationId?: string
  ): Promise<RecentActivityResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    // Add limit as query parameter
    const url = `${API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(orgId)}?limit=${limit}`
    const response = await this.get<{ data: { activities: any[] } }>(url)
    const activities = (this.extractData(response) ?? { data: { activities: [] } })?.data
      ?.activities
    return { activities: activities || [] }
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(
    limit: number = 10,
    organisationId?: string
  ): Promise<UpcomingTasksResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    // Add limit as query parameter
    const url = `${API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(orgId)}?limit=${limit}`
    const response = await this.get<{ data: { tasks: any[] } }>(url)
    const tasks = (this.extractData(response) ?? { data: { tasks: [] } })?.data?.tasks
    return { tasks: tasks || [] }
  }

  /**
   * Get risk trends
   */
  async getRiskTrends(period: string = 'month', organisationId?: string): Promise<RiskTrend[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const url = `${API_ENDPOINTS.DASHBOARD.RISK_TRENDS(orgId)}?period=${period}`
    const response = await this.get<{ data: RiskTrend[] }>(url)
    return (this.extractData(response) || []) as unknown as RiskTrend[]
  }

  /**
   * Get compliance overview
   */
  async getComplianceOverview(organisationId?: string): Promise<ComplianceOverview[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: ComplianceOverview[] }>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_OVERVIEW(orgId)
    )
    return (this.extractData(response) || []) as unknown as ComplianceOverview[]
  }

  /**
   * Get complete dashboard data in one call with error handling for individual endpoints
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

    // Use Promise.allSettled to handle individual endpoint failures
    const results = await Promise.allSettled([
      this.getKPIs(orgId),
      this.getRiskSummary(orgId),
      this.getBcmSummary(orgId),
      this.getIncidentSummary(orgId),
      this.getComplianceSummary(orgId),
      this.getWorkflowSummary(orgId),
      this.getRecentActivity(10, orgId),
      this.getUpcomingTasks(10, orgId),
    ])

    // Create default empty responses for failed endpoints
    const defaultKpis: KpiMetricsResponse = {
      activeBCPs: 0,
      activeIncidents: 0,
      highRisks: 0,
      pendingApprovals: 0,
      complianceRate: 0,
      maturityScore: 0,
    }

    const defaultRiskSummary: RiskSummaryResponse = {
      total_risks: 0,
      critical_risks: 0,
      high_risks: 0,
      medium_risks: 0,
      low_risks: 0,
      risk_trends: [],
      top_risk_categories: [],
    }

    const defaultBcmSummary: BcmSummaryResponse = {
      total_bcp_plans: 0,
      active_plans: 0,
      draft_plans: 0,
      archived_plans: 0,
      plans_due_for_review: 0,
      maturity_score: 0,
      maturity_level: '',
      maturity_progress: { overall: 0, domains: [], target: 0, progress: 0 },
      recovery_strategies_count: 0,
      exercise_tests_completed: 0,
      exercise_tests_pending: 0,
    }

    const defaultIncidentSummary: IncidentSummaryResponse = {
      total_incidents: 0,
      active_incidents: 0,
      resolved_incidents: 0,
      closed_incidents: 0,
      critical_incidents: 0,
      high_incidents: 0,
      medium_incidents: 0,
      low_incidents: 0,
      incident_trends: [],
      average_resolution_time_hours: 0,
    }

    const defaultComplianceSummary: ComplianceSummaryResponse = {
      overall_compliance_rate: 0,
      compliant_count: 0,
      partially_compliant_count: 0,
      non_compliant_count: 0,
      overdue_audits: 0,
      upcoming_audits: 0,
      compliance_by_standard: [],
    }

    const defaultWorkflowSummary: WorkflowSummaryResponse = {
      total_workflows: 0,
      pending_approvals: 0,
      in_review: 0,
      completed: 0,
      rejected: 0,
      overdue: 0,
      average_completion_days: 0,
      recent_workflows: [],
    }

    const defaultRecentActivity: RecentActivityResponse = { activities: [] }
    const defaultUpcomingTasks: UpcomingTasksResponse = { tasks: [] }

    return {
      kpis: results[0].status === 'fulfilled' ? results[0].value : defaultKpis,
      riskSummary: results[1].status === 'fulfilled' ? results[1].value : defaultRiskSummary,
      bcmSummary: results[2].status === 'fulfilled' ? results[2].value : defaultBcmSummary,
      incidentSummary:
        results[3].status === 'fulfilled' ? results[3].value : defaultIncidentSummary,
      complianceSummary:
        results[4].status === 'fulfilled' ? results[4].value : defaultComplianceSummary,
      workflowSummary:
        results[5].status === 'fulfilled' ? results[5].value : defaultWorkflowSummary,
      recentActivity: results[6].status === 'fulfilled' ? results[6].value : defaultRecentActivity,
      upcomingTasks: results[7].status === 'fulfilled' ? results[7].value : defaultUpcomingTasks,
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
