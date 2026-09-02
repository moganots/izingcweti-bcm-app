import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
    Document,
    DocumentType,
    DocumentStatus,
    AccessLevel,
    DocumentStats,
    DocumentVersion,
} from './../../../../models/entities'

/**
 * Document Repository
 * Handles CRUD operations for Document entities with camelCase field names
 * Aligned with document.entity.ts
 */
export class DocumentRepository extends BaseRepository<Document> {
    constructor(table: Table<Document, string>) {
        super(table, 'documents')
    }

    /**
     * Find documents by organisation
     */
    async findByOrganisation(organisationId: string): Promise<Document[]> {
        return this.findMany({ organisationId } as Partial<Document>)
    }

    /**
     * Find documents by document type
     */
    async findByType(type: DocumentType): Promise<Document[]> {
        return this.findMany({ documentType: type } as Partial<Document>)
    }

    /**
     * Find documents by status
     */
    async findByStatus(status: DocumentStatus): Promise<Document[]> {
        return this.findMany({ status } as Partial<Document>)
    }

    /**
     * Find documents by access level
     */
    async findByAccessLevel(level: AccessLevel): Promise<Document[]> {
        return this.findMany({ accessLevel: level } as Partial<Document>)
    }

    /**
     * Find documents by uploader
     */
    async findByUploader(uploadedBy: string): Promise<Document[]> {
        return this.findMany({ uploadedBy } as Partial<Document>)
    }

    /**
     * Find documents by tags
     */
    async findByTags(tags: string[]): Promise<Document[]> {
        const all = await this.findAll()
        return all.filter((doc) => {
            if (!doc.tags) return false
            return tags.some((tag) => doc.tags!.includes(tag))
        })
    }

    /**
     * Find documents by tag (single tag)
     */
    async findByTag(tag: string): Promise<Document[]> {
        const all = await this.findAll()
        return all.filter((doc) => {
            if (!doc.tags) return false
            return doc.tags.includes(tag)
        })
    }

    /**
     * Find active documents (not archived, not expired)
     */
    async findActive(): Promise<Document[]> {
        const today = new Date()
        return this.table
            .filter((doc) => {
                const isArchived = doc.status === DocumentStatus.ARCHIVED
                const isExpired = doc.expiresAt && new Date(doc.expiresAt) < today
                return !isArchived && !isExpired
            })
            .toArray()
    }

