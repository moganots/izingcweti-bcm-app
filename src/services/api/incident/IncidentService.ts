import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  IncidentSeverity,
  type Incident,
  type IncidentResponsePlan,
  type ResponseAction,
  type IncidentRecoveryMetrics,
  type IncidentReport,
  type IncidentTimeline,
  type CreateIncidentRequest,
  type UpdateIncidentRequest,
  type EscalateIncidentRequest,
  type CloseIncidentRequest,
  type AssignIncidentRequest,
  type AcknowledgeIncidentRequest,
  type AddIncidentUpdateRequest,
  type IncidentQueryParams,
  type IncidentDashboardStats,
  type IncidentStats,
} from './../../../models/entities/incident/incident.entity'
import { PaginatedResponse } from './../../../shared/types/common.types'

/**
 * Incident Service - Aligned with Backend DTOs (camelCase)
 */
export class IncidentService extends BaseService {
  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Get incidents - GET /incidents
   */
  async getIncidents(params?: IncidentQueryParams): Promise<PaginatedResponse<Incident>> {
    const response = await this.getPaginated<Incident>(
      API_ENDPOINTS.INCIDENTS.BASE,
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

  /**
   * Get incident by ID - GET /incidents/:uuid
   */
  async getIncident(id: string): Promise<Incident> {
    const response = await this.get<Incident>(API_ENDPOINTS.INCIDENTS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create incident - POST /incidents
   */
  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    const response = await this.post<Incident>(API_ENDPOINTS.INCIDENTS.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update incident - PUT /incidents/:uuid
   */
  async updateIncident(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    const response = await this.put<Incident>(API_ENDPOINTS.INCIDENTS.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Delete incident - DELETE /incidents/:uuid
   */
  async deleteIncident(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.INCIDENTS.BY_ID(id))
  }

  // ============================================
  // Incident Actions
  // ============================================

  /**
   * Close incident - PATCH /incidents/:uuid/close
   */
  async closeIncident(id: string, data: CloseIncidentRequest): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.CLOSE(id), data)
    return this.extractData(response)
  }

  /**
   * Reopen incident - PATCH /incidents/:uuid/reopen
   */
  async reopenIncident(id: string): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.REOPEN(id))
    return this.extractData(response)
  }

  /**
   * Escalate incident - PATCH /incidents/:uuid/escalate
   */
  async escalateIncident(id: string, data: EscalateIncidentRequest): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.ESCALATE(id), data)
    return this.extractData(response)
  }

  /**
   * Assign incident - PATCH /incidents/:uuid/assign
   */
  async assignIncident(id: string, data: AssignIncidentRequest): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.ASSIGN(id), data)
    return this.extractData(response)
  }

  /**
   * Acknowledge incident - PATCH /incidents/:uuid/acknowledge
   */
  async acknowledgeIncident(id: string, data: AcknowledgeIncidentRequest): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.ACKNOWLEDGE(id), data)
    return this.extractData(response)
  }

  /**
   * Add incident update - POST /incidents/:uuid/updates
   */
  async addIncidentUpdate(id: string, data: AddIncidentUpdateRequest): Promise<Incident> {
    const response = await this.post<Incident>(API_ENDPOINTS.INCIDENTS.ADD_UPDATE(id), data)
    return this.extractData(response)
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get active incidents - GET /incidents/active
   */
  async getActiveIncidents(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.ACTIVE, params as Record<string, any>)
  }

  /**
   * Get closed incidents - GET /incidents/closed
   */
  async getClosedIncidents(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.CLOSED, params as Record<string, any>)
  }

  /**
   * Get critical incidents - GET /incidents/critical
   */
  async getCriticalIncidents(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.CRITICAL, params as Record<string, any>)
  }

  /**
   * Get incidents by organisation - GET /incidents/organisation/:organisationId
   */
  async getIncidentsByOrganisation(
    organisationId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, organisationId })
  }

  /**
   * Get incidents by severity - GET /incidents/severity/:severity
   */
  async getIncidentsBySeverity(
    severity: IncidentSeverity,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, incidentSeverity: severity })
  }

  /**
   * Get incidents by BCP - GET /incidents/bcp/:bcpId
   */
  async getIncidentsByBCP(
    bcpId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, businessContinuityPlanIdActivated: bcpId })
  }

  /**
   * Get incidents by date range - GET /incidents/date-range
   */
  async getIncidentsByDateRange(
    startDate: string | Date,
    endDate: string | Date,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({
      ...params,
      declaredAfter: startDate,
      declaredBefore: endDate,
    })
  }

  /**
   * Search incidents - GET /incidents?rootCauseSearch=...
   */
  async searchIncidents(
    query: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, rootCauseSearch: query })
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get incident statistics - GET /incidents/stats
   */
  async getStats(organisationId?: string): Promise<IncidentDashboardStats> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<IncidentDashboardStats>('/incidents/stats', params)
    return this.extractData(response)
  }

  /**
   * Get incident summary - GET /incidents/summary
   */
  async getSummary(organisationId?: string): Promise<IncidentStats> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<IncidentStats>('/incidents/summary', params)
    return this.extractData(response)
  }

  // ============================================
  // Export
  // ============================================

  /**
   * Export incidents - GET /incidents/export/:organisationId
   */
  async exportIncidents(
    organisationId: string,
    params?: { startDate?: string | Date; endDate?: string | Date; format?: 'csv' | 'json' }
  ): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      `/incidents/export/${organisationId}`,
      `incidents_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  // ============================================
  // Response Plan & Recovery Metrics
  // ============================================

  /**
   * Get incident response plan - GET /incidents/:uuid/response-plan
   */
  async getIncidentResponsePlan(incidentId: string): Promise<IncidentResponsePlan> {
    const response = await this.get<IncidentResponsePlan>(`/incidents/${incidentId}/response-plan`)
    return this.extractData(response)
  }

  /**
   * Activate response plan - POST /incidents/:uuid/activate-plan
   */
  async activateResponsePlan(incidentId: string, planId: string): Promise<IncidentResponsePlan> {
    const response = await this.post<IncidentResponsePlan>(
      `/incidents/${incidentId}/activate-plan`,
      { planId }
    )
    return this.extractData(response)
  }

  /**
   * Update response action - PATCH /incidents/:uuid/response-plan/actions/:actionId
   */
  async updateResponseAction(
    incidentId: string,
    actionId: string,
    updates: Partial<ResponseAction>
  ): Promise<ResponseAction> {
    const response = await this.patch<ResponseAction>(
      `/incidents/${incidentId}/response-plan/actions/${actionId}`,
      updates
    )
    return this.extractData(response)
  }

  /**
   * Get recovery metrics - GET /incidents/:uuid/recovery-metrics
   */
  async getRecoveryMetrics(incidentId: string): Promise<IncidentRecoveryMetrics> {
    const response = await this.get<IncidentRecoveryMetrics>(
      `/incidents/${incidentId}/recovery-metrics`
    )
    return this.extractData(response)
  }

  /**
   * Get incident report - GET /incidents/:uuid/report/:reportType
   */
  async getIncidentReport(
    incidentId: string,
    reportType: IncidentReport['reportType']
  ): Promise<IncidentReport> {
    const response = await this.get<IncidentReport>(`/incidents/${incidentId}/report/${reportType}`)
    return this.extractData(response)
  }

  /**
   * Get incident timeline - GET /incidents/:uuid/timeline
   */
  async getIncidentTimeline(incidentId: string): Promise<IncidentTimeline> {
    const response = await this.get<IncidentTimeline>(`/incidents/${incidentId}/timeline`)
    return this.extractData(response)
  }
}

export const incidentService = new IncidentService()