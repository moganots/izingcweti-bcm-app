import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import type { ComplianceQueryParams, PaginatedResponse } from './../../../types'
import {
    AddEvidenceRequest,
    BulkUpdateStatusRequest,
    ComplianceAuditHistoryEntry,
    ComplianceGap,
    ComplianceRecord,
    ComplianceStats,
    CreateComplianceRecordRequest,
    ScheduleAuditRequest,
    UpdateComplianceRecordRequest,
    UpdateComplianceStatusRequest,
} from './../../../models/entities'

/**
 * Compliance API Service
 */
export class ComplianceService extends BaseService {
    /**
     * Get all compliance records with pagination and filters
     */
    async getRecords(params?: ComplianceQueryParams): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(
            API_ENDPOINTS.COMPLIANCE.BASE,
            params as Record<string, any>
        )
    }

    /**
     * Get compliance record by ID
     */
    async getRecord(id: string): Promise<ComplianceRecord> {
        const response = await this.get<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
        return this.extractData(response)
    }

    /**
     * Create a new compliance record
     */
    async createRecord(data: CreateComplianceRecordRequest): Promise<ComplianceRecord> {
        const response = await this.post<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, data)
        return this.extractData(response)
    }

    /**
     * Update a compliance record
     */
    async updateRecord(id: string, data: UpdateComplianceRecordRequest): Promise<ComplianceRecord> {
        const response = await this.put<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id), data)
        return this.extractData(response)
    }

    /**
     * Delete a compliance record
     */
    async deleteRecord(id: string): Promise<void> {
        await this.delete(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
    }

    /**
     * Update compliance status
     * Fixed: Use API endpoint constant
     */
    async updateStatus(id: string, data: UpdateComplianceStatusRequest): Promise<ComplianceRecord> {
        const response = await this.patch<ComplianceRecord>(
            API_ENDPOINTS.COMPLIANCE.UPDATE_STATUS(id),
            data
        )
        return this.extractData(response)
    }

    /**
     * Add evidence links to a compliance record
     * Fixed: Use API endpoint constant
     */
    async addEvidence(id: string, links: string[]): Promise<ComplianceRecord> {
        const response = await this.post<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.ADD_EVIDENCE(id), {
            evidence_links: links,
        } as AddEvidenceRequest)
        return this.extractData(response)
    }

    /**
     * Remove an evidence link from a compliance record
     * Fixed: Use API endpoint constant
     */
    async removeEvidence(id: string, index: number): Promise<ComplianceRecord> {
        const response = await this.delete<ComplianceRecord>(
            `${API_ENDPOINTS.COMPLIANCE.REMOVE_EVIDENCE(id)}?index=${index}`
        )
        return this.extractData(response)
    }

    /**
     * Get overdue audit records
     * Fixed: Use query parameter instead of missing constant
     */
    async getOverdueAudits(): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(`${API_ENDPOINTS.COMPLIANCE.BASE}?is_overdue=true`)
    }

    /**
     * Get upcoming audits within specified days
     * Fixed: Use query parameter instead of missing constant
     */
    async getUpcomingAudits(days: number = 30): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(
            `${API_ENDPOINTS.COMPLIANCE.BASE}?upcoming_days=${days}`
        )
    }

    /**
     * Get compliance records by standard
     */
    async getRecordsByStandard(
        standard: string,
        params?: ComplianceQueryParams
    ): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(
            API_ENDPOINTS.COMPLIANCE.BY_STANDARD(standard),
            params as Record<string, any>
        )
    }

    /**
     * Get compliance records by organisation
     */
    async getRecordsByOrganisation(
        organisationId: string,
        params?: ComplianceQueryParams
    ): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(
            API_ENDPOINTS.COMPLIANCE.BY_ORGANISATION(organisationId),
            {
                ...params,
            } as Record<string, any>
        )
    }

    /**
     * Get compliance records by status
     */
    async getRecordsByStatus(
        status: string,
        params?: ComplianceQueryParams
    ): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, {
            ...params,
            compliance_status: status,
        } as Record<string, any>)
    }

    /**
     * Get compliance statistics
     * Fixed: Use API endpoint constant
     */
    async getStats(organisationId?: string): Promise<ComplianceStats> {
        let url = API_ENDPOINTS.COMPLIANCE.STATS('')
        if (organisationId) {
            url = API_ENDPOINTS.COMPLIANCE.STATS(organisationId)
        }
        const response = await this.get<ComplianceStats>(url)
        return this.extractData(response)
    }

    /**
     * Get compliance gap analysis
     * Fixed: Use API endpoint constant
     */
    async getGapAnalysis(organisationId?: string): Promise<ComplianceGap[]> {
        let url = API_ENDPOINTS.COMPLIANCE.GAPS('')
        if (organisationId) {
            url = API_ENDPOINTS.COMPLIANCE.GAPS(organisationId)
        }
        const response = await this.get<ComplianceGap[]>(url)
        return this.extractData(response)
    }

    /**
     * Export compliance records
     * Fixed: Use API endpoint constant
     */
    async exportRecords(params?: {
        standard?: string
        status?: string
        start_date?: string
        end_date?: string
        format?: 'csv' | 'json'
    }): Promise<void> {
        const format = params?.format || 'csv'
        await this.download(
            API_ENDPOINTS.COMPLIANCE.EXPORT,
            `compliance_export_${new Date().toISOString().split('T')[0]}.${format}`,
            { params }
        )
    }

    /**
     * Get compliance audit history for a record
     * Fixed: Use API endpoint constant
     */
    async getAuditHistory(id: string): Promise<ComplianceAuditHistoryEntry[]> {
        const response = await this.get<ComplianceAuditHistoryEntry[]>(
            API_ENDPOINTS.COMPLIANCE.AUDIT_HISTORY(id)
        )
        return this.extractData(response)
    }

    /**
     * Schedule next audit
     * Fixed: Use API endpoint constant
     */
    async scheduleAudit(id: string, data: ScheduleAuditRequest): Promise<ComplianceRecord> {
        const response = await this.patch<ComplianceRecord>(
            API_ENDPOINTS.COMPLIANCE.SCHEDULE_AUDIT(id),
            data
        )
        return this.extractData(response)
    }

    /**
     * Bulk update compliance status
     * Fixed: Use API endpoint constant
     */
    async bulkUpdateStatus(ids: string[], status: string): Promise<{ updated: number }> {
        const response = await this.post<{ updated: number }>(API_ENDPOINTS.COMPLIANCE.BULK_UPDATE, {
            ids,
            compliance_status: status,
        } as BulkUpdateStatusRequest)
        return this.extractData(response)
    }

    // ============================================
    // Additional Helper Methods
    // ============================================

    /**
     * Get compliance summary for dashboard
     */
    async getSummary(organisationId?: string): Promise<{
        totalRecords: number
        compliantRate: number
        overdueCount: number
        upcomingCount: number
        recentUpdates: ComplianceRecord[]
    }> {
        const params: Record<string, any> = {}
        if (organisationId) params.organisation_id = organisationId

        const response = await this.get<{
            totalRecords: number
            compliantRate: number
            overdueCount: number
            upcomingCount: number
            recentUpdates: ComplianceRecord[]
        }>(`${API_ENDPOINTS.COMPLIANCE.BASE}/summary`, params)
        return this.extractData(response)
    }

    /**
     * Get compliance by date range
     */
    async getRecordsByDateRange(
        startDate: string,
        endDate: string,
        params?: ComplianceQueryParams
    ): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, {
            ...params,
            last_audit_date_start: startDate,
            last_audit_date_end: endDate,
        } as Record<string, any>)
    }

    /**
     * Verify compliance against standard
     */
    async verifyCompliance(
        organisationId: string,
        standard: string
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
        }>(`${API_ENDPOINTS.COMPLIANCE.BASE}/verify`, {
            organisation_id: organisationId,
            compliance_standard: standard,
        })
        return this.extractData(response)
    }

    /**
     * Generate compliance report
     */
    async generateReport(
        organisationId: string,
        format: 'pdf' | 'html' = 'pdf'
    ): Promise<{ reportUrl: string; generatedAt: string }> {
        const response = await this.post<{ reportUrl: string; generatedAt: string }>(
            `${API_ENDPOINTS.COMPLIANCE.BASE}/generate-report`,
            { organisation_id: organisationId, format }
        )
        return this.extractData(response)
    }
}

// Export singleton
export const complianceService = new ComplianceService()
