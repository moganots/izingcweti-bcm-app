import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import type { AuditQueryParams, PaginatedResponse } from './../../../types'

/**
 * Audit Log interface
 */
export interface AuditLog {
    uuid: string
    user_id: string
    organisation_id?: string | null
    action: string
    audit_category: string
    severity: string
    entity_type: string
    entity_id: string
    description: string
    old_value?: Record<string, any> | null
    new_value?: Record<string, any> | null
    metadata?: Record<string, any> | null
    ip_address?: string | null
    user_agent?: string | null
    session_id?: string | null
    request_method?: string | null
    request_path?: string | null
    response_status?: number | null
    execution_time_ms?: number | null
    is_sensitive: boolean
    created_by: string
    created_at: string
    updated_by: string
    updated_at: string
    version: number
    sync_status: string
    user?: {
        uuid: string
        email: string
        role: string
    }
    organisation?: {
        uuid: string
        name: string
    }
}

/**
 * Audit Statistics
 */
export interface AuditStats {
    total_logs: number
    logs_today: number
    logs_this_week: number
    logs_this_month: number
    by_action: Record<string, number>
    by_category: Record<string, number>
    by_severity: Record<string, number>
    by_entity_type: Record<string, number>
    average_execution_time: number
}

/**
 * Audit Export Request
 */
export interface AuditExportRequest {
    audit_category?: string
    action?: string
    severity?: string
    entity_type?: string
    start_date?: string
    end_date?: string
    format?: 'csv' | 'json'
}

/**
 * Audit Retention Policy
 */
export interface AuditRetentionPolicy {
    uuid: string
    organisation_id: string
    audit_category: string
    retention_days: number
    is_active: boolean
    created_by: string
    created_at: string
    updated_by: string
    updated_at: string
}

/**
 * Create Retention Policy Request
 */
export interface CreateRetentionPolicyRequest {
    organisation_id: string
    audit_category: string
    retention_days: number
    is_active?: boolean
}

/**
 * Update Retention Policy Request
 */
export interface UpdateRetentionPolicyRequest {
    retention_days?: number
    is_active?: boolean
}

/**
 * Audit API Service
 */
export class AuditService extends BaseService {
    /**
     * Get audit logs with pagination and filters
     */
    async getLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, params as Record<string, any>)
    }

    /**
     * Get audit log by ID
     */
    async getLog(id: string): Promise<AuditLog> {
        const response = await this.get<AuditLog>(`${API_ENDPOINTS.AUDIT.BASE}/${id}`)
        return this.extractData(response)
    }

    /**
     * Get audit logs by user
     */
    async getLogsByUser(
        userId: string,
        params?: AuditQueryParams
    ): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            user_id: userId,
        } as Record<string, any>)
    }

    /**
     * Get audit logs by entity
     */
    async getLogsByEntity(
        entityType: string,
        entityId: string,
        params?: AuditQueryParams
    ): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            entity_type: entityType,
            entity_id: entityId,
        } as Record<string, any>)
    }

    /**
     * Get entity audit history
     */
    async getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
        const response = await this.get<AuditLog[]>(
            API_ENDPOINTS.AUDIT.BY_ENTITY(entityType, entityId)
        )
        return this.extractData(response)
    }

    /**
     * Get audit statistics
     */
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

    /**
     * Export audit logs
     */
    async exportLogs(data: AuditExportRequest): Promise<void> {
        const format = data.format || 'csv'
        const filename = `audit_export_${new Date().toISOString().split('T')[0]}.${format}`

        await this.download(API_ENDPOINTS.AUDIT.EXPORT, filename, {
            params: data as Record<string, any>,
        })
    }

    /**
     * Get sensitive audit logs
     */
    async getSensitiveLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            sensitive_only: true,
        } as Record<string, any>)
    }

    /**
     * Clean up old audit logs
     */
    async cleanupOldLogs(daysOld: number = 365): Promise<{ deleted: number }> {
        const response = await this.post<{ deleted: number }>('/audit/cleanup', { days: daysOld })
        return this.extractData(response)
    }

    // ============================================
    // Retention Policies
    // ============================================

    /**
     * Get retention policies
     */
    async getRetentionPolicies(organisationId?: string): Promise<AuditRetentionPolicy[]> {
        const params: Record<string, any> = {}
        if (organisationId) params.organisation_id = organisationId

        const response = await this.get<AuditRetentionPolicy[]>('/audit/retention-policies', params)
        return this.extractData(response)
    }

    /**
     * Create retention policy
     */
    async createRetentionPolicy(data: CreateRetentionPolicyRequest): Promise<AuditRetentionPolicy> {
        const response = await this.post<AuditRetentionPolicy>('/audit/retention-policies', data)
        return this.extractData(response)
    }

    /**
     * Update retention policy
     */
    async updateRetentionPolicy(
        id: string,
        data: UpdateRetentionPolicyRequest
    ): Promise<AuditRetentionPolicy> {
        const response = await this.put<AuditRetentionPolicy>(`/audit/retention-policies/${id}`, data)
        return this.extractData(response)
    }

    /**
     * Delete retention policy
     */
    async deleteRetentionPolicy(id: string): Promise<void> {
        await this.delete(`/audit/retention-policies/${id}`)
    }

    /**
     * Apply retention policies (clean up logs based on policies)
     */
    async applyRetentionPolicies(): Promise<{ total_cleaned: number }> {
        const response = await this.post<{ total_cleaned: number }>('/audit/apply-retention')
        return this.extractData(response)
    }

    // ============================================
    // User Activity
    // ============================================

    /**
     * Get user activity timeline
     */
    async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
        const response = await this.get<AuditLog[]>(API_ENDPOINTS.AUDIT.BASE, {
            user_id: userId,
            limit,
            sortBy: 'created_at',
            sortOrder: 'DESC',
        })
        return this.extractData(response)
    }

    /**
     * Get current user's activity
     */
    async getMyActivity(limit: number = 50): Promise<AuditLog[]> {
        const response = await this.get<AuditLog[]>('/audit/my-activity', { limit })
        return this.extractData(response)
    }

    // ============================================
    // Search
    // ============================================

    /**
     * Search audit logs
     */
    async searchLogs(query: string, params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            search: query,
        } as Record<string, any>)
    }

    /**
     * Get audit logs by date range
     */
    async getLogsByDateRange(
        startDate: string,
        endDate: string,
        params?: AuditQueryParams
    ): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            start_date: startDate,
            end_date: endDate,
        } as Record<string, any>)
    }

    /**
     * Get audit logs by action
     */
    async getLogsByAction(
        action: string,
        params?: AuditQueryParams
    ): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            action,
        } as Record<string, any>)
    }

    /**
     * Get audit logs by category
     */
    async getLogsByCategory(
        category: string,
        params?: AuditQueryParams
    ): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            audit_category: category,
        } as Record<string, any>)
    }

    /**
     * Get audit logs by severity
     */
    async getLogsBySeverity(
        severity: string,
        params?: AuditQueryParams
    ): Promise<PaginatedResponse<AuditLog>> {
        return this.getPaginated<AuditLog>(API_ENDPOINTS.AUDIT.BASE, {
            ...params,
            severity,
        } as Record<string, any>)
    }
}

// Export singleton
export const auditService = new AuditService()
