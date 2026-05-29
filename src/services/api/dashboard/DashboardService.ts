import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
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
    const response = await this.get<DashboardKPIs>(
      API_ENDPOINTS.DASHBOARD.KPIS(organisationId || ''),
      params
    )
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
    }>(API_ENDPOINTS.DASHBOARD.RISK_SUMMARY(organisationId || ''), params)
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
    }>(API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(organisationId || ''), params)
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
    }>(API_ENDPOINTS.DASHBOARD.INCIDENT_SUMMARY(organisationId || ''), params)
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
    }>(API_ENDPOINTS.DASHBOARD.COMPLIANCE_SUMMARY(organisationId || ''), params)
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
    }>(API_ENDPOINTS.DASHBOARD.WORKFLOW_SUMMARY(organisationId || ''), params)
    return this.extractData(response)
  }

  async getUpcomingTasks(
    limit: number = 10,
    organisationId?: string
  ): Promise<{ tasks: UpcomingTask[] }> {
    try {
      const params = { limit, ...(organisationId ? { organisation_id: organisationId } : {}) }
      const response = await this.get<{ tasks: UpcomingTask[] }>(
        API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(organisationId || ''),
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
        API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(organisationId || ''),
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
    const response = await this.get<RiskTrend[]>(
      API_ENDPOINTS.DASHBOARD.RISK_TRENDS(organisationId || ''),
      params
    )
    return this.extractData(response)
  }

  async getComplianceOverview(organisationId?: string): Promise<ComplianceOverview[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<ComplianceOverview[]>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_OVERVIEW(organisationId || ''),
      params
    )
    return this.extractData(response)
  }

  async getCompleteDashboard(organisationId?: string): Promise<DashboardData> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<DashboardData>('/dashboard/complete', params)
    return this.extractData(response)
  }

  async getDashboardConfigs(params?: DashboardQueryParams): Promise<any> {
    const response = await this.getPaginated<DashboardConfig>(
      API_ENDPOINTS.DASHBOARD.CONFIGS,
      params
    )
    return response
  }

  async getDashboardConfig(id: string): Promise<DashboardConfig> {
    const response = await this.get<DashboardConfig>(API_ENDPOINTS.DASHBOARD.CONFIG_BY_ID(id))
    return this.extractData(response)
  }

  async getUserDashboardConfig(organisationId?: string): Promise<DashboardConfig> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<DashboardConfig>(API_ENDPOINTS.DASHBOARD.USER_CONFIG, params)
    return this.extractData(response)
  }

  async createDashboardConfig(data: CreateDashboardConfigRequest): Promise<DashboardConfig> {
    const response = await this.post<DashboardConfig>(API_ENDPOINTS.DASHBOARD.CONFIGS, data)
    return this.extractData(response)
  }

  async updateDashboardConfig(
    id: string,
    data: UpdateDashboardConfigRequest
  ): Promise<DashboardConfig> {
    const response = await this.put<DashboardConfig>(API_ENDPOINTS.DASHBOARD.CONFIG_BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteDashboardConfig(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.DASHBOARD.CONFIG_BY_ID(id))
  }

  async getOrganisationDashboardConfigs(
    organisationId: string
  ): Promise<PaginatedResponse<DashboardConfig>> {
    return this.getPaginated<DashboardConfig>(
      API_ENDPOINTS.DASHBOARD.ORGANISATION_CONFIGS(organisationId)
    )
  }

  async getRoleDashboardConfigs(
    organisationId: string,
    role: DashboardRole
  ): Promise<DashboardConfig[]> {
    const response = await this.get<DashboardConfig[]>(
      API_ENDPOINTS.DASHBOARD.ROLE_CONFIGS(organisationId, role)
    )
    return this.extractData(response)
  }
}

export const dashboardService = new DashboardService()
