import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
    ComplianceRecord,
    ComplianceStandard,
    ComplianceStatus,
    ComplianceStats,
    ComplianceSummary,
    ComplianceGap,
    ComplianceAuditEntry,
} from './../../../../models/entities'

/**
 * Compliance Repository
 * Handles CRUD operations for ComplianceRecord entities with camelCase field names
 * Aligned with compliance.entity.ts
 */
export class ComplianceRepository extends BaseRepository<ComplianceRecord> {
    constructor(table: Table<ComplianceRecord, string>) {
        super(table, 'compliance_records')
    }

    /**
     * Find compliance records by organisation
     */
    async findByOrganisation(organisationId: string): Promise<ComplianceRecord[]> {
        return this.findMany({ organisationId } as Partial<ComplianceRecord>)
    }

    /**
     * Find compliance records by standard
     */
    async findByStandard(standard: ComplianceStandard): Promise<ComplianceRecord[]> {
        return this.findMany({ complianceStandard: standard } as Partial<ComplianceRecord>)
    }

    /**
     * Find compliance records by status
     */
    async findByStatus(status: ComplianceStatus): Promise<ComplianceRecord[]> {
        return this.findMany({ complianceStatus: status } as Partial<ComplianceRecord>)
    }

    /**
     * Find compliant records
     */
    async findCompliant(): Promise<ComplianceRecord[]> {
        return this.findByStatus(ComplianceStatus.COMPLIANT)
    }

    /**
     * Find partially compliant records
     */
    async findPartiallyCompliant(): Promise<ComplianceRecord[]> {
        return this.findByStatus(ComplianceStatus.PARTIALLY_COMPLIANT)
    }

    /**
     * Find non-compliant records
     */
    async findNonCompliant(): Promise<ComplianceRecord[]> {
        return this.findByStatus(ComplianceStatus.NON_COMPLIANT)
    }

    /**
     * Find not assessed records
     */
    async findNotAssessed(): Promise<ComplianceRecord[]> {
        return this.findByStatus(ComplianceStatus.NOT_ASSESSED)
    }

    /**
     * Find records with overdue audits
     */
    async findOverdueAudits(): Promise<ComplianceRecord[]> {
        const today = new Date()
        return this.table
            .filter((record) => {
                const dueDate = record.nextAuditDate
                if (!dueDate) return false
                const dateObj = dueDate instanceof Date ? dueDate : new Date(dueDate)
                return dateObj < today
            })
            .toArray()
    }

    /**
     * Find records with upcoming audits within specified days
     */
    async findUpcomingAudits(days: number = 30): Promise<ComplianceRecord[]> {
        const today = new Date()
        const future = new Date(today)
        future.setDate(future.getDate() + days)

        return this.table
            .filter((record) => {
                const dueDate = record.nextAuditDate
                if (!dueDate) return false
                const dateObj = dueDate instanceof Date ? dueDate : new Date(dueDate)
                return dateObj >= today && dateObj <= future
            })
            .toArray()
    }

    /**
     * Find records with evidence
     */
    async findWithEvidence(): Promise<ComplianceRecord[]> {
        return this.table
            .filter((record) => {
                const links = record.evidenceLinks
                return Array.isArray(links) && links.length > 0
            })
            .toArray()
    }

    /**
     * Find records with gaps
     */
    async findWithGaps(): Promise<ComplianceRecord[]> {
        return this.table
            .filter((record) =>
                typeof record.gapDescription === 'string' && record.gapDescription.length > 0
            )
            .toArray()
    }

    /**
     * Find records with recommendations
     */
    async findWithRecommendations(): Promise<ComplianceRecord[]> {
        return this.table
            .filter((record) =>
                typeof record.recommendation === 'string' && record.recommendation.length > 0
            )
            .toArray()
    }

    /**
     * Find records by search term
     */
    async search(searchTerm: string): Promise<ComplianceRecord[]> {
        const lower = searchTerm.toLowerCase()
        const all = await this.findAll()
        return all.filter((record) =>
            record.organisationId?.toLowerCase().includes(lower) ||
            record.complianceStandard?.toLowerCase().includes(lower) ||
            record.complianceStatus?.toLowerCase().includes(lower) ||
            record.gapDescription?.toLowerCase().includes(lower) ||
            record.recommendation?.toLowerCase().includes(lower) ||
            record.notes?.toLowerCase().includes(lower)
        )
    }

