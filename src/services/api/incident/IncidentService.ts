import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from './../../../utils/constants'
import type { IncidentQueryParams, PaginatedResponse, QueryParams } from './../../../types'
import type { Incident, IncidentSeverity, IncidentStats } from './../../../models/entities'

/**
 * Create Incident DTO
 */
export interface CreateIncidentDTO {
  organisation_id: string
  incident_severity: string
  root_cause: string
  business_continuity_plan_id_activated: string
  recovery_actual_time?: string
}

/**
 * Update Incident DTO
 */
export interface UpdateIncidentDTO {
  incident_severity?: string
  root_cause?: string
  business_continuity_plan_id_activated?: string
  recovery_actual_time?: string
}

/**
 * Close Incident DTO
 */
export interface CloseIncidentDTO {
  closed_at: string
}

/**
 * Incident API Service
 */
export class IncidentService extends BaseService {
  /**
   * Get all incidents with pagination
   */
  async getIncidents(params?: IncidentQueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, params)
  }

  /**
   * Get incident by ID
   */
  async getIncident(id: string): Promise<Incident> {
    const response = await this.get<Incident>(API_ENDPOINTS.INCIDENTS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create a new incident
   */
  async createIncident(data: CreateIncidentDTO): Promise<Incident> {
    const response = await this.post<Incident>(API_ENDPOINTS.INCIDENTS.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update an incident
   */
  async updateIncident(id: string, data: UpdateIncidentDTO): Promise<Incident> {
    const response = await this.put<Incident>(API_ENDPOINTS.INCIDENTS.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Close an incident
   */
  async closeIncident(id: string, data: CloseIncidentDTO): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.CLOSE(id), data)
    return this.extractData(response)
  }

  /**
   * Reopen a closed incident
   * Fixed: Use proper endpoint (reopen via update with closed_at = null)
   */
  async reopenIncident(id: string): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.BY_ID(id), {
      closed_at: null,
    })
    return this.extractData(response)
  }

  /**
   * Escalate an incident
   */
  async escalateIncident(id: string): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.ESCALATE(id))
    return this.extractData(response)
  }

  /**
   * Get active incidents
   * Fixed: Use query parameter instead of missing constant
   */
  async getActiveIncidents(params?: QueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(`${API_ENDPOINTS.INCIDENTS.BASE}?status=active`, params)
  }

  /**
   * Get critical incidents
   * Fixed: Use query parameter instead of missing constant
   */
  async getCriticalIncidents(params?: QueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(`${API_ENDPOINTS.INCIDENTS.BASE}?severity=Critical`, params)
  }

  /**
   * Get high severity incidents
   */
  async getHighSeverityIncidents(params?: QueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(`${API_ENDPOINTS.INCIDENTS.BASE}?severity=High`, params)
  }

  /**
   * Get incidents by organisation
   */
  async getIncidentsByOrganisation(
    organisationId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    const queryParams = { ...params, organisation_id: organisationId }
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, queryParams)
  }

  /**
   * Get incidents by severity
   */
  async getIncidentsBySeverity(
    severity: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    const queryParams = { ...params, incident_severity: severity as IncidentSeverity }
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, queryParams)
  }

  /**
   * Get incidents by date range
   */
  async getIncidentsByDateRange(
    startDate: string,
    endDate: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    const queryParams = {
      ...params,
      declared_after: startDate,
      declared_before: endDate,
    }
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, queryParams)
  }

  /**
   * Get incident statistics
   * Fixed: Use API_ENDPOINTS.INCIDENTS.STATS
   */
  async getStats(organisationId?: string): Promise<IncidentStats> {
    let url = API_ENDPOINTS.INCIDENTS.STATS('')
    if (organisationId) {
      url = API_ENDPOINTS.INCIDENTS.STATS(organisationId)
    }
    const response = await this.get<IncidentStats>(url)
    return this.extractData(response)
  }

  /**
   * Get incident summary for dashboard
   */
  async getSummary(organisationId?: string): Promise<{
    total: number
    active: number
    resolved: number
    closed: number
    critical: number
    high: number
    medium: number
    low: number
    avgResolutionTimeHours: number
  }> {
    const stats = await this.getStats(organisationId)
    return {
      total: stats.total,
      active: stats.active,
      resolved: stats.active > 0 ? stats.active : 0,
      closed: stats.closed,
      critical: stats.critical,
      high: stats.bySeverity?.High || 0,
      medium: stats.bySeverity?.Medium || 0,
      low: stats.bySeverity?.Low || 0,
      avgResolutionTimeHours: stats.avgResolutionTime || 0,
    }
  }

  /**
   * Delete an incident (soft delete)
   */
  async deleteIncident(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.INCIDENTS.BY_ID(id))
  }

  /**
   * Export incidents
   */
  async exportIncidents(
    organisationId: string,
    params?: {
      start_date?: string
      end_date?: string
      format?: 'csv' | 'json'
    }
  ): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      API_ENDPOINTS.INCIDENTS.EXPORT(organisationId),
      `incidents_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params }
    )
  }

  /**
   * Search incidents
   */
  async searchIncidents(
    query: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.SEARCH, {
      ...params,
      search: query,
    })
  }

  /**
   * Get incidents by BCP activated
   */
  async getIncidentsByBCP(
    bcpId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    const queryParams = { ...params, business_continuity_plan_id_activated: bcpId }
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, queryParams)
  }
}

// Export singleton
export const incidentService = new IncidentService()
