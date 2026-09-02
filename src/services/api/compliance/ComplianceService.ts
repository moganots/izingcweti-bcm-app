import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  ComplianceStandard,
  ComplianceStatus,
  type ComplianceRecord,
  type CreateComplianceRecordRequest,
  type UpdateComplianceRecordRequest,
  type UpdateComplianceStatusRequest,
  type AddEvidenceRequest,
  type ScheduleAuditRequest,
  type BulkUpdateStatusRequest,
  type ComplianceQueryParams,
  type ComplianceStats,
  type ComplianceSummary,
  type ComplianceGap,
  type ComplianceAuditEntry,
  type ComplianceExportRequest,
  type ComplianceVerificationResult,
  type ComplianceReport,
} from './../../../models/entities/compliance/compliance.entity';
import { PaginatedResponse } from './../../../shared/types/common.types'

/**
 * Compliance Service - Aligned with Backend DTOs (camelCase)
 */
export class ComplianceService extends BaseService {
  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Get compliance records - GET /compliance/records
   */
  async getRecords(params?: ComplianceQueryParams): Promise<PaginatedResponse<ComplianceRecord>> {
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.BASE,
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
   * Get compliance record by ID - GET /compliance/records/:uuid
   */
  async getRecord(id: string): Promise<ComplianceRecord> {
    const response = await this.get<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create compliance record - POST /compliance/records
   */
  async createRecord(data: CreateComplianceRecordRequest): Promise<ComplianceRecord> {
    const response = await this.post<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update compliance record - PUT /compliance/records/:uuid
   */
  async updateRecord(id: string, data: UpdateComplianceRecordRequest): Promise<ComplianceRecord> {
    const response = await this.put<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Delete compliance record - DELETE /compliance/records/:uuid
   */
  async deleteRecord(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
  }

  // ============================================
  // Status & Audit Operations
  // ============================================

  /**
   * Update compliance status - PATCH /compliance/records/:uuid/status
   */
  async updateStatus(id: string, data: UpdateComplianceStatusRequest): Promise<ComplianceRecord> {
    const response = await this.patch<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.UPDATE_STATUS(id),
      data
    )
    return this.extractData(response)
  }

  /**
   * Bulk update compliance status - POST /compliance/bulk-update-status
   */
  async bulkUpdateStatus(data: BulkUpdateStatusRequest): Promise<{ updated: number }> {
    const response = await this.post<{ updated: number }>(
      '/compliance/bulk-update-status',
      data
    )
    return this.extractData(response)
  }

  /**
   * Schedule audit - PATCH /compliance/records/:uuid/schedule-audit
   */
  async scheduleAudit(id: string, data: ScheduleAuditRequest): Promise<ComplianceRecord> {
    const response = await this.patch<ComplianceRecord>(
      `/compliance/records/${id}/schedule-audit`,
      data
    )
    return this.extractData(response)
  }

  /**
   * Add evidence - POST /compliance/records/:uuid/evidence
   */
  async addEvidence(id: string, data: AddEvidenceRequest): Promise<ComplianceRecord> {
    const response = await this.post<ComplianceRecord>(
      `/compliance/records/${id}/evidence`,
      data
    )
    return this.extractData(response)
  }

  /**
   * Remove evidence - DELETE /compliance/records/:uuid/evidence/:index
   */
  async removeEvidence(id: string, index: number): Promise<ComplianceRecord> {
    const response = await this.delete<ComplianceRecord>(
      `/compliance/records/${id}/evidence/${index}`
    )
    return this.extractData(response)
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get records by organisation - GET /compliance/organisation/:organisationId
   */
  async getRecordsByOrganisation(
    organisationId: string,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.BY_ORGANISATION(organisationId),
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
   * Get records by standard - GET /compliance/standard/:standard
   */
  async getRecordsByStandard(
    standard: ComplianceStandard,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.BY_STANDARD(standard),
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
   * Get records by status - GET /compliance/status/:status
   */
  async getRecordsByStatus(
    status: ComplianceStatus,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.BY_STATUS(status),
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
   * Get overdue audits - GET /compliance/overdue
   */
  async getOverdueAudits(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ComplianceRecord>> {
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.OVERDUE,
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
   * Get upcoming audits - GET /compliance/upcoming
   */
  async getUpcomingAudits(
    days: number = 30,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    const response = await this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.UPCOMING,
      { days, ...params } as Record<string, any>
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

  // ============================================
  // Statistics & Analytics
  // ============================================

  /**
   * Get compliance statistics - GET /compliance/stats
   */
  async getStats(organisationId?: string): Promise<ComplianceStats> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<ComplianceStats>(
      API_ENDPOINTS.COMPLIANCE.STATS,
      params
    )
    return this.extractData(response)
  }

  /**
   * Get compliance summary - GET /compliance/summary
   */
  async getSummary(organisationId?: string): Promise<ComplianceSummary> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<ComplianceSummary>(
      API_ENDPOINTS.COMPLIANCE.SUMMARY,
      params
    )
    return this.extractData(response)
  }

  /**
   * Get gap analysis - GET /compliance/gaps
   */
  async getGapAnalysis(organisationId?: string): Promise<ComplianceGap[]> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<ComplianceGap[]>('/compliance/gaps', params)
    return this.extractData(response)
  }

  /**
   * Get audit history - GET /compliance/records/:uuid/audit-history
   */
  async getAuditHistory(id: string): Promise<ComplianceAuditEntry[]> {
    const response = await this.get<ComplianceAuditEntry[]>(
      `/compliance/records/${id}/audit-history`
    )
    return this.extractData(response)
  }

  // ============================================
  // Export & Reporting
  // ============================================

  /**
   * Export compliance records - GET /compliance/export
   */
  async exportRecords(params?: ComplianceExportRequest): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      '/compliance/export',
      `compliance_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  /**
   * Generate compliance report - POST /compliance/generate-report
   */
  async generateReport(
    organisationId: string,
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<ComplianceReport> {
    const response = await this.post<ComplianceReport>(
      '/compliance/generate-report',
      {
        organisationId,
        format,
      }
    )
    return this.extractData(response)
  }

  /**
   * Verify compliance - POST /compliance/verify
   */
  async verifyCompliance(
    organisationId: string,
    standard: ComplianceStandard
  ): Promise<ComplianceVerificationResult> {
    const response = await this.post<ComplianceVerificationResult>(
      '/compliance/verify',
      {
        organisationId,
        complianceStandard: standard,
      }
    )
    return this.extractData(response)
  }

  /**
   * Get records by date range
   */
  async getRecordsByDateRange(
    startDate: string | Date,
    endDate: string | Date,
    params?: ComplianceQueryParams
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getRecords({
      ...params,
      lastAuditDateStart: startDate,
      lastAuditDateEnd: endDate,
    } as any)
  }
}

export const complianceService = new ComplianceService()