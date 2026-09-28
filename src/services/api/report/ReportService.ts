import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import type {
    Report,
    ReportStats,
    ReportGenerationResult,
    CreateReportRequest,
    UpdateReportRequest,
    ScheduleReportRequest,
    ReportQueryParams,
    ReportDataResponse,
} from '../../../models/report/report.entity'
import type { PaginatedResponse } from '../../../shared/types/common.types'

/**
 * Report Service
 * Aligned with backend shared.routes.ts
 *
 * Backend routes:
 * - POST   /reports
 * - GET    /reports
 * - GET    /reports/public
 * - GET    /reports/stats
 * - GET    /reports/type/:report_type
 * - GET    /reports/organisation/:organisation_id
 * - GET    /reports/:uuid
 * - PUT    /reports/:uuid
 * - DELETE /reports/:uuid
 * - POST   /reports/:uuid/generate
 * - POST   /reports/:uuid/cancel
 * - POST   /reports/:uuid/schedule
 * - GET    /reports/:uuid/data
 * - POST   /reports/maintenance/delete-expired
 */
export class ReportService extends BaseService {
    // ============================================
    // CRUD Operations
    // ============================================

    /**
     * Get all reports with optional filters
     * GET /reports
     */
    async getReports(params?: ReportQueryParams): Promise<PaginatedResponse<Report>> {
        const response = await this.getPaginated<Report>(
            API_ENDPOINTS.REPORTS.BASE,
            params as Record<string, any>
        )
        return {
            success: true,
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Get public reports (no auth required)
     * GET /reports/public
     */
    async getPublicReports(params?: ReportQueryParams): Promise<PaginatedResponse<Report>> {
        const response = await this.getPaginated<Report>(
            API_ENDPOINTS.REPORTS.PUBLIC,
            params as Record<string, any>
        )
        return {
            success: true,
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Get a single report by UUID
     * GET /reports/:uuid
     */
    async getReport(id: string): Promise<Report> {
        const response = await this.get<Report>(API_ENDPOINTS.REPORTS.BY_ID(id))
        return this.extractData(response)
    }

    /**
     * Create a new report
     * POST /reports
     */
    async createReport(data: CreateReportRequest): Promise<Report> {
        const response = await this.post<Report>(API_ENDPOINTS.REPORTS.BASE, data)
        return this.extractData(response)
    }

    /**
     * Update an existing report
     * PUT /reports/:uuid
     */
    async updateReport(id: string, data: UpdateReportRequest): Promise<Report> {
        const response = await this.put<Report>(API_ENDPOINTS.REPORTS.UPDATE(id), data)
        return this.extractData(response)
    }

    /**
     * Delete a report
     * DELETE /reports/:uuid
     */
    async deleteReport(id: string): Promise<void> {
        await this.delete(API_ENDPOINTS.REPORTS.DELETE(id))
    }

    // ============================================
    // Query Operations
    // ============================================

    /**
     * Get reports by type
     * GET /reports/type/:report_type
     */
    async getReportsByType(
        reportType: string,
        params?: ReportQueryParams
    ): Promise<PaginatedResponse<Report>> {
        const response = await this.getPaginated<Report>(
            API_ENDPOINTS.REPORTS.BY_TYPE(reportType),
            params as Record<string, any>
        )
        return {
            success: true,
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Get reports by organisation
     * GET /reports/organisation/:organisation_id
     */
    async getReportsByOrganisation(
        organisationId: string,
        params?: ReportQueryParams
    ): Promise<PaginatedResponse<Report>> {
        const response = await this.getPaginated<Report>(
            API_ENDPOINTS.REPORTS.BY_ORGANISATION(organisationId),
            params as Record<string, any>
        )
        return {
            success: true,
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
            hasMore: response.hasMore || false,
            timestamp: new Date().toISOString(),
        }
    }

    // ============================================
    // Statistics
    // ============================================

    /**
     * Get report statistics
     * GET /reports/stats
     */
    async getStats(organisationId?: string): Promise<ReportStats> {
        const params = organisationId ? { organisationId } : undefined
        const response = await this.get<ReportStats>(API_ENDPOINTS.REPORTS.STATS, params)
        return this.extractData(response)
    }

    // ============================================
    // Generation Operations
    // ============================================

    /**
     * Generate a report
     * POST /reports/:uuid/generate
     */
    async generateReport(id: string): Promise<ReportGenerationResult> {
        const response = await this.post<ReportGenerationResult>(
            API_ENDPOINTS.REPORTS.GENERATE(id)
        )
        return this.extractData(response)
    }

    /**
     * Cancel a generating report
     * POST /reports/:uuid/cancel
     */
    async cancelReport(id: string): Promise<Report> {
        const response = await this.post<Report>(API_ENDPOINTS.REPORTS.CANCEL(id))
        return this.extractData(response)
    }

    /**
     * Schedule a report
     * POST /reports/:uuid/schedule
     */
    async scheduleReport(id: string, data: ScheduleReportRequest): Promise<Report> {
        const response = await this.post<Report>(
            API_ENDPOINTS.REPORTS.SCHEDULE(id),
            data
        )
        return this.extractData(response)
    }

    // ============================================
    // Data Operations
    // ============================================

    /**
     * Get report data (JSON payload)
     * GET /reports/:uuid/data
     */
    async getReportData(id: string): Promise<ReportDataResponse> {
        const response = await this.get<ReportDataResponse>(
            API_ENDPOINTS.REPORTS.GET_DATA(id)
        )
        return this.extractData(response)
    }

    /**
     * Download report file
     * GET /reports/:uuid/data (with download flag) or /reports/:uuid/download
     */
    async downloadReport(id: string, filename?: string): Promise<void> {
        const report = await this.getReport(id)
        await this.download(
            API_ENDPOINTS.REPORTS.GET_DATA(id),
            filename || `${report.name}.${report.format?.toLowerCase() || 'pdf'}`
        )
    }

    // ============================================
    // Maintenance Operations
    // ============================================

    /**
     * Delete expired reports (admin only)
     * POST /reports/maintenance/delete-expired
     */
    async deleteExpiredReports(): Promise<{ deletedCount: number }> {
        const response = await this.post<{ deletedCount: number }>(
            API_ENDPOINTS.REPORTS.DELETE_EXPIRED
        )
        return this.extractData(response)
    }

    // ============================================
    // Convenience Methods
    // ============================================

    /**
     * Get reports with pagination
     */
    async getReportsPaginated(
        page: number = 1,
        limit: number = 10,
        filters?: ReportQueryParams
    ): Promise<PaginatedResponse<Report>> {
        return this.getReports({ ...filters, page, limit })
    }

    /**
     * Search reports by name
     */
    async searchReports(
        searchTerm: string,
        params?: ReportQueryParams
    ): Promise<PaginatedResponse<Report>> {
        return this.getReports({ ...params, search: searchTerm })
    }

    /**
     * Get reports by status
     */
    async getReportsByStatus(
        status: string,
        params?: ReportQueryParams
    ): Promise<PaginatedResponse<Report>> {
        return this.getReports({ ...params, status })
    }

    /**
     * Get scheduled reports for an organisation
     */
    async getScheduledReports(
        organisationId: string
    ): Promise<PaginatedResponse<Report>> {
        return this.getReportsByOrganisation(organisationId, {
            status: 'Scheduled',
        })
    }

    /**
     * Get completed reports for an organisation
     */
    async getCompletedReports(
        organisationId: string
    ): Promise<PaginatedResponse<Report>> {
        return this.getReportsByOrganisation(organisationId, {
            status: 'Completed',
        })
    }

    /**
     * Get failed reports for an organisation
     */
    async getFailedReports(
        organisationId: string
    ): Promise<PaginatedResponse<Report>> {
        return this.getReportsByOrganisation(organisationId, {
            status: 'Failed',
        })
    }

    /**
     * Retry a failed report generation
     */
    async retryReport(id: string): Promise<ReportGenerationResult> {
        return this.generateReport(id)
    }

    /**
     * Duplicate an existing report
     */
    async duplicateReport(id: string, newName?: string): Promise<Report> {
        const original = await this.getReport(id)
        return this.createReport({
            name: newName || `${original.name} (Copy)`,
            description: original.description,
            reportType: original.reportType,
            format: original.format,
            organisationId: original.organisationId,
            businessUnitId: original.businessUnitId,
            departmentId: original.departmentId,
            parameters: original.parameters,
            frequency: 'Once',
        } as CreateReportRequest)
    }
}

// ============================================
// Singleton Export
// ============================================

export const reportService = new ReportService()