    /**
     * Get compliance statistics
     * Returns stats matching ComplianceStats interface
     */
    async getStats(organisationId?: string): Promise<ComplianceStats> {
        let records = await this.findAll()

        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const total = records.length

        const compliant = records.filter((r) => r.complianceStatus === ComplianceStatus.COMPLIANT).length
        const partiallyCompliant = records.filter((r) => r.complianceStatus === ComplianceStatus.PARTIALLY_COMPLIANT).length
        const nonCompliant = records.filter((r) => r.complianceStatus === ComplianceStatus.NON_COMPLIANT).length
        const notAssessed = records.filter((r) => r.complianceStatus === ComplianceStatus.NOT_ASSESSED).length

        const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0
        const overdueAudits = await this.countOverdueAudits(organisationId)
        const upcomingAudits = await this.countUpcomingAudits(organisationId)

        // Calculate by standard
        const byStandard: Record<string, { total: number; compliant: number; rate: number }> = {}
        for (const record of records) {
            const standard = record.complianceStandard
            if (standard) {
                if (!byStandard[standard]) {
                    byStandard[standard] = { total: 0, compliant: 0, rate: 0 }
                }
                byStandard[standard].total++
                if (record.complianceStatus === ComplianceStatus.COMPLIANT) {
                    byStandard[standard].compliant++
                }
            }
        }

        // Calculate rates for each standard
        for (const [standard, data] of Object.entries(byStandard)) {
            const standardData = byStandard[standard]
            if (!standardData) continue

            standardData.rate = data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0
        }

        // Calculate by status
        const byStatus: Record<string, number> = {}
        for (const status of Object.values(ComplianceStatus)) {
            const count = records.filter((r) => r.complianceStatus === status).length
            if (count > 0) {
                byStatus[status] = count
            }
        }

        return {
            total,
            compliant,
            partiallyCompliant,
            nonCompliant,
            notAssessed,
            complianceRate,
            overdueAudits,
            upcomingAudits,
            byStandard,
            byStatus,
        }
    }

    /**
     * Get compliance summary for dashboard
     */
    async getSummary(organisationId?: string): Promise<ComplianceSummary> {
        const stats = await this.getStats(organisationId)
        let records = await this.findAll()

        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const byStandard: Array<{ standard: string; status: string; count: number }> = []
        for (const [standard] of Object.entries(stats.byStandard)) {
            const statuses = records
                .filter((r) => r.complianceStandard === standard)
                .reduce((acc, r) => {
                    const status = r.complianceStatus || ComplianceStatus.NOT_ASSESSED
                    acc[status] = (acc[status] || 0) + 1
                    return acc
                }, {} as Record<string, number>)

            // Add each status count for this standard
            for (const [status, count] of Object.entries(statuses)) {
                byStandard.push({ standard, status, count })
            }
        }

        return {
            totalRecords: stats.total,
            compliant: stats.compliant,
            partiallyCompliant: stats.partiallyCompliant,
            nonCompliant: stats.nonCompliant,
            notAssessed: stats.notAssessed,
            overdueAudits: stats.overdueAudits,
            upcomingAudits: stats.upcomingAudits,
            complianceRate: stats.complianceRate,
            byStandard,
        }
    }