    /**
     * Find archived documents
     */
    async findArchived(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.ARCHIVED)
    }

    /**
     * Find published documents
     */
    async findPublished(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.PUBLISHED)
    }

    /**
     * Find draft documents
     */
    async findDrafts(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.DRAFT)
    }

    /**
     * Find documents pending approval
     */
    async findPendingApproval(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.PENDING_APPROVAL)
    }

    /**
     * Find documents under review
     */
    async findUnderReview(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.UNDER_REVIEW)
    }

    /**
     * Find approved documents
     */
    async findApproved(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.APPROVED)
    }

    /**
     * Find rejected documents
     */
    async findRejected(): Promise<Document[]> {
        return this.findByStatus(DocumentStatus.REJECTED)
    }

    /**
     * Find expired documents
     */
    async findExpired(): Promise<Document[]> {
        const today = new Date()
        return this.table
            .filter((doc) => {
                if (!doc.expiresAt) return false
                return new Date(doc.expiresAt) < today
            })
            .toArray()
    }

    /**
     * Find documents expiring soon
     */
    async findExpiringSoon(days: number = 30): Promise<Document[]> {
        const today = new Date()
        const future = new Date(today)
        future.setDate(future.getDate() + days)

        return this.table
            .filter((doc) => {
                if (!doc.expiresAt) return false
                const expiryDate = new Date(doc.expiresAt)
                return expiryDate > today && expiryDate <= future
            })
            .toArray()
    }

    /**
     * Find documents by file type
     */
    async findByFileType(fileType: string): Promise<Document[]> {
        return this.findMany({ fileType } as Partial<Document>)
    }

    /**
     * Find documents by size range
     */
    async findBySizeRange(minSize: number, maxSize: number): Promise<Document[]> {
        return this.table
            .filter((doc) => {
                const size = doc.fileSize
                return size >= minSize && size <= maxSize
            })
            .toArray()
    }

    /**
     * Find documents by date range (upload date)
     */
    async findByUploadDateRange(startDate: string | Date, endDate: string | Date): Promise<Document[]> {
        const start = startDate instanceof Date ? startDate : new Date(startDate)
        const end = endDate instanceof Date ? endDate : new Date(endDate)

        return this.table
            .filter((doc) => {
                const createdAt = doc.createdAt
                if (!createdAt) return false
                const date = (createdAt as any) instanceof Date ? createdAt : new Date(String(createdAt))
                return date >= start && date <= end
            })
            .toArray()
    }

    /**
     * Find documents by title search
     */
    async searchByTitle(searchTerm: string): Promise<Document[]> {
        const lower = searchTerm.toLowerCase()
        const all = await this.findAll()
        return all.filter((doc) =>
            doc.title?.toLowerCase().includes(lower) ||
            doc.description?.toLowerCase().includes(lower)
        )
    }

    /**
     * Find documents with versions
     */
    async findWithVersions(): Promise<Document[]> {
        return this.table
            .filter((doc) => {
                const versions = doc.previousVersions
                return Array.isArray(versions) && versions.length > 0
            })
            .toArray()
    }

    /**
     * Find documents by department
     */
    async findByDepartment(departmentId: string): Promise<Document[]> {
        return this.findMany({ departmentId } as Partial<Document>)
    }

    /**
     * Find documents by business unit
     */
    async findByBusinessUnit(businessUnitId: string): Promise<Document[]> {
        return this.findMany({ businessUnitId } as Partial<Document>)
    }

    /**
     * Get document by version number
     */
    async getDocumentVersion(documentId: string, versionNumber: number): Promise<Document | null> {
        const doc = await this.findById(documentId)
        if (!doc) return null

        if (doc.versionNumber === versionNumber) {
            return doc
        }

        const versions = doc.previousVersions
        if (!versions || versions.length === 0) return null

        const version = versions.find((v) => v.versionNumber === versionNumber)
        if (!version) return null

        // Return a copy with the version data
        return {
            ...doc,
            fileName: version.fileName,
            fileSize: version.fileSize,
            filePath: version.filePath || doc.filePath,
            checksum: version.checksum,
            versionNumber: version.versionNumber,
        }
    }

    /**
     * Get all versions of a document
     */
    async getAllVersions(documentId: string): Promise<DocumentVersion[]> {
        const doc = await this.findById(documentId)
        if (!doc) return []

        const versions: DocumentVersion[] = [
            {
                versionNumber: doc.versionNumber,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                filePath: doc.filePath,
                checksum: doc.checksum || '',
                isCurrent: true,
            },
        ]

        if (doc.previousVersions) {
            versions.push(...doc.previousVersions)
        }

        return versions.sort((a, b) => b.versionNumber - a.versionNumber)
    }

    /**
     * Get document statistics
     * Returns stats matching DocumentStats interface
     */
    async getStats(): Promise<DocumentStats> {
        const all = await this.findAll()
        const total = all.length

        const byType: Record<string, number> = {}
        const byStatus: Record<string, number> = {}
        const byAccessLevel: Record<string, number> = {}

        let totalSize = 0
        let totalDownloads = 0
        let active = 0
        let archived = 0

        for (const doc of all) {
            // By type
            const type = doc.documentType || 'OTHER'
            byType[type] = (byType[type] || 0) + 1

            // By status
            const status = doc.status || DocumentStatus.DRAFT
            byStatus[status] = (byStatus[status] || 0) + 1

            // By access level
            const level = doc.accessLevel || AccessLevel.INTERNAL
            byAccessLevel[level] = (byAccessLevel[level] || 0) + 1

            totalSize += doc.fileSize || 0
            totalDownloads += doc.downloadCount || 0

            if (doc.status === DocumentStatus.ARCHIVED) {
                archived++
            } else if (doc.status !== DocumentStatus.REJECTED) {
                const today = new Date()
                const isExpired = doc.expiresAt && new Date(doc.expiresAt) < today
                if (!isExpired) {
                    active++
                }
            }
        }

        return {
            totalDocuments: total,
            totalSizeBytes: totalSize,
            byType,
            byStatus,
            byAccessLevel,
            activeDocuments: active,
            archivedDocuments: archived,
            totalDownloads,
        }
    }

    /**
     * Get document distribution by type
     */
    async getTypeDistribution(): Promise<Record<DocumentType, number>> {
        const all = await this.findAll()
        const distribution: Record<DocumentType, number> = {
            [DocumentType.BCM_POLICY]: 0,
            [DocumentType.RISK_ASSESSMENT]: 0,
            [DocumentType.BIA_REPORT]: 0,
            [DocumentType.BCP_DOCUMENT]: 0,
            [DocumentType.RECOVERY_STRATEGY]: 0,
            [DocumentType.TEST_RESULTS]: 0,
            [DocumentType.INCIDENT_REPORT]: 0,
            [DocumentType.COMPLIANCE_EVIDENCE]: 0,
            [DocumentType.TRAINING_MATERIAL]: 0,
            [DocumentType.AUDIT_REPORT]: 0,
            [DocumentType.EXERCISE_REPORT]: 0,
            [DocumentType.MEETING_MINUTES]: 0,
            [DocumentType.PROCEDURE]: 0,
            [DocumentType.WORK_INSTRUCTION]: 0,
            [DocumentType.CONTACT_LIST]: 0,
            [DocumentType.VENDOR_CONTRACT]: 0,
            [DocumentType.SLA_DOCUMENT]: 0,
            [DocumentType.REGULATORY_DOCUMENT]: 0,
            [DocumentType.CERTIFICATE]: 0,
            [DocumentType.GAP_ANALYSIS]: 0,
            [DocumentType.IMPROVEMENT_PLAN]: 0,
            [DocumentType.OTHER]: 0,
        }

        for (const doc of all) {
            const type = doc.documentType || DocumentType.OTHER
            distribution[type] = (distribution[type] || 0) + 1
        }

        return distribution
    }

    /**
     * Get document distribution by status
     */
    async getStatusDistribution(): Promise<Record<DocumentStatus, number>> {
        const all = await this.findAll()
        const distribution: Record<DocumentStatus, number> = {
            [DocumentStatus.DRAFT]: 0,
            [DocumentStatus.PUBLISHED]: 0,
            [DocumentStatus.ARCHIVED]: 0,
            [DocumentStatus.UNDER_REVIEW]: 0,
            [DocumentStatus.APPROVED]: 0,
            [DocumentStatus.REJECTED]: 0,
            [DocumentStatus.EXPIRED]: 0,
            [DocumentStatus.PENDING_APPROVAL]: 0,
            [DocumentStatus.UNDER_REVISION]: 0,
            [DocumentStatus.SUPERSEDED]: 0,
        }

        for (const doc of all) {
            const status = doc.status || DocumentStatus.DRAFT
            distribution[status] = (distribution[status] || 0) + 1
        }

        return distribution
    }

    /**
     * Get total document size
     */
    async getTotalSize(): Promise<number> {
        const all = await this.findAll()
        return all.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    }

    /**
     * Get average document size
     */
    async getAverageSize(): Promise<number> {
        const all = await this.findAll()
        if (all.length === 0) return 0
        const total = all.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
        return total / all.length
    }

    /**
     * Get most downloaded documents
     */
    async getMostDownloaded(limit: number = 10): Promise<Document[]> {
        const all = await this.findAll()
        return all
            .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
            .slice(0, limit)
    }

    /**
     * Get recently uploaded documents
     */
    async getRecentUploads(limit: number = 10): Promise<Document[]> {
        return this.table
            .orderBy('createdAt')
            .reverse()
            .limit(limit)
            .toArray()
    }

    /**
     * Update document status
     */
    async updateStatus(
        uuid: string,
        status: DocumentStatus,
        userId: string = 'system'
    ): Promise<Document | null> {
        const updates: Partial<Document> = {
            status,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        }

        if (status === DocumentStatus.PUBLISHED) {
            updates.publishedBy = userId
            updates.publishedAt = new Date().toISOString()
        }

        if (status === DocumentStatus.APPROVED) {
            updates.approvedBy = userId
            updates.approvedAt = new Date().toISOString()
        }

        if (status === DocumentStatus.REJECTED) {
            updates.rejectedBy = userId
            updates.rejectedAt = new Date().toISOString()
        }

        return (await this.update(uuid, updates)) ?? null
    }

    /**
     * Approve a document
     */
    async approveDocument(
        uuid: string,
        userId: string = 'system',
        comments?: string
    ): Promise<Document | null> {
        const updates: Partial<Document> = {
            status: DocumentStatus.APPROVED,
            approvedBy: userId,
            approvedAt: new Date().toISOString(),
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        }

        if (comments !== undefined) {
            updates.approvalNotes = comments
        }

        return (await this.update(uuid, updates)) ?? null
    }

    /**
     * Reject a document
     */
    async rejectDocument(
        uuid: string,
        rejectionReason: string,
        userId: string = 'system',
        comments?: string
    ): Promise<Document | null> {
        const updates: Partial<Document> = {
            status: DocumentStatus.REJECTED,
            rejectedBy: userId,
            rejectedAt: new Date().toISOString(),
            rejectionReason: rejectionReason,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        }

        if (comments !== undefined) {
            updates.approvalNotes = comments
        }

        return (await this.update(uuid, updates)) ?? null
    }

    /**
     * Publish a document
     */
    async publishDocument(
        uuid: string,
        userId: string = 'system'
    ): Promise<Document | null> {
        return (await this.update(uuid, {
            status: DocumentStatus.PUBLISHED,
            publishedBy: userId,
            publishedAt: new Date().toISOString(),
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        })) ?? null
    }

    /**
     * Archive a document
     */
    async archiveDocument(
        uuid: string,
        userId: string = 'system'
    ): Promise<Document | null> {
        return (await this.update(uuid, {
            status: DocumentStatus.ARCHIVED,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        })) ?? null
    }

    /**
     * Submit document for review
     */
    async submitForReview(
        uuid: string,
        userId: string = 'system'
    ): Promise<Document | null> {
        return (await this.update(uuid, {
            status: DocumentStatus.UNDER_REVIEW,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        })) ?? null
    }

    /**
     * Increment download count
     */
    async incrementDownloadCount(uuid: string): Promise<Document | null> {
        const doc = await this.findById(uuid)
        if (!doc) return null

        const currentCount = doc.downloadCount || 0
        return (await this.update(uuid, {
            downloadCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
        })) ?? null
    }

    /**
     * Add version to document
     */
    async addVersion(
        uuid: string,
        version: DocumentVersion,
        userId: string = 'system'
    ): Promise<Document | null> {
        const doc = await this.findById(uuid)
        if (!doc) return null

        const previousVersions = doc.previousVersions || []

        // Add current version to previous versions
        previousVersions.push({
            versionNumber: doc.versionNumber,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            filePath: doc.filePath,
            checksum: doc.checksum || '',
            archivedAt: new Date().toISOString(),
            isCurrent: false,
        })

        return (await this.update(uuid, {
            versionNumber: version.versionNumber,
            fileName: version.fileName,
            fileSize: version.fileSize,
            filePath: version.filePath ?? doc.filePath ?? '',
            checksum: version.checksum ?? doc.checksum ?? '',
            previousVersions: previousVersions,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
        })) ?? null
    }

    /**
     * Search documents with filters
     */
    async searchWithFilters(params: {
        query?: string
        documentType?: DocumentType | DocumentType[]
        status?: DocumentStatus | DocumentStatus[]
        tags?: string[]
        uploadedBy?: string
        organisationId?: string
        fileType?: string
        minSize?: number
        maxSize?: number
        uploadedAfter?: string | Date
        uploadedBefore?: string | Date
    }): Promise<Document[]> {
        let results = await this.findAll()

        // Filter by organisation
        if (params.organisationId) {
            results = results.filter((d) => d.organisationId === params.organisationId)
        }

        // Filter by document type
        if (params.documentType) {
            const types = Array.isArray(params.documentType) ? params.documentType : [params.documentType]
            results = results.filter((d) => types.includes(d.documentType))
        }

        // Filter by status
        if (params.status) {
            const statuses = Array.isArray(params.status) ? params.status : [params.status]
            results = results.filter((d) => statuses.includes(d.status))
        }

        // Filter by tags
        if (params.tags && params.tags.length > 0) {
            results = results.filter((d) => {
                if (!d.tags) return false
                return params.tags!.some((tag) => d.tags!.includes(tag))
            })
        }

        // Filter by uploader
        if (params.uploadedBy) {
            results = results.filter((d) => d.uploadedBy === params.uploadedBy)
        }

        // Filter by file type
        if (params.fileType) {
            results = results.filter((d) => d.fileType === params.fileType)
        }

        // Filter by size range
        if (params.minSize !== undefined) {
            results = results.filter((d) => (d.fileSize || 0) >= params.minSize!)
        }
        if (params.maxSize !== undefined) {
            results = results.filter((d) => (d.fileSize || 0) <= params.maxSize!)
        }

        // Filter by upload date range
        if (params.uploadedAfter) {
            const after = params.uploadedAfter instanceof Date ? params.uploadedAfter : new Date(params.uploadedAfter)
            results = results.filter((d) => {
                const created = d.createdAt
                if (!created) return false
                const date = typeof created === 'string' ? new Date(created) : created
                return date >= after
            })
        }

        if (params.uploadedBefore) {
            const before = params.uploadedBefore instanceof Date ? params.uploadedBefore : new Date(params.uploadedBefore)
            results = results.filter((d) => {
                const created = d.createdAt
                if (!created) return false
                const date = typeof created === 'string' ? new Date(created) : created
                return date <= before
            })
        }

        // Text search (query)
        if (params.query) {
            const lower = params.query.toLowerCase()
            results = results.filter((d) =>
                d.title?.toLowerCase().includes(lower) ||
                d.description?.toLowerCase().includes(lower) ||
                d.fileName?.toLowerCase().includes(lower) ||
                d.tags?.some((tag) => tag.toLowerCase().includes(lower))
            )
        }

        return results
    }

    /**
     * Get documents requiring attention (pending approval, expired, etc.)
     */
    async getActionRequired(): Promise<{
        pendingApproval: Document[]
        expired: Document[]
        expiringSoon: Document[]
        rejected: Document[]
        total: number
    }> {
        const pendingApproval = await this.findPendingApproval()
        const expired = await this.findExpired()
        const expiringSoon = await this.findExpiringSoon(30)
        const rejected = await this.findRejected()

        return {
            pendingApproval,
            expired,
            expiringSoon,
            rejected,
            total: pendingApproval.length + expired.length + expiringSoon.length + rejected.length,
        }
    }

    /**
     * Get documents count by organisation
     */
    async countByOrganisation(organisationId: string): Promise<number> {
        const docs = await this.findByOrganisation(organisationId)
        return docs.length
    }

    /**
     * Check if document is active (not archived, not expired)
     */
    async isActive(uuid: string): Promise<boolean> {
        const doc = await this.findById(uuid)
        if (!doc) return false

        const isArchived = doc.status === DocumentStatus.ARCHIVED
        const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date()
        return !isArchived && !isExpired
    }

    /**
     * Get document by file path
     */
    async findByFilePath(filePath: string): Promise<Document | undefined> {
        return this.findOne({ filePath } as Partial<Document>)
    }

    /**
     * Get documents by multiple IDs
     */
    async findByIds(uuids: string[]): Promise<Document[]> {
        const results: Document[] = []
        for (const uuid of uuids) {
            const doc = await this.findById(uuid)
            if (doc) {
                results.push(doc)
            }
        }
        return results
    }

    /**
     * Bulk operation on documents
     */
    async bulkOperation(
        uuids: string[],
        operation: 'DELETE' | 'ARCHIVE' | 'PUBLISH' | 'STATUS',
        parameters?: { status?: DocumentStatus; tags?: string[] }
    ): Promise<{ total: number; successful: number; failed: number; errors: string[] }> {
        const result = {
            total: uuids.length,
            successful: 0,
            failed: 0,
            errors: [] as string[],
        }

        for (const uuid of uuids) {
            try {
                let success = false

                switch (operation) {
                    case 'DELETE':
                        await this.delete(uuid)
                        success = true
                        break
                    case 'ARCHIVE':
                        const archived = await this.archiveDocument(uuid)
                        success = !!archived
                        break
                    case 'PUBLISH':
                        const published = await this.publishDocument(uuid)
                        success = !!published
                        break
                    case 'STATUS':
                        if (parameters?.status) {
                            const updated = await this.updateStatus(uuid, parameters.status)
                            success = !!updated
                        }
                        break
                }

                if (success) {
                    result.successful++
                } else {
                    result.failed++
                    result.errors.push(`Failed to ${operation} document ${uuid}`)
                }
            } catch (error: any) {
                result.failed++
                result.errors.push(`Error processing document ${uuid}: ${error.message}`)
            }
        }

        return result
    }
}