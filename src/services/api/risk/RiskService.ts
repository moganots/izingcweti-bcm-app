import { BaseService } from './../../BaseService'
import {
  // Enums
  RiskCategory,
  RiskStatus,
  RiskTreatment,
  ImpactSeverity,
  RiskScoreLevel,
  getRiskScoreLevel,
  getRiskColor,
  // Types
  type Risk,
  type MitigatingControl,
  type RiskMitigationPlan,
  type RiskMitigationAction,
  type RiskHeatmapSummary,
  type RiskMatrixData,
  type RiskHeatmapData,
  type RiskTrendData,
  type RiskTrendAnalysis,
  type CreateRiskRequest,
  type UpdateRiskRequest,
  type AssessRiskRequest,
  type RiskQueryParams,
  // Shared Types
  type PaginatedResponse,
} from './../../../modules'

export class RiskService extends BaseService {
  // Core CRUD Operations
  async getRisks(params?: RiskQueryParams): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>('/risks', params as Record<string, any>)
  }

  async getRisk(id: string): Promise<Risk> {
    const response = await this.get<Risk>(`/risks/${id}`)
    return this.extractData(response)
  }

  async createRisk(data: CreateRiskRequest): Promise<Risk> {
    const response = await this.post<Risk>('/risks', data)
    return this.extractData(response)
  }

  async updateRisk(id: string, data: UpdateRiskRequest): Promise<Risk> {
    const response = await this.put<Risk>(`/risks/${id}`, data)
    return this.extractData(response)
  }

  async deleteRisk(id: string): Promise<void> {
    await this.delete(`/risks/${id}`)
  }

  // Risk Assessment
  async assessRisk(id: string, data: AssessRiskRequest): Promise<Risk> {
    const response = await this.post<Risk>(`/risks/${id}/assess`, data)
    return this.extractData(response)
  }

  async approveRisk(id: string, notes?: string): Promise<Risk> {
    const response = await this.post<Risk>(`/risks/${id}/approve`, { approval_notes: notes })
    return this.extractData(response)
  }

  async assignRisk(id: string, assignedTo: string): Promise<Risk> {
    const response = await this.post<Risk>(`/risks/${id}/assign`, { assigned_to: assignedTo })
    return this.extractData(response)
  }

  async closeRisk(id: string): Promise<Risk> {
    const response = await this.post<Risk>(`/risks/${id}/close`)
    return this.extractData(response)
  }

  async reassessRisk(id: string, data: AssessRiskRequest): Promise<Risk> {
    return this.assessRisk(id, data)
  }

  // Risk Filters
  async getRisksByOrganisation(
    organisationId: string,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, organisation_id: organisationId })
  }

  async getRisksByCategory(
    category: RiskCategory,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, risk_category: category })
  }

  async getRisksByStatus(
    status: RiskStatus,
    params?: RiskQueryParams
  ): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, status })
  }

  async getHighRisks(threshold: number = 15): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ min_inherent_score: threshold })
  }

  async getCriticalRisks(threshold: number = 20): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ min_inherent_score: threshold })
  }

  async getMyAssignedRisks(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>('/risks/my-assigned')
  }

  async getOverdueReviews(): Promise<PaginatedResponse<Risk>> {
    return this.getPaginated<Risk>('/risks/overdue-reviews')
  }

  // Risk Mitigation
  async addMitigatingControl(riskId: string, control: MitigatingControl): Promise<Risk> {
    const risk = await this.getRisk(riskId)
    const controls = risk.mitigating_controls || []
    const response = await this.put<Risk>(`/risks/${riskId}`, {
      mitigating_controls: [...controls, control],
    })
    return this.extractData(response)
  }

  async updateMitigatingControl(
    riskId: string,
    controlId: string,
    updates: Partial<MitigatingControl>
  ): Promise<Risk> {
    const risk = await this.getRisk(riskId)
    const controls = (risk.mitigating_controls || []).map((c) =>
      c.control_id === controlId ? { ...c, ...updates } : c
    )
    const response = await this.put<Risk>(`/risks/${riskId}`, { mitigating_controls: controls })
    return this.extractData(response)
  }

  async removeMitigatingControl(riskId: string, controlId: string): Promise<Risk> {
    const risk = await this.getRisk(riskId)
    const controls = (risk.mitigating_controls || []).filter((c) => c.control_id !== controlId)
    const response = await this.put<Risk>(`/risks/${riskId}`, { mitigating_controls: controls })
    return this.extractData(response)
  }

  async createMitigationPlan(
    riskId: string,
    plan: Omit<RiskMitigationPlan, 'risk_id'>
  ): Promise<RiskMitigationPlan> {
    const response = await this.post<RiskMitigationPlan>(`/risks/${riskId}/mitigation-plan`, plan)
    return this.extractData(response)
  }

  async updateMitigationAction(
    riskId: string,
    actionId: string,
    updates: Partial<RiskMitigationAction>
  ): Promise<RiskMitigationAction> {
    const response = await this.patch<RiskMitigationAction>(
      `/risks/${riskId}/mitigation-plan/actions/${actionId}`,
      updates
    )
    return this.extractData(response)
  }

  // Risk Analytics & Visualization
  async getRiskMatrix(organisationId: string): Promise<RiskMatrixData[]> {
    const response = await this.get<RiskMatrixData[]>(`/risks/${organisationId}/matrix`)
    return this.extractData(response)
  }

  async getRiskHeatmap(organisationId: string): Promise<RiskHeatmapData> {
    const response = await this.get<RiskHeatmapData>(`/risks/${organisationId}/heatmap`)
    return this.extractData(response)
  }

  async getRiskTrends(organisationId: string, period: string = 'month'): Promise<RiskTrendData[]> {
    const response = await this.get<RiskTrendData[]>(`/risks/${organisationId}/trends`, { period })
    return this.extractData(response)
  }

  async getRiskTrendAnalysis(
    organisationId: string,
    months: number = 12
  ): Promise<RiskTrendAnalysis> {
    const response = await this.get<RiskTrendAnalysis>(`/risks/${organisationId}/trend-analysis`, {
      months,
    })
    return this.extractData(response)
  }

  // Statistics
  async getRiskStats(organisationId?: string): Promise<{
    total: number
    critical: number
    high: number
    medium: number
    low: number
    byCategory: Record<string, number>
    byStatus: Record<string, number>
    averageScore: number
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
      total: number
      critical: number
      high: number
      medium: number
      low: number
      byCategory: Record<string, number>
      byStatus: Record<string, number>
      averageScore: number
    }>('/risks/statistics', params)
    return this.extractData(response)
  }

  async getRiskHeatmapSummary(organisationId: string): Promise<RiskHeatmapSummary> {
    const response = await this.get<RiskHeatmapSummary>(`/risks/${organisationId}/heatmap-summary`)
    return this.extractData(response)
  }

  // Search & Export
  async searchRisks(query: string, params?: RiskQueryParams): Promise<PaginatedResponse<Risk>> {
    return this.getRisks({ ...params, search: query })
  }

  async exportRisks(
    organisationId: string,
    params?: {
      risk_category?: RiskCategory
      status?: RiskStatus
      min_score?: number
      max_score?: number
      format?: 'csv' | 'json'
    }
  ): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      `/risks/export/${organisationId}`,
      `risks_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  // Bulk Operations
  async bulkUpdateStatus(ids: string[], status: RiskStatus): Promise<{ updated: number }> {
    const response = await this.post<{ updated: number }>('/risks/bulk-update-status', {
      ids,
      status,
    })
    return this.extractData(response)
  }

  async bulkAssign(ids: string[], assignedTo: string): Promise<{ updated: number }> {
    const response = await this.post<{ updated: number }>('/risks/bulk-assign', {
      ids,
      assigned_to: assignedTo,
    })
    return this.extractData(response)
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const response = await this.post<{ deleted: number }>('/risks/bulk-delete', { ids })
    return this.extractData(response)
  }

  // Helper Methods
  getRiskScoreLevel(score: number): RiskScoreLevel {
    return getRiskScoreLevel(score)
  }

  getRiskColor(score: number): string {
    return getRiskColor(score)
  }

  getRiskCategories(): RiskCategory[] {
    return Object.values(RiskCategory)
  }

  getRiskStatuses(): RiskStatus[] {
    return Object.values(RiskStatus)
  }

  getRiskTreatments(): RiskTreatment[] {
    return Object.values(RiskTreatment)
  }

  getImpactSeverities(): ImpactSeverity[] {
    return Object.values(ImpactSeverity)
  }
}

export const riskService = new RiskService()
