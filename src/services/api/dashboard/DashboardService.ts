import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import { useAuthStore } from '../../../stores/auth/auth.store'
import type {
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
  MaturityProgress,
  IncidentTrend,
} from './../../../types'

// Helper function to round numbers
function roundNumber(value: number, decimals: number = 0): number {
  if (typeof value !== 'number' || isNaN(value)) return 0
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

// Helper function to round all numbers in an object recursively
function roundNumbersInObject<T>(obj: T, decimals: number = 2): T {
  if (!obj || typeof obj !== 'object') return obj

  const result = Array.isArray(obj) ? [] : ({} as any)

  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'number') {
      result[key] = roundNumber(value, decimals)
    } else if (value && typeof value === 'object') {
      result[key] = roundNumbersInObject(value, decimals)
    } else {
      result[key] = value
    }
  }

  return result as T
}

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
   * Get dashboard KPIs (rounded to whole numbers)
   */
  async getKPIs(organisationId?: string): Promise<KpiMetricsResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: KpiMetricsResponse }>(
      API_ENDPOINTS.DASHBOARD.KPI_METRICS(orgId)
    )
    const data = this.extractData(response) as unknown as KpiMetricsResponse

    // Round all numeric values to whole numbers
    return {
      activeBCPs: Math.round(data.activeBCPs ?? 0),
      activeIncidents: Math.round(data.activeIncidents ?? 0),
      highRisks: Math.round(data.highRisks ?? 0),
      pendingApprovals: Math.round(data.pendingApprovals ?? 0),
      complianceRate: Math.round(data.complianceRate ?? 0),
      maturityScore: roundNumber(data.maturityScore ?? 0, 1),
    }
  }

  /**
   * Get risk summary for dashboard
   */
  async getRiskSummary(organisationId?: string): Promise<RiskSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: RiskSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.RISK_SUMMARY(orgId)
    )
    const data = this.extractData(response) as unknown as RiskSummaryResponse

    // Round all numeric values
    return {
      total_risks: Math.round(data.total_risks ?? 0),
      critical_risks: Math.round(data.critical_risks ?? 0),
      high_risks: Math.round(data.high_risks ?? 0),
      medium_risks: Math.round(data.medium_risks ?? 0),
      low_risks: Math.round(data.low_risks ?? 0),
      risk_trends: (data.risk_trends || []).map((trend) => ({
        ...trend,
        period: trend.period,
        label: trend.label,
        highRisks: Math.round(trend.high ?? 0),
        mediumRisks: Math.round(trend.medium ?? 0),
        lowRisks: Math.round(trend.low ?? 0),
        total: Math.round(trend.total ?? 0),
      })),
      top_risk_categories: (data.top_risk_categories || []).map((cat) => ({
        ...cat,
        count: Math.round(cat.count ?? 0),
        percentage: roundNumber(cat.percentage ?? 0, 1),
      })),
    }
  }

  /**
   * Get BCM summary for dashboard
   */
  async getBcmSummary(organisationId?: string): Promise<BcmSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: BcmSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(orgId)
    )
    const data = this.extractData(response) as unknown as BcmSummaryResponse

    return {
      total_bcp_plans: Math.round(data.total_bcp_plans ?? 0),
      active_plans: Math.round(data.active_plans ?? 0),
      draft_plans: Math.round(data.draft_plans ?? 0),
      archived_plans: Math.round(data.archived_plans ?? 0),
      plans_due_for_review: Math.round(data.plans_due_for_review ?? 0),
      maturity_score: roundNumber(data.maturity_score ?? 0, 1),
      maturity_level: data.maturity_level || '',
      maturity_progress: data.maturity_progress || {
        overall: 0,
        domains: [],
        target: 0,
        progress: 0,
      },
      recovery_strategies_count: Math.round(data.recovery_strategies_count ?? 0),
      exercise_tests_completed: Math.round(data.exercise_tests_completed ?? 0),
      exercise_tests_pending: Math.round(data.exercise_tests_pending ?? 0),
    }
  }

  /**
   * Get incident summary for dashboard
   */
  async getIncidentSummary(organisationId?: string): Promise<IncidentSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: IncidentSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.INCIDENT_SUMMARY(orgId)
    )
    const data = this.extractData(response) as unknown as IncidentSummaryResponse

    return {
      total_incidents: Math.round(data.total_incidents ?? 0),
      active_incidents: Math.round(data.active_incidents ?? 0),
      resolved_incidents: Math.round(data.resolved_incidents ?? 0),
      closed_incidents: Math.round(data.closed_incidents ?? 0),
      critical_incidents: Math.round(data.critical_incidents ?? 0),
      high_incidents: Math.round(data.high_incidents ?? 0),
      medium_incidents: Math.round(data.medium_incidents ?? 0),
      low_incidents: Math.round(data.low_incidents ?? 0),
      incident_trends: (data.incident_trends || []).map((trend) => ({
        ...trend,
        period: trend.period,
        label: trend.label,
        critical: Math.round(trend.critical ?? 0),
        high: Math.round(trend.high ?? 0),
        medium: Math.round(trend.medium ?? 0),
        low: Math.round(trend.low ?? 0),
        total: Math.round(trend.total ?? 0),
        avgResolutionTime: roundNumber(trend.avgResolutionTime ?? 0, 1),
      })),
      average_resolution_time_hours: roundNumber(data.average_resolution_time_hours ?? 0, 1),
    }
  }

  /**
   * Get compliance summary for dashboard
   */
  async getComplianceSummary(organisationId?: string): Promise<ComplianceSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: ComplianceSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_SUMMARY(orgId)
    )
    const data = this.extractData(response) as unknown as ComplianceSummaryResponse

    return {
      overall_compliance_rate: roundNumber(data.overall_compliance_rate ?? 0, 1),
      compliant_count: Math.round(data.compliant_count ?? 0),
      partially_compliant_count: Math.round(data.partially_compliant_count ?? 0),
      non_compliant_count: Math.round(data.non_compliant_count ?? 0),
      overdue_audits: Math.round(data.overdue_audits ?? 0),
      upcoming_audits: Math.round(data.upcoming_audits ?? 0),
      compliance_by_standard: (data.compliance_by_standard || []).map((standard) => ({
        ...standard,
        standard: standard.standard,
        compliant: Math.round(standard.compliant ?? 0),
        partially: Math.round(standard.partially ?? 0),
        nonCompliant: Math.round(standard.nonCompliant ?? 0),
        total: Math.round(standard.total ?? 0),
        complianceRate: roundNumber(standard.complianceRate ?? 0, 1),
      })),
    }
  }

  /**
   * Get workflow summary for dashboard
   */
  async getWorkflowSummary(organisationId?: string): Promise<WorkflowSummaryResponse> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: WorkflowSummaryResponse }>(
      API_ENDPOINTS.DASHBOARD.WORKFLOW_SUMMARY(orgId)
    )
    const data = this.extractData(response) as unknown as WorkflowSummaryResponse

    return {
      total_workflows: Math.round(data.total_workflows ?? 0),
      pending_approvals: Math.round(data.pending_approvals ?? 0),
      in_review: Math.round(data.in_review ?? 0),
      completed: Math.round(data.completed ?? 0),
      rejected: Math.round(data.rejected ?? 0),
      overdue: Math.round(data.overdue ?? 0),
      average_completion_days: roundNumber(data.average_completion_days ?? 0, 1),
      recent_workflows: (data.recent_workflows || []).map(
        (wf) =>
        ({
          ...wf,
          uuid: wf.uuid,
          workflow_type: wf.workflow_type,
          workflow_state: wf.workflow_state,
          priority: Math.round(wf.priority ?? 0),
          title: wf.title,
          due_date: wf.due_date,
          assigned_to: wf.assigned_to,
        } as unknown as DashboardWorkflow)
      ),
    }
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(
    limit: number = 10,
    organisationId?: string
  ): Promise<UpcomingTasksResponse> {
    try {
      const orgId = organisationId || this.getCurrentOrganisationId()
      const url = `${API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(orgId)}?limit=${limit}`
      const response = await this.get<{ data: { tasks: any[] } }>(url)

      // Safely extract data with fallback
      const responseData = this.extractData(response) as any
      const tasks = responseData?.data?.tasks || responseData?.tasks || []

      return {
        tasks: (tasks || []).map((task: any) => ({
          ...task,
          days_remaining: Math.round(task.days_remaining ?? 0),
        })),
      }
    } catch (error) {
      console.error('Failed to get upcoming tasks:', error)
      // Return empty tasks array on error
      return { tasks: [] }
    }
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(
    limit: number = 10,
    organisationId?: string
  ): Promise<RecentActivityResponse> {
    try {
      const orgId = organisationId || this.getCurrentOrganisationId()
      const url = `${API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(orgId)}?limit=${limit}`
      const response = await this.get<{ data: { activities: any[] } }>(url)

      // Safely extract data with fallback
      const responseData = this.extractData(response) as any
      const activities = responseData?.data?.activities || responseData?.activities || []

      return { activities: activities || [] }
    } catch (error) {
      console.error('Failed to get recent activity:', error)
      // Return empty activities array on error
      return { activities: [] }
    }
  }

  /**
   * Get risk trends
   */
  async getRiskTrends(period: string = 'month', organisationId?: string): Promise<RiskTrend[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const url = `${API_ENDPOINTS.DASHBOARD.RISK_TRENDS(orgId)}?period=${period}`
    const response = await this.get<{ data: RiskTrend[] }>(url)
    const trends = (this.extractData(response) || []) as unknown as RiskTrend[]

    return trends.map((trend) => ({
      ...trend,
      period: trend.period,
      label: trend.label,
      highRisks: Math.round(trend.high ?? 0),
      mediumRisks: Math.round(trend.medium ?? 0),
      lowRisks: Math.round(trend.low ?? 0),
      total: Math.round(trend.total ?? 0),
    }))
  }

  /**
   * Get compliance overview
   */
  async getComplianceOverview(organisationId?: string): Promise<ComplianceOverview[]> {
    const orgId = organisationId || this.getCurrentOrganisationId()
    const response = await this.get<{ data: ComplianceOverview[] }>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_OVERVIEW(orgId)
    )
    const overview = (this.extractData(response) || []) as unknown as ComplianceOverview[]

    return overview.map((item) => ({
      ...item,
      standard: item.standard,
      compliant: Math.round(item.compliant ?? 0),
      partially: Math.round(item.partially ?? 0),
      nonCompliant: Math.round(item.nonCompliant ?? 0),
      total: Math.round(item.total ?? 0),
      complianceRate: roundNumber(item.complianceRate ?? 0, 1),
    }))
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

    // Create default empty responses for failed endpoints (with rounded values)
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
