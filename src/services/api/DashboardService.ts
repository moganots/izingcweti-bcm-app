import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type {
  DashboardKPIs,
  DashboardIncident,
  DashboardTest,
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
  MaturityProgress,
  IncidentTrend,
} from '../../types/bcm.types'

/**
 * Dashboard API Service
 */
export class DashboardService extends BaseService {
  /**
   * Get dashboard KPIs
   */
  async getKPIs(): Promise<DashboardKPIs> {
    const response = await this.get<DashboardKPIs>(API_ENDPOINTS.DASHBOARD.KPIS)
    return this.extractData(response)
  }

  /**
   * Get recent incidents for dashboard
   */
  async getRecentIncidents(limit: number = 5): Promise<DashboardIncident[]> {
    const response = await this.get<DashboardIncident[]>(API_ENDPOINTS.DASHBOARD.RECENT_INCIDENTS, {
      limit,
    })
    return this.extractData(response)
  }

  /**
   * Get upcoming tests for dashboard
   */
  async getUpcomingTests(limit: number = 5): Promise<DashboardTest[]> {
    const response = await this.get<DashboardTest[]>(API_ENDPOINTS.DASHBOARD.UPCOMING_TESTS, {
      limit,
    })
    return this.extractData(response)
  }

  /**
   * Get pending workflows for dashboard
   */
  async getPendingWorkflows(limit: number = 5): Promise<DashboardWorkflow[]> {
    const response = await this.get<DashboardWorkflow[]>(
      API_ENDPOINTS.DASHBOARD.PENDING_WORKFLOWS,
      { limit }
    )
    return this.extractData(response)
  }

  /**
   * Get compliance overview
   */
  async getComplianceOverview(): Promise<ComplianceOverview[]> {
    const response = await this.get<ComplianceOverview[]>('/dashboard/compliance-overview')
    return this.extractData(response)
  }

  /**
   * Get risk trends
   */
  async getRiskTrends(period: string = 'month'): Promise<RiskTrend[]> {
    const response = await this.get<RiskTrend[]>('/dashboard/risk-trends', { period })
    return this.extractData(response)
  }

  /**
   * Get BCM maturity progress
   */
  async getMaturityProgress(): Promise<MaturityProgress> {
    const response = await this.get<MaturityProgress>('/dashboard/maturity-progress')
    return this.extractData(response)
  }

  /**
   * Get incident trends
   */
  async getIncidentTrends(period: string = 'month'): Promise<IncidentTrend[]> {
    const response = await this.get<IncidentTrend[]>('/dashboard/incident-trends', { period })
    return this.extractData(response)
  }
}

// Export singleton
export const dashboardService = new DashboardService()
