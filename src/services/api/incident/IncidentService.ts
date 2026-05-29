import { BaseService } from './../../BaseService'
import {
  IncidentSeverity,
  type Incident,
  type IncidentUpdate,
  type IncidentResponsePlan,
  type ResponseAction,
  type IncidentRecoveryMetrics,
  type IncidentReport,
  type IncidentTimeline,
  type CreateIncidentRequest,
  type UpdateIncidentRequest,
  type EscalateIncidentRequest,
  type CloseIncidentRequest,
  type IncidentQueryParams,
  type IncidentDashboardStats,
  type PaginatedResponse,
} from './../../../modules'

export class IncidentService extends BaseService {
  async getIncidents(params?: IncidentQueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getPaginated<Incident>('/incidents', params as Record<string, any>)
  }

  async getIncident(id: string): Promise<Incident> {
    const response = await this.get<Incident>(`/incidents/${id}`)
    return this.extractData(response)
  }

  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    const response = await this.post<Incident>('/incidents', data)
    return this.extractData(response)
  }

  async updateIncident(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    const response = await this.put<Incident>(`/incidents/${id}`, data)
    return this.extractData(response)
  }

  async closeIncident(id: string, data: CloseIncidentRequest): Promise<Incident> {
    const response = await this.patch<Incident>(`/incidents/${id}/close`, data)
    return this.extractData(response)
  }

  async reopenIncident(id: string): Promise<Incident> {
    const response = await this.patch<Incident>(`/incidents/${id}/reopen`)
    return this.extractData(response)
  }

  async escalateIncident(id: string, data: EscalateIncidentRequest): Promise<Incident> {
    const response = await this.patch<Incident>(`/incidents/${id}/escalate`, data)
    return this.extractData(response)
  }

  async assignIncident(id: string, assignedTo: string): Promise<Incident> {
    const response = await this.patch<Incident>(`/incidents/${id}/assign`, {
      assigned_to: assignedTo,
    })
    return this.extractData(response)
  }

  async addIncidentUpdate(id: string, update: IncidentUpdate): Promise<Incident> {
    const response = await this.post<Incident>(`/incidents/${id}/updates`, update)
    return this.extractData(response)
  }

  async getActiveIncidents(params?: IncidentQueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, active_only: true })
  }

  async getCriticalIncidents(params?: IncidentQueryParams): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, incident_severity: IncidentSeverity.CRITICAL })
  }

  async getHighSeverityIncidents(
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, incident_severity: IncidentSeverity.HIGH })
  }

  async getIncidentsByOrganisation(
    organisationId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, organisation_id: organisationId })
  }

  async getIncidentsBySeverity(
    severity: IncidentSeverity,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, incident_severity: severity })
  }

  async getIncidentsByDateRange(
    startDate: string,
    endDate: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, declared_after: startDate, declared_before: endDate })
  }

  async getIncidentsByBCP(
    bcpId: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, business_continuity_plan_id_activated: bcpId })
  }

  async getStats(organisationId?: string): Promise<IncidentDashboardStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<IncidentDashboardStats>('/incidents/stats', params)
    return this.extractData(response)
  }

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
      resolved: stats.active,
      closed: stats.closed,
      critical: stats.critical,
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
      avgResolutionTimeHours: stats.average_resolution_hours,
    }
  }

  async deleteIncident(id: string): Promise<void> {
    await this.delete(`/incidents/${id}`)
  }

  async exportIncidents(
    organisationId: string,
    params?: { start_date?: string; end_date?: string; format?: 'csv' | 'json' }
  ): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      `/incidents/export/${organisationId}`,
      `incidents_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  async searchIncidents(
    query: string,
    params?: IncidentQueryParams
  ): Promise<PaginatedResponse<Incident>> {
    return this.getIncidents({ ...params, root_cause_search: query })
  }

  async getIncidentResponsePlan(incidentId: string): Promise<IncidentResponsePlan> {
    const response = await this.get<IncidentResponsePlan>(`/incidents/${incidentId}/response-plan`)
    return this.extractData(response)
  }

  async activateResponsePlan(incidentId: string, planId: string): Promise<IncidentResponsePlan> {
    const response = await this.post<IncidentResponsePlan>(
      `/incidents/${incidentId}/activate-plan`,
      { plan_id: planId }
    )
    return this.extractData(response)
  }

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

  async getRecoveryMetrics(incidentId: string): Promise<IncidentRecoveryMetrics> {
    const response = await this.get<IncidentRecoveryMetrics>(
      `/incidents/${incidentId}/recovery-metrics`
    )
    return this.extractData(response)
  }

  async getIncidentReport(
    incidentId: string,
    reportType: IncidentReport['report_type']
  ): Promise<IncidentReport> {
    const response = await this.get<IncidentReport>(`/incidents/${incidentId}/report/${reportType}`)
    return this.extractData(response)
  }

  async getIncidentTimeline(incidentId: string): Promise<IncidentTimeline> {
    const response = await this.get<IncidentTimeline>(`/incidents/${incidentId}/timeline`)
    return this.extractData(response)
  }
}

export const incidentService = new IncidentService()
