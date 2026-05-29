import { BaseService } from './../../BaseService'
import {
  DashboardRole,
  type DashboardConfig,
  type DashboardKPIs,
  type ComplianceOverview,
  type RiskTrend,
  type IncidentTrend,
  type DashboardData,
  type DashboardWorkflow,
  type RecentActivity,
  type UpcomingTask,
  type MaturityProgress,
  type DashboardQueryParams,
  type CreateDashboardConfigRequest,
  type UpdateDashboardConfigRequest,
} from './../../../modules'
import { PaginatedResponse } from 'src/core/base/base.types'

export class DashboardService extends BaseService {
  async getKPIs(organisationId?: string): Promise<DashboardKPIs> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<DashboardKPIs>('/dashboard/kpis', params)
    return this.extractData(response)
  }

  async getRiskSummary(organisationId?: string): Promise<{
    total_risks: number
    critical_risks: number
    high_risks: number
    medium_risks: number
    low_risks: number
    risk_trends: RiskTrend[]
    top_risk_categories: Array<{ category: string; count: number; percentage: number }>
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
      total_risks: number
      critical_risks: number
      high_risks: number
      medium_risks: number
      low_risks: number
      risk_trends: RiskTrend[]
      top_risk_categories: Array<{ category: string; count: number; percentage: number }>
    }>('/dashboard/risk-summary', params)
    return this.extractData(response)
  }

  async getBcmSummary(organisationId?: string): Promise<{
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
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
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
    }>('/dashboard/bcm-summary', params)
    return this.extractData(response)
  }

  async getIncidentSummary(organisationId?: string): Promise<{
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
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
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
    }>('/dashboard/incident-summary', params)
    return this.extractData(response)
  }

  async getComplianceSummary(organisationId?: string): Promise<{
    overall_compliance_rate: number
    compliant_count: number
    partially_compliant_count: number
    non_compliant_count: number
    overdue_audits: number
    upcoming_audits: number
    compliance_by_standard: ComplianceOverview[]
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
      overall_compliance_rate: number
      compliant_count: number
      partially_compliant_count: number
      non_compliant_count: number
      overdue_audits: number
      upcoming_audits: number
      compliance_by_standard: ComplianceOverview[]
    }>('/dashboard/compliance-summary', params)
    return this.extractData(response)
  }

  async getWorkflowSummary(organisationId?: string): Promise<{
    total_workflows: number
    pending_approvals: number
    in_review: number
    completed: number
    rejected: number
    overdue: number
    average_completion_days: number
    recent_workflows: DashboardWorkflow[]
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
      total_workflows: number
      pending_approvals: number
      in_review: number
      completed: number
      rejected: number
      overdue: number
      average_completion_days: number
      recent_workflows: DashboardWorkflow[]
    }>('/dashboard/workflow-summary', params)
    return this.extractData(response)
  }

  async getUpcomingTasks(
    limit: number = 10,
    organisationId?: string
  ): Promise<{ tasks: UpcomingTask[] }> {
    try {
      const params = { limit, ...(organisationId ? { organisation_id: organisationId } : {}) }
      const response = await this.get<{ tasks: UpcomingTask[] }>(
        '/dashboard/upcoming-tasks',
        params
      )
      return this.extractData(response)
    } catch (error) {
      console.error('Failed to get upcoming tasks:', error)
      return { tasks: [] }
    }
  }

  async getRecentActivity(
    limit: number = 10,
    organisationId?: string
  ): Promise<{ activities: RecentActivity[] }> {
    try {
      const params = { limit, ...(organisationId ? { organisation_id: organisationId } : {}) }
      const response = await this.get<{ activities: RecentActivity[] }>(
        '/dashboard/recent-activity',
        params
      )
      return this.extractData(response)
    } catch (error) {
      console.error('Failed to get recent activity:', error)
      return { activities: [] }
    }
  }

  async getRiskTrends(period: string = 'month', organisationId?: string): Promise<RiskTrend[]> {
    const params = { period, ...(organisationId ? { organisation_id: organisationId } : {}) }
    const response = await this.get<RiskTrend[]>('/dashboard/risk-trends', params)
    return this.extractData(response)
  }

  async getComplianceOverview(organisationId?: string): Promise<ComplianceOverview[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<ComplianceOverview[]>('/dashboard/compliance-overview', params)
    return this.extractData(response)
  }

  async getCompleteDashboard(organisationId?: string): Promise<DashboardData> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<DashboardData>('/dashboard/complete', params)
    return this.extractData(response)
  }

  // Dashboard Configuration Methods
  async getDashboardConfigs(params?: DashboardQueryParams): Promise<any> {
    const response = await this.getPaginated<DashboardConfig>('/dashboard/configs', params)
    return response
  }

  async getDashboardConfig(id: string): Promise<DashboardConfig> {
    const response = await this.get<DashboardConfig>(`/dashboard/configs/${id}`)
    return this.extractData(response)
  }

  async getUserDashboardConfig(organisationId?: string): Promise<DashboardConfig> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<DashboardConfig>('/dashboard/user-config', params)
    return this.extractData(response)
  }

  async createDashboardConfig(data: CreateDashboardConfigRequest): Promise<DashboardConfig> {
    const response = await this.post<DashboardConfig>('/dashboard/configs', data)
    return this.extractData(response)
  }

  async updateDashboardConfig(
    id: string,
    data: UpdateDashboardConfigRequest
  ): Promise<DashboardConfig> {
    const response = await this.put<DashboardConfig>(`/dashboard/configs/${id}`, data)
    return this.extractData(response)
  }

  async deleteDashboardConfig(id: string): Promise<void> {
    await this.delete(`/dashboard/configs/${id}`)
  }

  async getOrganisationDashboardConfigs(
    organisationId: string
  ): Promise<PaginatedResponse<DashboardConfig>> {
    return this.getPaginated<DashboardConfig>(`/dashboard/organisations/${organisationId}/configs`)
  }

  async getRoleDashboardConfigs(
    organisationId: string,
    role: DashboardRole
  ): Promise<DashboardConfig[]> {
    const response = await this.get<DashboardConfig[]>(
      `/dashboard/organisations/${organisationId}/roles/${role}/configs`
    )
    return this.extractData(response)
  }
}

export const dashboardService = new DashboardService()
