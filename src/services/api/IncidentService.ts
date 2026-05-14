import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse, QueryParams } from '../../types/common.types'
import type { IncidentQueryParams } from '../../types/bcm.types'
import type {
  Incident,
  IncidentSeverity,
  IncidentStats,
} from '../../models/entities/incident.entity'

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
   */
  async reopenIncident(id: string): Promise<Incident> {
    const response = await this.patch<Incident>(API_ENDPOINTS.INCIDENTS.REOPEN(id))
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
   */
  async getActiveIncidents(params?: QueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.ACTIVE, params)
  }

  /**
   * Get critical incidents
   */
  async getCriticalIncidents(): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.CRITICAL)
  }

  /**
   * Get incidents by organisation
   */
  async getIncidentsByOrganisation(
    organisationId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    params = { ...params, organisation_id: organisationId! }
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, params)
  }

  /**
   * Get incidents by severity
   */
  async getIncidentsBySeverity(
    severity: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    params = { ...params, incident_severity: severity! as IncidentSeverity }
    return this.getPaginated<Incident>(API_ENDPOINTS.INCIDENTS.BASE, params)
  }

  /**
   * Get incident statistics
   */
  async getStats(organisationId?: string): Promise<IncidentStats> {
    const params: Record<string, unknown> = {}
    if (organisationId) {
      params.organisation_id = organisationId
    }
    const response = await this.get<IncidentStats>('/incidents/stats', params)
    return this.extractData(response)
  }
}

// Export singleton
export const incidentService = new IncidentService()
