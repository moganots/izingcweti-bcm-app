import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { ComplianceQueryParams } from '../../types/bcm.types'

/**
 * Compliance Record interface
 */
export interface ComplianceRecord {
    uuid: string
    organisation_id: string
    compliance_standard: string
    compliance_status: string
    last_audit_date: string
    next_audit_due: string
    evidence_links?: string[]
    organisation?: {
        uuid: string
        name: string
    }
    created_by: string
    created_at: string
    updated_by: string
    updated_at: string
    version: number
    sync_status: string
}

/**
 * Create Compliance Record Request
 */
export interface CreateComplianceRecordRequest {
    organisation_id: string
    compliance_standard: string
    compliance_status: string
    last_audit_date: string
    next_audit_due: string
    evidence_links?: string[]
}

/**
 * Update Compliance Record Request
 */
export interface UpdateComplianceRecordRequest {
    compliance_status?: string
    last_audit_date?: string
    next_audit_due?: string
    evidence_links?: string[]
}

/**
 * Update Compliance Status Request
 */
export interface UpdateComplianceStatusRequest {
    compliance_status: string
    last_audit_date?: string
}

/**
 * Add Evidence Request
 */
export interface AddEvidenceRequest {
    evidence_links: string[]
}

/**
 * Compliance Statistics
 */
export interface ComplianceStats {
    total: number
    compliant: number
    partially: number
    nonCompliant: number
    overdueAudits: number
    upcomingAudits: number
    complianceRate: number
    byStandard: Record<string, number>
    byStatus: Record<string, number>
}

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
     */
    async updateStatus(id: string, data: UpdateComplianceStatusRequest): Promise<ComplianceRecord> {
        const response = await this.patch<ComplianceRecord>(
            `${API_ENDPOINTS.COMPLIANCE.BASE}/${id}/status`,
            data
        )
        return this.extractData(response)
    }

    /**
     * Add evidence links to a compliance record
     */
    async addEvidence(id: string, links: string[]): Promise<ComplianceRecord> {
        const response = await this.patch<ComplianceRecord>(
            `${API_ENDPOINTS.COMPLIANCE.BASE}/${id}/evidence`,
            { evidence_links: links } as AddEvidenceRequest
        )
        return this.extractData(response)
    }

    /**
     * Remove an evidence link from a compliance record
     */
    async removeEvidence(id: string, index: number): Promise<ComplianceRecord> {
        const response = await this.patch<ComplianceRecord>(
            `${API_ENDPOINTS.COMPLIANCE.BASE}/${id}/evidence/remove`,
            { index }
        )
        return this.extractData(response)
    }

    /**
     * Get overdue audit records
     */
    async getOverdueAudits(): Promise<PaginatedResponse<ComplianceRecord>> {
        return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.OVERDUE)
    }

    /**
     * Get upcoming audits within specified days
     */
    async getUpcomingAudits(days: number = 30): Promise<PaginatedResponse<ComplianceRecord>> {
        const params = { days } as ComplianceQueryParams
        return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.UPCOMING, params)
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
        return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, {
            ...params,
            organisation_id: organisationId,
        } as Record<string, any>)
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
     */
    async getStats(organisationId?: string): Promise<ComplianceStats> {
        const params: Record<string, any> = {}
        if (organisationId) {
            params.organisation_id = organisationId
        }
        const response = await this.get<ComplianceStats>('/compliance/stats', params)
        return this.extractData(response)
    }

    /**
     * Get compliance gap analysis
     */
    async getGapAnalysis(organisationId?: string): Promise<
        Array<{
            requirement: string
            currentStatus: string
            targetStatus: string
            actionItems: string[]
            priority: 'high' | 'medium' | 'low'
        }>
    > {
        const params: Record<string, any> = {}
        if (organisationId) {
            params.organisation_id = organisationId
        }
        const response = await this.get('/compliance/gap-analysis', params)
        return this.extractData(response)
    }

    /**
     * Export compliance records
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
            '/compliance/export',
            `compliance_export_${new Date().toISOString().split('T')[0]}.${format}`,
            { params }
        )
    }

    /**
     * Get compliance audit history for a record
     */
    async getAuditHistory(id: string): Promise<
        Array<{
            title: string
            date: string
            description: string
            status: string
            auditor?: string
            findings?: string
        }>
    > {
        const response = await this.get(`/compliance/${id}/audit-history`)
        return this.extractData(response)
    }

    /**
     * Schedule next audit
     */
    async scheduleAudit(
        id: string,
        data: { next_audit_due: string; auditor?: string }
    ): Promise<ComplianceRecord> {
        const response = await this.patch<ComplianceRecord>(`/compliance/${id}/schedule-audit`, data)
        return this.extractData(response)
    }

    /**
     * Bulk update compliance status
     */
    async bulkUpdateStatus(ids: string[], status: string): Promise<{ updated: number }> {
        const response = await this.post<{ updated: number }>('/compliance/bulk-update-status', {
            ids,
            compliance_status: status,
        })
        return this.extractData(response)
    }
}

// Export singleton
export const complianceService = new ComplianceService()
