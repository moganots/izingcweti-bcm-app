import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  ComplianceStandard,
  ComplianceStatus,
  type ComplianceRecord,
  type CreateComplianceRecordRequest,
  type UpdateComplianceRecordRequest,
  type PaginatedResponse,
} from './../../../modules'

export interface ComplianceQueryParams {
  organisation_id?: string
  compliance_standard?: ComplianceStandard
  compliance_status?: ComplianceStatus
  days?: number
  page?: number
  limit?: number
}

export interface ComplianceStats {
  total: number
  byStandard: Record<string, number>
  byStatus: Record<string, number>
  overallComplianceRate: number
}

export interface ComplianceGap {
  requirement: string
  currentStatus: string
  targetStatus: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface UpdateComplianceStatusRequest {
  compliance_status: ComplianceStatus
  last_audit_date?: string
  next_audit_due?: string
  evidence_links?: string[]
}

export class ComplianceService extends BaseService {
  async getRecords(params?: ComplianceQueryParams): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.BASE,
      params as Record<string, any>
    )
  }

  async getRecord(id: string): Promise<ComplianceRecord> {
    const response = await this.get<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
    return this.extractData(response)
  }

  async createRecord(data: CreateComplianceRecordRequest): Promise<ComplianceRecord> {
    const response = await this.post<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, data)
    return this.extractData(response)
  }

  async updateRecord(id: string, data: UpdateComplianceRecordRequest): Promise<ComplianceRecord> {
    const response = await this.put<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteRecord(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
  }

  async updateStatus(id: string, data: UpdateComplianceStatusRequest): Promise<ComplianceRecord> {
    const response = await this.patch<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.UPDATE_STATUS(id),
      data
    )
    return this.extractData(response)
  }

  async addEvidence(id: string, links: string[]): Promise<ComplianceRecord> {
    const response = await this.post<ComplianceRecord>(`/compliance/${id}/evidence`, {
      evidence_links: links,
    })
    return this.extractData(response)
  }

  async removeEvidence(id: string, index: number): Promise<ComplianceRecord> {
    const response = await this.delete<ComplianceRecord>(`/compliance/${id}/evidence/${index}`)
    return this.extractData(response)
  }

  async getOverdueAudits(): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getRecords({
      compliance_status: ComplianceStatus.NON_COMPLIANT,
    } as ComplianceQueryParams)
  }

  async getUpcomingAudits(days: number = 30): Promise<PaginatedResponse<ComplianceRecord>> {
    const date = new Date()
    date.setDate(date.getDate() + days)
    const params: ComplianceQueryParams = { days: days }
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.UPCOMING,
      params
    )
    return response
  }

  async getRecordsByStandard(
    standard: ComplianceStandard,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getRecords({ ...params, compliance_standard: standard })
  }

  async getRecordsByOrganisation(
    organisationId: string,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getRecords({ ...params, organisation_id: organisationId })
  }

  async getRecordsByStatus(
    status: ComplianceStatus,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getRecords({ ...params, compliance_status: status })
  }

  async getStats(organisationId?: string): Promise<ComplianceStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<ComplianceStats>(API_ENDPOINTS.COMPLIANCE.SUMMARY, params)
    return this.extractData(response)
  }

  async getGapAnalysis(organisationId?: string): Promise<ComplianceGap[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<ComplianceGap[]>('/compliance/gaps', params)
    return this.extractData(response)
  }

  async exportRecords(params?: {
    standard?: ComplianceStandard
    status?: ComplianceStatus
    start_date?: string
    end_date?: string
    format?: 'csv' | 'json'
  }): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      '/compliance/export',
      `compliance_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  async getAuditHistory(id: string): Promise<any[]> {
    const response = await this.get<any[]>(`/compliance/${id}/audit-history`)
    return this.extractData(response)
  }

  async scheduleAudit(id: string, nextAuditDue: string): Promise<ComplianceRecord> {
    const response = await this.patch<ComplianceRecord>(`/compliance/${id}/schedule-audit`, {
      next_audit_due: nextAuditDue,
    })
    return this.extractData(response)
  }

  async bulkUpdateStatus(ids: string[], status: ComplianceStatus): Promise<{ updated: number }> {
    const response = await this.post<{ updated: number }>('/compliance/bulk-update-status', {
      ids,
      compliance_status: status,
    })
    return this.extractData(response)
  }

  async getSummary(organisationId?: string): Promise<{
    totalRecords: number
    compliantRate: number
    overdueCount: number
    upcomingCount: number
    recentUpdates: ComplianceRecord[]
  }> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<{
      totalRecords: number
      compliantRate: number
      overdueCount: number
      upcomingCount: number
      recentUpdates: ComplianceRecord[]
    }>('/compliance/summary', params)
    return this.extractData(response)
  }

  async getRecordsByDateRange(
    startDate: string,
    endDate: string,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getRecords({
      ...params,
      last_audit_date_start: startDate,
      last_audit_date_end: endDate,
    } as any)
  }

  async verifyCompliance(
    organisationId: string,
    standard: ComplianceStandard
  ): Promise<{
    verified: boolean
    score: number
    missingRequirements: string[]
    recommendations: string[]
  }> {
    const response = await this.post<{
      verified: boolean
      score: number
      missingRequirements: string[]
      recommendations: string[]
    }>('/compliance/verify', {
      organisation_id: organisationId,
      compliance_standard: standard,
    })
    return this.extractData(response)
  }

  async generateReport(
    organisationId: string,
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<{ reportUrl: string; generatedAt: string }> {
    const response = await this.post<{ reportUrl: string; generatedAt: string }>(
      '/compliance/generate-report',
      {
        organisation_id: organisationId,
        format,
      }
    )
    return this.extractData(response)
  }
}

export const complianceService = new ComplianceService()
