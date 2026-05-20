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

// ============================================
// Helper Functions for Rounding
// ============================================

/**
 * Round a number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded number
 */
function roundNumber(value: number, decimals: number = 0): number {
  if (typeof value !== 'number' || isNaN(value)) return 0
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Round likelihood value (0-1 range) to 1 decimal place
 */
function roundLikelihood(value: number): number {
  return roundNumber(value, 1)
}

/**
 * Round risk score values (0-10 range) to 1 decimal place
 */
function roundRiskScore(value: number): number {
  return roundNumber(value, 1)
}

/**
 * Round percentage values to 1 decimal place
 */
function roundPercentage(value: number): number {
  return roundNumber(value, 1)
}

/**
 * Round count values to whole numbers
 */
function roundCount(value: number): number {
  return Math.round(value)
}

/**
 * Round and validate risk data object
 */
function roundRiskData(risk: Risk): Risk {
  return {
    ...risk,
    likelihood: roundLikelihood(risk.likelihood),
    inherent_risk_score: roundRiskScore(risk.inherent_risk_score),
    residual_risk_score: roundRiskScore(risk.residual_risk_score),
  }
}

/**
 * Round risk statistics
 */
function roundRiskStats(stats: RiskStats): RiskStats {
  return {
    total: roundCount(stats.total),
    critical: roundCount(stats.critical),
    high: roundCount(stats.high),
    medium: roundCount(stats.medium),
    low: roundCount(stats.low),
    mitigated: roundCount(stats.mitigated),
    byCategory: stats.byCategory,
    bySeverity: stats.bySeverity,
  }
}

/**
 * Round risk matrix cell
 */
function roundRiskMatrixCell(cell: RiskMatrixCell): RiskMatrixCell {
  return {
    ...cell,
    likelihood: roundLikelihood(cell.likelihood),
    score: roundRiskScore(cell.score),
    count: roundCount(cell.count),
  }
}

/**
 * Risk API Service
 * All numeric values are rounded to appropriate decimal places
 */
export class RiskService extends BaseService {
  // ============================================
  // Core CRUD Operations
  // ============================================

  /**
   * Get all risks with pagination (rounded)
   */
  async getRisks(params?: RiskQueryParams): Promise<PaginatedResponse<Risk>> {
    const queryParams: Record<string, any> = { ...params }

    // Handle organisation filter
    if (params?.organisation_id) {
      const response = await this.getPaginated<Risk>(
        API_ENDPOINTS.RISKS.BY_ORGANISATION(params.organisation_id),
        queryParams
      )
      if (response.data && response.data.length > 0) {
        response.data = response.data.map(roundRiskData)
      }
      return response
    }

    // Handle category filter
    if (params?.risk_category) {
      const response = await this.getPaginated<Risk>(
        API_ENDPOINTS.RISKS.BY_CATEGORY(params.risk_category),
        queryParams
      )
      if (response.data && response.data.length > 0) {
        response.data = response.data.map(roundRiskData)
      }
      return response
    }

    // Default: get all risks
    const response = await this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, queryParams)
    if (response.data && response.data.length > 0) {
      response.data = response.data.map(roundRiskData)
    }
    return response
  }

  /**
   * Get risk by ID (rounded)
   */
  async getRisk(id: string): Promise<Risk> {
    const response = await this.get<Risk>(API_ENDPOINTS.RISKS.BY_ID(id))
    const risk = this.extractData(response)
    return roundRiskData(risk)
  }

  /**
   * Create a new risk (validate and round input)
   */
  async createRisk(data: CreateRiskRequest): Promise<Risk> {
    const roundedData: CreateRiskRequest = {
      ...data,
      likelihood: roundLikelihood(data.likelihood),
      inherent_risk_score: roundRiskScore(data.inherent_risk_score),
      residual_risk_score: roundRiskScore(data.residual_risk_score),
    }

    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.BASE, roundedData)
    const risk = this.extractData(response)
    return roundRiskData(risk)
  }

  /**
   * Update a risk (validate and round input)
   */
  async updateRisk(id: string, data: UpdateRiskRequest): Promise<Risk> {
    const roundedData: UpdateRiskRequest = {
      ...data,
      likelihood: data.likelihood !== undefined ? roundLikelihood(data.likelihood) : undefined,
      inherent_risk_score:
        data.inherent_risk_score !== undefined
          ? roundRiskScore(data.inherent_risk_score)
          : undefined,
      residual_risk_score:
        data.residual_risk_score !== undefined
          ? roundRiskScore(data.residual_risk_score)
          : undefined,
    } as any

    const response = await this.put<Risk>(API_ENDPOINTS.RISKS.BY_ID(id), roundedData)
    const risk = this.extractData(response)
    return roundRiskData(risk)
  }

  /**
   * Delete a risk
   */
  async deleteRisk(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RISKS.BY_ID(id))
  }

  // ============================================
  // Risk Assessment Operations
  // ============================================

  /**
   * Reassess a risk (round input values)
   */
  async reassessRisk(id: string, data: ReassessRiskRequest): Promise<Risk> {
    const roundedData: ReassessRiskRequest = {
      likelihood: roundLikelihood(data.likelihood),
      impact_severity: data.impact_severity,
      inherent_risk_score: roundRiskScore(data.inherent_risk_score),
      residual_risk_score: roundRiskScore(data.residual_risk_score),
    }

    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.ASSESS(id), roundedData)
    const risk = this.extractData(response)
    return roundRiskData(risk)
  }

  // ============================================
  // Risk Level Filters
  // ============================================

  /**
   * Get high risks (score >= HIGH threshold)
   */
  async getHighRisks(threshold?: number): Promise<PaginatedResponse<Risk>> {
    const params: Record<string, unknown> = {}
    if (threshold !== undefined && threshold !== null) {
      params.min_inherent_score = roundRiskScore(threshold)
    } else {
      params.min_inherent_score = 8 // HIGH threshold
    }
    return this.getRisks(params as RiskQueryParams)
  }

  /**
   * Get critical risks (score >= CRITICAL threshold)
   */
  async getCriticalRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ min_inherent_score: 8.5 } as RiskQueryParams)
  }

  /**
   * Get low risks (score <= LOW threshold)
   */
  async getLowRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ max_inherent_score: 3 } as RiskQueryParams)
  }

  /**
   * Get medium risks (score between LOW and HIGH thresholds)
   */
  async getMediumRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({
      min_inherent_score: 3,
      max_inherent_score: 6,
    } as RiskQueryParams)
  }

  // ============================================
  // Category and Severity Filters
  // ============================================

  /**
   * Get risks by category
   */
  async getRisksByCategory(
    category: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, risk_category: category } as RiskQueryParams)
  }

  /**
   * Get risks by impact severity
   */
  async getRisksBySeverity(
    severity: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, impact_severity: severity } as RiskQueryParams)
  }

  /**
   * Get risks by category and severity
   */
  async getRisksByCategoryAndSeverity(
    category: string,
    severity: string
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({
      risk_category: category,
      impact_severity: severity,
    } as RiskQueryParams)
  }

  // ============================================
  // Organisation Filters
  // ============================================

  /**
   * Get risks by organisation
   */
  async getRisksByOrganisation(
    organisationId: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, organisation_id: organisationId } as RiskQueryParams)
  }

  // ============================================
  // Score Range Filters
  // ============================================

  /**
   * Get risks by score range (rounded)
   */
  async getRisksByScoreRange(
    minScore: number,
    maxScore: number,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({
      ...params,
      min_inherent_score: roundRiskScore(minScore),
      max_inherent_score: roundRiskScore(maxScore),
    } as RiskQueryParams)
  }

  // ============================================
  // Mitigation Controls
  // ============================================

  /**
   * Add mitigation controls to a risk
   */
  async addMitigationControls(id: string, controlIds: string[]): Promise<Risk> {
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.MITIGATE(id), {
      mitigation_control_ids: controlIds,
    })
    const risk = this.extractData(response)
    return roundRiskData(risk)
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
    const updatedRisk = this.extractData(response)
    return roundRiskData(updatedRisk)
  }

  /**
   * Get risks needing mitigation (high or critical risks with no controls)
   */
  async getRisksNeedingMitigation(): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({
      needs_mitigation: true,
      min_inherent_score: 6,
    } as RiskQueryParams)
  }

  // ============================================
  // Statistics and Analytics
  // ============================================

  /**
   * Get risk statistics (rounded)
   */
  async getStats(organisationId?: string): Promise<RiskStats> {
    let url = API_ENDPOINTS.RISKS.STATS('')
    if (organisationId) {
      url = API_ENDPOINTS.RISKS.STATS(organisationId)
    }
    const response = await this.get<RiskStats>(url)
    const stats = this.extractData(response)
    return roundRiskStats(stats)
  }

  /**
   * Get risk heat map data (rounded)
   */
  async getRiskHeatMap(organisationId?: string): Promise<RiskMatrixCell[]> {
    let url = API_ENDPOINTS.RISKS.MATRIX('')
    if (organisationId) {
      url = API_ENDPOINTS.RISKS.MATRIX(organisationId)
    }
    const response = await this.get<RiskMatrixCell[]>(url)
    const cells = this.extractData(response)
    return cells.map(roundRiskMatrixCell)
  }

  /**
   * Get risk summary for dashboard (rounded)
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
      total: roundCount(stats.total),
      critical: roundCount(stats.critical),
      high: roundCount(stats.high),
      medium: roundCount(stats.medium),
      low: roundCount(stats.low),
      mitigated: roundCount(stats.mitigated),
      needsAttention: roundCount((stats.critical || 0) + (stats.high || 0)),
      complianceRate: roundPercentage(
        stats.total > 0 ? ((stats.total - (stats.critical || 0)) / stats.total) * 100 : 100
      ),
    }
  }

  /**
   * Get risk distribution by category (rounded)
   */
  async getRiskDistribution(organisationId?: string): Promise<{
    byCategory: Record<string, number>
    total: number
  }> {
    const stats = await this.getStats(organisationId)
    const roundedByCategory: Record<string, number> = {}

    for (const [category, count] of Object.entries(stats.byCategory || {})) {
      roundedByCategory[category] = roundCount(count)
    }

    return {
      byCategory: roundedByCategory,
      total: roundCount(stats.total),
    }
  }

  /**
   * Get risk trends over time (rounded)
   */
  async getRiskTrends(
    period: string = 'month',
    organisationId?: string
  ): Promise<Array<{ period: string; high: number; medium: number; low: number; total: number }>> {
    const response = await this.get<
      Array<{ period: string; high: number; medium: number; low: number; total: number }>
    >(`${API_ENDPOINTS.RISKS.BASE}/trends`, { period, organisation_id: organisationId })
    const trends = this.extractData(response)

    return trends.map((trend) => ({
      period: trend.period,
      high: roundCount(trend.high),
      medium: roundCount(trend.medium),
      low: roundCount(trend.low),
      total: roundCount(trend.total),
    }))
  }

  // ============================================
  // Search Operations
  // ============================================

  /**
   * Search risks (results rounded automatically)
   */
  async searchRisks(query: string, params?: RiskQueryParams): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({
      ...params,
      search: query,
    } as RiskQueryParams)
  }

  // ============================================
  // Export Operations
  // ============================================

  /**
   * Export risks to file
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
    const exportParams: Record<string, any> = { ...params }

    // Round score thresholds if provided
    if (exportParams.min_score !== undefined) {
      exportParams.min_score = roundRiskScore(exportParams.min_score)
    }
    if (exportParams.max_score !== undefined) {
      exportParams.max_score = roundRiskScore(exportParams.max_score)
    }

    await this.download(
      API_ENDPOINTS.RISKS.EXPORT(organisationId),
      `risks_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: exportParams }
    )
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Bulk update risk status
   */
  async bulkUpdateStatus(
    ids: string[],
    updates: Partial<UpdateRiskRequest>
  ): Promise<{ updated: number }> {
    // Round numeric updates
    const roundedUpdates: Partial<UpdateRiskRequest> = {
      ...updates,
      likelihood:
        updates.likelihood !== undefined ? roundLikelihood(updates.likelihood) : undefined,
      inherent_risk_score:
        updates.inherent_risk_score !== undefined
          ? roundRiskScore(updates.inherent_risk_score)
          : undefined,
      residual_risk_score:
        updates.residual_risk_score !== undefined
          ? roundRiskScore(updates.residual_risk_score)
          : undefined,
    } as any

    const response = await this.post<{ updated: number }>(
      `${API_ENDPOINTS.RISKS.BASE}/bulk-update`,
      { ids, updates: roundedUpdates }
    )
    const result = this.extractData(response)
    return { updated: roundCount(result.updated) }
  }

  /**
   * Bulk delete risks
   */
  async bulkDeleteRisks(ids: string[]): Promise<{ deleted: number }> {
    const response = await this.post<{ deleted: number }>(
      `${API_ENDPOINTS.RISKS.BASE}/bulk-delete`,
      { ids }
    )
    const result = this.extractData(response)
    return { deleted: roundCount(result.deleted) }
  }

  // ============================================
  // Validation Operations
  // ============================================

  /**
   * Validate risk scores before creation/update
   */
  async validateRiskScores(data: {
    likelihood: number
    inherent_risk_score: number
    residual_risk_score: number
  }): Promise<{ valid: boolean; message?: string }> {
    try {
      if (data.likelihood < 0 || data.likelihood > 1) {
        return { valid: false, message: 'Likelihood must be between 0 and 1' }
      }
      if (data.inherent_risk_score < 0) {
        return { valid: false, message: 'Inherent risk score must be a positive number' }
      }
      if (data.residual_risk_score < 0) {
        return { valid: false, message: 'Residual risk score must be a positive number' }
      }
      if (data.residual_risk_score > data.inherent_risk_score) {
        return {
          valid: false,
          message: 'Residual risk score cannot be greater than inherent risk score',
        }
      }
      return { valid: true }
    } catch (error: any) {
      return { valid: false, message: error.message }
    }
  }
}

// Export singleton
export const riskService = new RiskService()
