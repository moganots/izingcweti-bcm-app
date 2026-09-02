import { BaseService } from '../../BaseService'
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
} from './../../../modules/dashboard'
import { PaginatedResponse } from 'src/shared/types/common.types'

/**
 * Dashboard Service - Aligned with Backend DTOs (camelCase)
 */
export class DashboardService extends BaseService {
  // ============================================
  // Dashboard Data Endpoints
  // ============================================

  /**
   * Get complete dashboard data - GET /dashboards/organisations/:organisationId/complete
   */
  async getCompleteDashboard(organisationId: string): Promise<DashboardData> {
    const response = await this.get<DashboardData>(
      API_ENDPOINTS.DASHBOARD.COMPLETE(organisationId), undefined, { timeout: 60000 }
    )
    return this.extractData(response)
  }

  /**
   * Get KPIs - GET /dashboards/organisations/:organisationId/kpis
   */
  async getKPIs(organisationId: string): Promise<DashboardKPIs> {
    const response = await this.get<DashboardKPIs>(
      API_ENDPOINTS.DASHBOARD.KPIS(organisationId)
    )
    return this.extractData(response)
  }

  /**
   * Get risk summary - GET /dashboards/organisations/:organisationId/risk-summary
   */
  async getRiskSummary(organisationId: string): Promise<{
    totalRisks: number
    criticalRisks: number
    highRisks: number
    mediumRisks: number
    lowRisks: number
    riskTrends: RiskTrend[]
    topRiskCategories: Array<{ category: string; count: number; percentage: number }>
  }> {
    const response = await this.get<{
      totalRisks: number
      criticalRisks: number
      highRisks: number
      mediumRisks: number
      lowRisks: number
      riskTrends: RiskTrend[]
      topRiskCategories: Array<{ category: string; count: number; percentage: number }>
    }>(API_ENDPOINTS.DASHBOARD.RISK_SUMMARY(organisationId))
    return this.extractData(response)
  }

  /**
   * Get BCM summary - GET /dashboards/organisations/:organisationId/bcm-summary
   */
  async getBcmSummary(organisationId: string): Promise<{
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
  }> {
    const response = await this.get<{
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
    }>(API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(organisationId))
    return this.extractData(response)
  }

  /**
   * Get incident summary - GET /dashboards/organisations/:organisationId/incident-summary
   */
  async getIncidentSummary(organisationId: string): Promise<{
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
  }> {
    const response = await this.get<{
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
    }>(API_ENDPOINTS.DASHBOARD.INCIDENT_SUMMARY(organisationId))
    return this.extractData(response)
  }

  /**
   * Get compliance summary - GET /dashboards/organisations/:organisationId/compliance-summary
   */
  async getComplianceSummary(organisationId: string): Promise<{
    overallComplianceRate: number
    compliantCount: number
    partiallyCompliantCount: number
    nonCompliantCount: number
    overdueAudits: number
    upcomingAudits: number
    complianceByStandard: ComplianceOverview[]
  }> {
    const response = await this.get<{
      overallComplianceRate: number
      compliantCount: number
      partiallyCompliantCount: number
      nonCompliantCount: number
      overdueAudits: number
      upcomingAudits: number
      complianceByStandard: ComplianceOverview[]
    }>(API_ENDPOINTS.DASHBOARD.COMPLIANCE_SUMMARY(organisationId))
    return this.extractData(response)
  }

  /**
   * Get workflow summary - GET /dashboards/organisations/:organisationId/workflow-summary
   */
  async getWorkflowSummary(organisationId: string): Promise<{
    totalWorkflows: number
    pendingApprovals: number
    inReview: number
    completed: number
    rejected: number
    overdue: number
    averageCompletionDays: number
    recentWorkflows: DashboardWorkflow[]
  }> {
    const response = await this.get<{
      totalWorkflows: number
      pendingApprovals: number
      inReview: number
      completed: number
      rejected: number
      overdue: number
      averageCompletionDays: number
      recentWorkflows: DashboardWorkflow[]
    }>(API_ENDPOINTS.DASHBOARD.WORKFLOW_SUMMARY(organisationId))
    return this.extractData(response)
  }

  /**
   * Get recent activity - GET /dashboards/organisations/:organisationId/recent-activity
   */
  async getRecentActivity(
    organisationId: string,
    limit: number = 10
  ): Promise<{ activities: RecentActivity[] }> {
    try {
      const response = await this.get<{ activities: RecentActivity[] }>(
        API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY(organisationId),
        { limit }
      )
      return this.extractData(response)
    } catch (error) {
      console.error('Failed to get recent activity:', error)
      return { activities: [] }
    }
  }

  /**
   * Get upcoming tasks - GET /dashboards/organisations/:organisationId/upcoming-tasks
   */
  async getUpcomingTasks(
    organisationId: string,
    limit: number = 10
  ): Promise<{ tasks: UpcomingTask[] }> {
    try {
      const response = await this.get<{ tasks: UpcomingTask[] }>(
        API_ENDPOINTS.DASHBOARD.UPCOMING_TASKS(organisationId),
        { limit }
      )
      return this.extractData(response)
    } catch (error) {
      console.error('Failed to get upcoming tasks:', error)
      return { tasks: [] }
    }
  }

  /**
   * Get risk trends - GET /dashboards/organisations/:organisationId/risk-trends
   */
  async getRiskTrends(
    organisationId: string,
    period: string = 'month'
  ): Promise<RiskTrend[]> {
    const response = await this.get<RiskTrend[]>(
      API_ENDPOINTS.DASHBOARD.RISK_TRENDS(organisationId),
      { period }
    )
    return this.extractData(response)
  }

  /**
   * Get compliance overview - GET /dashboards/organisations/:organisationId/compliance-overview
   */
  async getComplianceOverview(organisationId: string): Promise<ComplianceOverview[]> {
    const response = await this.get<ComplianceOverview[]>(
      API_ENDPOINTS.DASHBOARD.COMPLIANCE_OVERVIEW(organisationId)
    )
    return this.extractData(response)
  }

  // ============================================
  // Dashboard Config CRUD Operations
  // ============================================

  async getDashboardConfigs(params?: DashboardQueryParams): Promise<PaginatedResponse<DashboardConfig>> {
    const response = await this.getPaginated<DashboardConfig>(
      API_ENDPOINTS.DASHBOARD.CONFIGS,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getDashboardConfig(id: string): Promise<DashboardConfig> {
    const response = await this.get<DashboardConfig>(API_ENDPOINTS.DASHBOARD.CONFIG_BY_ID(id))
    return this.extractData(response)
  }

  async getUserDashboardConfig(organisationId?: string): Promise<DashboardConfig | null> {
    const params = organisationId ? { organisationId } : undefined
    try {
      const response = await this.get<DashboardConfig>(API_ENDPOINTS.DASHBOARD.USER_CONFIG, params)
      return this.extractData(response)
    } catch {
      return null
    }
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
  ): Promise<PaginatedResponse<DashboardConfig>> {
    return this.getPaginated<DashboardConfig>(
      API_ENDPOINTS.DASHBOARD.ROLE_CONFIGS(organisationId, role)
    )
  }
}

export const dashboardService = new DashboardService()