    /**
     * Count overdue audits
     */
    async countOverdueAudits(organisationId?: string): Promise<number> {
        let records = await this.findOverdueAudits()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }
        return records.length
    }

    /**
     * Count upcoming audits
     */
    async countUpcomingAudits(organisationId?: string, days: number = 30): Promise<number> {
        let records = await this.findUpcomingAudits(days)
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }
        return records.length
    }

    /**
     * Get distribution by standard
     */
    async getStandardDistribution(organisationId?: string): Promise<Record<string, number>> {
        let records = await this.findAll()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const distribution: Record<string, number> = {}
        for (const standard of Object.values(ComplianceStandard)) {
            const count = records.filter((r) => r.complianceStandard === standard).length
            if (count > 0) {
                distribution[standard] = count
            }
        }
        return distribution
    }

    /**
     * Get distribution by status
     */
    async getStatusDistribution(organisationId?: string): Promise<Record<ComplianceStatus, number>> {
        let records = await this.findAll()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const distribution: Record<ComplianceStatus, number> = {
            [ComplianceStatus.COMPLIANT]: 0,
            [ComplianceStatus.PARTIALLY_COMPLIANT]: 0,
            [ComplianceStatus.NON_COMPLIANT]: 0,
            [ComplianceStatus.NOT_ASSESSED]: 0,
        }

        for (const record of records) {
            const status = record.complianceStatus || ComplianceStatus.NOT_ASSESSED
            distribution[status] = (distribution[status] || 0) + 1
        }

        return distribution
    }

    /**
     * Get compliance rate by standard
     */
    async getComplianceRateByStandard(organisationId?: string): Promise<Record<string, number>> {
        let records = await this.findAll()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const rate: Record<string, number> = {}
        for (const standard of Object.values(ComplianceStandard)) {
            const standardRecords = records.filter((r) => r.complianceStandard === standard)
            const total = standardRecords.length
            if (total > 0) {
                const compliant = standardRecords.filter(
                    (r) => r.complianceStatus === ComplianceStatus.COMPLIANT
                ).length
                rate[standard] = Math.round((compliant / total) * 100)
            }
        }
        return rate
    }

    /**
     * Get gap analysis
     */
    async getGapAnalysis(organisationId?: string): Promise<ComplianceGap[]> {
        let records = await this.findAll()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const gaps: ComplianceGap[] = []

        for (const record of records) {
            if (record.gapDescription) {
                const priority = this.determineGapPriority(record)
                gaps.push({
                    requirement: `Standard: ${record.complianceStandard}`,
                    currentStatus: record.complianceStatus || ComplianceStatus.NOT_ASSESSED,
                    targetStatus: ComplianceStatus.COMPLIANT,
                    actionItems: [
                        record.gapDescription,
                        ...(record.recommendation ? [record.recommendation] : []),
                    ].filter(Boolean),
                    priority,
                })
            }
        }

        return gaps
    }

    /**
     * Determine gap priority based on status and standard
     */
    private determineGapPriority(record: ComplianceRecord): 'high' | 'medium' | 'low' {
        const status = record.complianceStatus
        switch (status) {
            case ComplianceStatus.NON_COMPLIANT:
                return 'high'
            case ComplianceStatus.PARTIALLY_COMPLIANT:
                return 'medium'
            case ComplianceStatus.NOT_ASSESSED:
                return 'low'
            default:
                return 'low'
        }
    }

    /**
     * Get audit history entries
     */
    async getAuditHistory(organisationId?: string): Promise<ComplianceAuditEntry[]> {
        let records = await this.findAll()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const history: ComplianceAuditEntry[] = []

        for (const record of records) {
            const status = record.complianceStatus
            const auditStatus = status === ComplianceStatus.COMPLIANT ? 'COMPLETED' :
                status === ComplianceStatus.PARTIALLY_COMPLIANT ? 'IN_PROGRESS' :
                    status === ComplianceStatus.NOT_ASSESSED ? 'SCHEDULED' : 'FAILED'

            const auditEntry: ComplianceAuditEntry = {
                id: record.uuid,
                title: `Audit for ${record.complianceStandard}`,
                date: record.lastAuditDate || record.createdAt,
                description: `Compliance status: ${status}`,
                status: auditStatus as 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'FAILED',
                ...(record.gapDescription ? { findings: record.gapDescription } : {}),
            }

            history.push(auditEntry)
        }

        return history.sort((a, b) => {
            const aDate = a.date instanceof Date ? a.date : new Date(a.date)
            const bDate = b.date instanceof Date ? b.date : new Date(b.date)
            return bDate.getTime() - aDate.getTime()
        })
    }

    /**
     * Update compliance status
     */
    async updateStatus(
        uuid: string,
        status: ComplianceStatus,
        nextAuditDate?: Date | string,
        userId: string = 'system'
    ): Promise<ComplianceRecord | null> {
        const existing = await this.findById(uuid)
        if (!existing) return null

        const now = new Date().toISOString()
        const updates: Partial<ComplianceRecord> = {
            complianceStatus: status,
            updatedBy: userId,
            updatedAt: now,
        }

        if (nextAuditDate) {
            updates.nextAuditDate = nextAuditDate
        }

        if (status === ComplianceStatus.COMPLIANT) {
            updates.lastAuditDate = now
        }

        const updated = await this.update(uuid, updates)
        return updated ?? null
    }

    /**
     * Add evidence to a compliance record
     */
    async addEvidence(uuid: string, evidenceLinks: string[], userId: string = 'system'): Promise<ComplianceRecord | null> {
        const existing = await this.findById(uuid)
        if (!existing) return null

        const currentLinks = existing.evidenceLinks || []
        const updatedLinks = [...currentLinks, ...evidenceLinks]

        const updated = await this.update(uuid, {
            evidenceLinks: updatedLinks,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        })

        return updated ?? null
    }

    /**
     * Remove evidence from a compliance record
     */
    async removeEvidence(uuid: string, index: number, userId: string = 'system'): Promise<ComplianceRecord | null> {
        const existing = await this.findById(uuid)
        if (!existing) return null

        const currentLinks = existing.evidenceLinks || []
        if (index < 0 || index >= currentLinks.length) return null

        const updatedLinks = [...currentLinks.slice(0, index), ...currentLinks.slice(index + 1)]

        const updated = await this.update(uuid, {
            evidenceLinks: updatedLinks,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        })

        return updated ?? null
    }

    /**
     * Bulk update compliance status
     */
    async bulkUpdateStatus(
        ids: string[],
        status: ComplianceStatus,
        userId: string = 'system'
    ): Promise<{ updated: number; failed: number; errors: string[] }> {
        const result = {
            updated: 0,
            failed: 0,
            errors: [] as string[],
        }

        for (const id of ids) {
            try {
                const updated = await this.updateStatus(id, status, undefined, userId)
                if (updated) {
                    result.updated++
                } else {
                    result.failed++
                    result.errors.push(`Record ${id} not found`)
                }
            } catch (error: any) {
                result.failed++
                result.errors.push(`Failed to update ${id}: ${error.message}`)
            }
        }

        return result
    }

    /**
     * Get records that need attention (overdue audits, non-compliant, etc.)
     */
    async getActionRequired(organisationId?: string): Promise<{
        overdueAudits: ComplianceRecord[]
        nonCompliant: ComplianceRecord[]
        partiallyCompliant: ComplianceRecord[]
        total: number
    }> {
        let records = await this.findAll()

        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }

        const overdueAudits = records.filter((r) => {
            const dueDate = r.nextAuditDate
            if (!dueDate) return false
            const dateObj = dueDate instanceof Date ? dueDate : new Date(dueDate)
            return dateObj < new Date()
        })

        const nonCompliant = records.filter(
            (r) => r.complianceStatus === ComplianceStatus.NON_COMPLIANT
        )

        const partiallyCompliant = records.filter(
            (r) => r.complianceStatus === ComplianceStatus.PARTIALLY_COMPLIANT
        )

        // Get unique records that need attention
        const actionRecords = new Set<ComplianceRecord>()
        for (const record of [...overdueAudits, ...nonCompliant, ...partiallyCompliant]) {
            actionRecords.add(record)
        }

        return {
            overdueAudits,
            nonCompliant,
            partiallyCompliant,
            total: actionRecords.size,
        }
    }

    /**
     * Search compliance records with filters
     */
    async searchWithFilters(params: {
        organisationId?: string
        standard?: ComplianceStandard
        status?: ComplianceStatus
        search?: string
        limit?: number
        offset?: number
    }): Promise<{ data: ComplianceRecord[]; total: number }> {
        let results = await this.findAll()

        // Apply filters
        if (params.organisationId) {
            results = results.filter((r) => r.organisationId === params.organisationId)
        }

        if (params.standard) {
            results = results.filter((r) => r.complianceStandard === params.standard)
        }

        if (params.status) {
            results = results.filter((r) => r.complianceStatus === params.status)
        }

        // Apply search
        if (params.search) {
            const lower = params.search.toLowerCase()
            results = results.filter((r) =>
                r.complianceStandard?.toLowerCase().includes(lower) ||
                r.complianceStatus?.toLowerCase().includes(lower) ||
                r.gapDescription?.toLowerCase().includes(lower) ||
                r.recommendation?.toLowerCase().includes(lower) ||
                r.notes?.toLowerCase().includes(lower)
            )
        }

        const total = results.length

        // Apply pagination
        if (params.offset !== undefined && params.limit !== undefined) {
            results = results.slice(params.offset, params.offset + params.limit)
        }

        return { data: results, total }
    }

    /**
     * Get compliance record count
     */
    async countRecords(organisationId?: string): Promise<number> {
        let records = await this.findAll()
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }
        return records.length
    }

    /**
     * Get active compliance records (not deleted)
     */
    async findActive(organisationId?: string): Promise<ComplianceRecord[]> {
        let records = await this.findAll()
        records = records.filter((r) => !r.deletedAt)
        if (organisationId) {
            records = records.filter((r) => r.organisationId === organisationId)
        }
        return records
    }

    /**
     * Get compliance record by standard and organisation
     */
    async findByStandardAndOrganisation(
        standard: ComplianceStandard,
        organisationId: string
    ): Promise<ComplianceRecord | undefined> {
        const records = await this.findMany({
            complianceStandard: standard,
            organisationId: organisationId,
        } as Partial<ComplianceRecord>)
        return records[0]
    }

    /**
     * Check if a record exists for a standard and organisation
     */
    async existsForStandardAndOrganisation(
        standard: ComplianceStandard,
        organisationId: string
    ): Promise<boolean> {
        const record = await this.findByStandardAndOrganisation(standard, organisationId)
        return !!record
    }
}