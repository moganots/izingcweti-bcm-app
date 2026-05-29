import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  AuditAction,
  AuditCategory,
  AuditSeverity,
  type AuditLog,
  type AuditRetentionPolicy,
  type AuditStats,
  type AuditSummary,
  type AuditCleanupResult,
  type AuditReplayRequest,
  type AuditReplayResult,
  type AuditAnomalyDetection,
  type AuditAnomaly,
  type CreateAuditLogRequest,
  type AuditQueryParams,
  type AuditRetentionPolicyRequest,
  type ExportAuditRequest,
  type PaginatedResponse,
} from './../../../modules'

export class AuditService extends BaseService {
  async getLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
    return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, params as Record<string, any>)
  }

  async getLog(id: string): Promise<AuditLog> {
    const response = await this.get<AuditLog>(API_ENDPOINTS.AUDIT.BY_ID(id))
    return this.extractData(response)
  }

  async getLogsByUser(
    userId: string,
    params?: AuditQueryParams
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, user_id: userId })
  }

  async getLogsByEntity(
    entityType: string,
    entityId: string,
    params?: AuditQueryParams
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, entity_type: entityType, entity_id: entityId })
  }

  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
    const response = await this.get<AuditLog[]>(
      API_ENDPOINTS.AUDIT.ENTITY_HISTORY(entityType, entityId)
    )
    return this.extractData(response)
  }

  async getStats(params?: {
    organisation_id?: string
    start_date?: string
    end_date?: string
  }): Promise<AuditStats> {
    const response = await this.get<AuditStats>(
      API_ENDPOINTS.AUDIT.STATS,
      params as Record<string, any>
    )
    return this.extractData(response)
  }

  async getSummary(organisationId?: string): Promise<AuditSummary> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<AuditSummary>(API_ENDPOINTS.AUDIT.SUMMARY, params)
    return this.extractData(response)
  }

  async exportLogs(data: ExportAuditRequest): Promise<void> {
    const format = data.format || 'csv'
    const filename = `audit_export_${new Date().toISOString().split('T')[0]}.${format}`
    await this.download(API_ENDPOINTS.AUDIT.EXPORT, filename, {
      params: data as Record<string, any>,
    })
  }

  async getSensitiveLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, sensitive_only: true })
  }

  async createLog(data: CreateAuditLogRequest): Promise<AuditLog> {
    const response = await this.post<AuditLog>(API_ENDPOINTS.AUDIT.BASE, data)
    return this.extractData(response)
  }

  async cleanupOldLogs(retentionDays?: number): Promise<AuditCleanupResult> {
    const response = await this.post<AuditCleanupResult>(API_ENDPOINTS.AUDIT.CLEANUP, {
      retention_days: retentionDays,
    })
    return this.extractData(response)
  }

  async replayLogs(request: AuditReplayRequest): Promise<AuditReplayResult> {
    const response = await this.post<AuditReplayResult>('/audit/replay', request)
    return this.extractData(response)
  }

  async detectAnomalies(period: string): Promise<AuditAnomalyDetection> {
    const response = await this.get<AuditAnomalyDetection>('/audit/anomalies', { period })
    return this.extractData(response)
  }

  async resolveAnomaly(anomalyId: string, status: AuditAnomaly['status']): Promise<AuditAnomaly> {
    const response = await this.patch<AuditAnomaly>(`/audit/anomalies/${anomalyId}`, { status })
    return this.extractData(response)
  }

  async getRetentionPolicies(organisationId?: string): Promise<AuditRetentionPolicy[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<AuditRetentionPolicy[]>(
      API_ENDPOINTS.AUDIT.RETENTION_POLICIES,
      params
    )
    return this.extractData(response)
  }

  async getRetentionPolicy(id: string): Promise<AuditRetentionPolicy> {
    const response = await this.get<AuditRetentionPolicy>(
      API_ENDPOINTS.AUDIT.RETENTION_POLICY_BY_ID(id)
    )
    return this.extractData(response)
  }

  async createRetentionPolicy(data: AuditRetentionPolicyRequest): Promise<AuditRetentionPolicy> {
    const response = await this.post<AuditRetentionPolicy>(
      API_ENDPOINTS.AUDIT.RETENTION_POLICIES,
      data
    )
    return this.extractData(response)
  }

  async updateRetentionPolicy(
    id: string,
    data: Partial<AuditRetentionPolicyRequest>
  ): Promise<AuditRetentionPolicy> {
    const response = await this.put<AuditRetentionPolicy>(
      API_ENDPOINTS.AUDIT.RETENTION_POLICY_BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteRetentionPolicy(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.AUDIT.RETENTION_POLICY_BY_ID(id))
  }

  async applyRetentionPolicies(): Promise<AuditCleanupResult> {
    const response = await this.post<AuditCleanupResult>(API_ENDPOINTS.AUDIT.APPLY_RETENTION)
    return this.extractData(response)
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const response = await this.get<AuditLog[]>(API_ENDPOINTS.AUDIT.USER_ACTIVITY(userId), {
      limit,
    })
    return this.extractData(response)
  }

  async getMyActivity(limit: number = 50): Promise<AuditLog[]> {
    const response = await this.get<AuditLog[]>('/audit/my-activity', { limit })
    return this.extractData(response)
  }

  async searchLogs(query: string, params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, search: query })
  }

  async getLogsByAction(
    action: AuditAction,
    params?: AuditQueryParams
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, action })
  }

  async getLogsByCategory(
    category: AuditCategory,
    params?: AuditQueryParams
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, audit_category: category })
  }

  async getLogsBySeverity(
    severity: AuditSeverity,
    params?: AuditQueryParams
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, severity })
  }

  async getLogsByDateRange(
    startDate: string,
    endDate: string,
    params?: AuditQueryParams
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getLogs({ ...params, start_date: startDate, end_date: endDate })
  }
}

export const auditService = new AuditService()
