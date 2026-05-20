import { BaseService } from '../../BaseService'
import { Risk, RiskStats, RiskMatrixCell } from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import {
  RiskQueryParams,
  PaginatedResponse,
  CreateRiskRequest,
  UpdateRiskRequest,
  ReassessRiskRequest,
} from './../../../types'

/**
 * Risk API Service
 */
export class RiskService extends BaseService {
  /**
   * Get all risks with pagination
   */
  async getRisks(params?: RiskQueryParams): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, params)
  }

  /**
   * Get risk by ID
   */
  async getRisk(id: string): Promise<Risk> {
    const response = await this.get<Risk>(API_ENDPOINTS.RISKS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create a new risk
   */
  async createRisk(data: CreateRiskRequest): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update a risk
   */
  async updateRisk(id: string, data: UpdateRiskRequest): Promise<Risk> {
    const response = await this.put<Risk>(API_ENDPOINTS.RISKS.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Delete a risk
   */
  async deleteRisk(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RISKS.BY_ID(id))
  }

  /**
   * Reassess a risk
   * Fixed: Use ASSESS endpoint instead of REASSESS (which doesn't exist)
   */
  async reassessRisk(id: string, data: ReassessRiskRequest): Promise<Risk> {
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.ASSESS(id), data)
    return this.extractData(response)
  }

  /**
   * Get high risks (score >= HIGH threshold)
   * Fixed: Use query parameter instead of missing constant
   */
  async getHighRisks(threshold?: number): Promise<PaginatedResponse<Risk>> {
    const params: Record<string, unknown> = {}
    if (threshold !== undefined && threshold !== null) {
      params.min_inherent_score = threshold
    } else {
      params.min_inherent_score = 8 // HIGH threshold
    }
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, params)
  }

  /**
   * Get critical risks (score >= CRITICAL threshold)
   * Fixed: Use query parameter instead of missing constant
   */
  async getCriticalRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, { min_inherent_score: 8.5 } as any)
  }

  /**
   * Get risks by category
   */
  async getRisksByCategory(
    category: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    const queryParams = { ...params, risk_category: category }
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, queryParams)
  }

  /**
   * Get risks by organisation
   */
  async getRisksByOrganisation(
    organisationId: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    const queryParams = { ...params, organisation_id: organisationId }
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, queryParams)
  }

  /**
   * Add mitigation controls to a risk
   * Fixed: Use MITIGATE endpoint instead of ADD_CONTROLS (which doesn't exist)
   */
  async addMitigationControls(id: string, controlIds: string[]): Promise<Risk> {
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.MITIGATE(id), {
      mitigation_control_ids: controlIds,
    })
    return this.extractData(response)
  }

  /**
   * Remove a mitigation control from a risk
   */
  async removeMitigationControl(id: string, controlId: string): Promise<Risk> {
    const risk = await this.getRisk(id)
    const currentControls = risk.mitigation_control_ids || []
    const updatedControls = currentControls.filter((cid) => cid !== controlId)
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.MITIGATE(id), {
      mitigation_control_ids: updatedControls,
    })
    return this.extractData(response)
  }

  /**
   * Get risk statistics
   * Fixed: Use API_ENDPOINTS.RISKS.STATS
   */
  async getStats(organisationId?: string): Promise<RiskStats> {
    let url = API_ENDPOINTS.RISKS.STATS('')
    if (organisationId) {
      url = API_ENDPOINTS.RISKS.STATS(organisationId)
    }
    const response = await this.get<RiskStats>(url)
    return this.extractData(response)
  }

  /**
   * Get risks needing mitigation (high or critical risks with no controls)
   * Fixed: Use query parameter
   */
  async getRisksNeedingMitigation(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, {
      needs_mitigation: true,
      min_inherent_score: 6, // Medium and above
    } as any)
  }

  /**
   * Get risk heat map data
   * Fixed: Use API_ENDPOINTS.RISKS.MATRIX
   */
  async getRiskHeatMap(organisationId?: string): Promise<RiskMatrixCell[]> {
    let url = API_ENDPOINTS.RISKS.MATRIX('')
    if (organisationId) {
      url = API_ENDPOINTS.RISKS.MATRIX(organisationId)
    }
    const response = await this.get<RiskMatrixCell[]>(url)
    return this.extractData(response)
  }

  /**
   * Get low risks
   */
  async getLowRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, { max_inherent_score: 3 } as any)
  }

  /**
   * Get medium risks
   */
  async getMediumRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, {
      min_inherent_score: 3,
      max_inherent_score: 6,
    } as any)
  }

  /**
   * Export risks
   */
  async exportRisks(
    organisationId: string,
    params?: {
      risk_category?: string
      min_score?: number
      max_score?: number
      format?: 'csv' | 'json'
    }
  ): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      API_ENDPOINTS.RISKS.EXPORT(organisationId),
      `risks_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params }
    )
  }

  /**
   * Search risks
   */
  async searchRisks(query: string, params?: RiskQueryParams): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.SEARCH, {
      ...params,
      search: query,
    })
  }

  /**
   * Get risk by category and severity
   */
  async getRisksByCategoryAndSeverity(
    category: string,
    severity: string
  ): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, {
      risk_category: category,
      impact_severity: severity,
    } as any)
  }

  /**
   * Get risk summary for dashboard
   */
  async getSummary(organisationId?: string): Promise<{
    total: number
    critical: number
    high: number
    medium: number
    low: number
    mitigated: number
    needsAttention: number
    complianceRate: number
  }> {
    const stats = await this.getStats(organisationId)
    return {
      total: stats.total,
      critical: stats.critical,
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
      mitigated: stats.mitigated,
      needsAttention: (stats.critical || 0) + (stats.high || 0),
      complianceRate:
        stats.total > 0 ? ((stats.total - (stats.critical || 0)) / stats.total) * 100 : 100,
    }
  }

  /**
   * Bulk update risk status
   */
  async bulkUpdateStatus(
    ids: string[],
    updates: Partial<UpdateRiskRequest>
  ): Promise<{ updated: number }> {
    const response = await this.post<{ updated: number }>(
      `${API_ENDPOINTS.RISKS.BASE}/bulk-update`,
      {
        ids,
        updates,
      }
    )
    return this.extractData(response)
  }
}

// Export singleton
export const riskService = new RiskService()
