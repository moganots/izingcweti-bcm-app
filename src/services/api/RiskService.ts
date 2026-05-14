import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { RiskQueryParams } from '../../types/bcm.types'
import type { Risk, RiskStats } from '../../models/entities/risk.entity'

/**
 * Create Risk Request
 */
export interface CreateRiskRequest {
  organisation_id: string
  risk_category: string
  likelihood: number
  impact_severity: string
  inherent_risk_score: number
  residual_risk_score: number
  mitigation_control_ids?: string[]
}

/**
 * Update Risk Request
 */
export interface UpdateRiskRequest {
  risk_category?: string
  likelihood?: number
  impact_severity?: string
  inherent_risk_score?: number
  residual_risk_score?: number
  mitigation_control_ids?: string[]
}

/**
 * Reassess Risk Request
 */
export interface ReassessRiskRequest {
  likelihood: number
  impact_severity: string
  inherent_risk_score: number
  residual_risk_score: number
}

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
   */
  async reassessRisk(id: string, data: ReassessRiskRequest): Promise<Risk> {
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.REASSESS(id), data)
    return this.extractData(response)
  }

  /**
   * Get high risks
   */
  async getHighRisks(threshold?: number): Promise<PaginatedResponse<Risk>> {
    const params: Record<string, unknown> = {}
    if (threshold !== undefined && threshold !== null) {
      params.threshold = threshold
    }
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.HIGH, params)
  }

  /**
   * Get critical risks
   */
  async getCriticalRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.CRITICAL)
  }

  /**
   * Get risks by category
   */
  async getRisksByCategory(category: string): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BY_CATEGORY(category))
  }

  /**
   * Get risks by organisation
   */
  async getRisksByOrganisation(
    organisationId: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    if (organisationId && params) {
      params.organisation_id = organisationId
    }
    return this.getPaginated<Risk>(API_ENDPOINTS.RISKS.BASE, params)
  }

  /**
   * Add mitigation controls to a risk
   */
  async addMitigationControls(id: string, controlIds: string[]): Promise<Risk> {
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.ADD_CONTROLS(id), {
      control_ids: controlIds,
    })
    return this.extractData(response)
  }

  /**
   * Remove a mitigation control from a risk
   */
  async removeMitigationControl(id: string, controlId: string): Promise<Risk> {
    const response = await this.patch<Risk>(API_ENDPOINTS.RISKS.REMOVE_CONTROL(id, controlId))
    return this.extractData(response)
  }

  /**
   * Get risk statistics
   */
  async getStats(organisationId?: string): Promise<RiskStats> {
    const params: Record<string, unknown> = {}
    if (organisationId) {
      params.organisation_id = organisationId
    }
    const response = await this.get<RiskStats>('/risks/stats', params)
    return this.extractData(response)
  }

  /**
   * Get risks needing mitigation
   */
  async getRisksNeedingMitigation(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>('/risks/needs-mitigation')
  }

  /**
   * Get risk heat map data
   */
  async getRiskHeatMap(organisationId?: string): Promise<any> {
    const params: Record<string, unknown> = {}
    if (organisationId) {
      params.organisation_id = organisationId
    }
    const response = await this.get('/risks/heat-map', params)
    return this.extractData(response)
  }
}

// Export singleton
export const riskService = new RiskService()
