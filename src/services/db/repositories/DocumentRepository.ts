import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type { Document } from '../../../models/entities/organisation.entity'

/**
 * Document Repository
 * Provides data access for document management
 */
export class DocumentRepository extends BaseRepository<Document> {
  constructor(table: Table<Document, string>) {
    super(table, 'documents')
  }

  /**
   * Find documents by organisation
   */
  async findByOrganisation(orgId: string): Promise<Document[]> {
    return this.findMany({ organisation_id: orgId } as Partial<Document>)
  }

  /**
   * Find documents by type
   */
  async findByType(documentType: string): Promise<Document[]> {
    return this.findMany({ document_type: documentType } as Partial<Document>)
  }

  /**
   * Find documents by status
   */
  async findByStatus(status: string): Promise<Document[]> {
    return this.findMany({ status } as Partial<Document>)
  }

  /**
   * Find documents by uploader
   */
  async findByUploader(userId: string): Promise<Document[]> {
    return this.findMany({ uploaded_by: userId } as Partial<Document>)
  }

  /**
   * Find documents pending approval
   */
  async findPendingApproval(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docStatus = doc.status
        return docStatus === 'UNDER_REVIEW'
      })
      .toArray()
  }

  /**
   * Find approved documents
   */
  async findApproved(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docStatus = doc.status
        return docStatus === 'APPROVED'
      })
      .toArray()
  }

  /**
   * Find published documents
   */
  async findPublished(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docStatus = doc.status
        return docStatus === 'PUBLISHED'
      })
      .toArray()
  }

  /**
   * Find draft documents
   */
  async findDrafts(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docStatus = doc.status
        return docStatus === 'DRAFT'
      })
      .toArray()
  }

  /**
   * Find expired documents
   * Fixed: Properly handle optional expires_at and status fields
   */
  async findExpired(): Promise<Document[]> {
    const now = new Date().toISOString()
    return this.table
      .filter((doc) => {
        const expiresAt = doc.expires_at
        const docStatus = doc.status

        // Check if expires_at exists and is a valid string
        if (typeof expiresAt !== 'string' || expiresAt.length === 0) {
          return false
        }

        // Check if document has expired
        const isExpired = expiresAt <= now

        // Check if status is not already 'EXPIRED' (avoid duplicates)
        const isNotAlreadyExpired = docStatus !== 'EXPIRED'

        return isExpired && isNotAlreadyExpired
      })
      .toArray()
  }

  /**
   * Find documents by tags
   * Fixed: Properly handle optional tags array and ensure boolean return
   */
  async findByTags(tags: string[]): Promise<Document[]> {
    if (!tags || tags.length === 0) {
      return []
    }

    return this.table
      .filter((doc) => {
        const docTags = doc.tags

        // If doc has no tags, return false
        if (!Array.isArray(docTags) || docTags.length === 0) {
          return false
        }

        // Check if any of the search tags match document tags
        // Use explicit boolean return
        const hasMatchingTag = tags.some((searchTag) => {
          return docTags.some((docTag) => {
            // Ensure both are strings before comparing
            if (typeof docTag === 'string' && typeof searchTag === 'string') {
              return docTag.toLowerCase() === searchTag.toLowerCase()
            }
            return false
          })
        })

        return hasMatchingTag
      })
      .toArray()
  }

  /**
   * Find documents by a single tag
   * Fixed: Proper type guard for tag comparison
   */
  async findBySingleTag(tag: string): Promise<Document[]> {
    if (!tag) {
      return []
    }

    return this.table
      .filter((doc) => {
        const docTags = doc.tags

        // If doc has no tags, return false
        if (!Array.isArray(docTags)) {
          return false
        }

        // Check if the tag exists in document tags
        const tagLower = tag.toLowerCase()
        return docTags.some((docTag: string | null | undefined): boolean => {
          if (typeof docTag !== 'string') {
            return false
          }
          return docTag.toLowerCase() === tagLower
        })
      })
      .toArray()
  }

  /**
   * Get recent uploads
   */
  async getRecentUploads(limit: number = 10): Promise<Document[]> {
    const all = await this.findAll()

    // Sort by created_at descending
    all.sort((a, b) => {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      if (typeof dateA !== 'string' || typeof dateB !== 'string') return 0
      return dateB.localeCompare(dateA)
    })

    return all.slice(0, limit)
  }

  /**
   * Get total size of all documents
   */
  async getTotalSize(): Promise<number> {
    const docs = await this.findAll()
    return docs.reduce((sum, doc) => {
      const fileSize = doc.file_size
      return sum + (typeof fileSize === 'number' ? fileSize : 0)
    }, 0)
  }

  /**
   * Find documents by access level
   */
  async findByAccessLevel(level: string): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const accessLevel = doc.access_level
        return typeof accessLevel === 'string' && accessLevel === level
      })
      .toArray()
  }

  /**
   * Find confidential or restricted documents
   */
  async findSensitiveDocuments(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const accessLevel = doc.access_level
        return (
          typeof accessLevel === 'string' &&
          (accessLevel === 'CONFIDENTIAL' || accessLevel === 'RESTRICTED')
        )
      })
      .toArray()
  }

  /**
   * Find documents that need review (approved but not published)
   */
  async findNeedingReview(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docStatus = doc.status
        return docStatus === 'APPROVED'
      })
      .toArray()
  }

  /**
   * Find documents by version number
   */
  async findByVersion(version: number): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docVersion = doc.version_number
        return typeof docVersion === 'number' && docVersion === version
      })
      .toArray()
  }

  /**
   * Find documents with multiple versions (have previous versions)
   */
  async findWithPreviousVersions(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const prevVersions = doc.previous_versions
        return Array.isArray(prevVersions) && prevVersions.length > 0
      })
      .toArray()
  }

  /**
   * Find documents by file type
   */
  async findByFileType(fileType: string): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const type = doc.file_type
        return typeof type === 'string' && type === fileType
      })
      .toArray()
  }

  /**
   * Get document statistics
   */
  async getStats(organisationId?: string): Promise<{
    total: number
    totalSize: number
    byType: Record<string, number>
    byStatus: Record<string, number>
    byAccessLevel: Record<string, number>
    pendingApproval: number
    expired: number
  }> {
    let docs = await this.findAll()

    // Filter by organisation if specified
    if (organisationId) {
      docs = docs.filter((d) => d.organisation_id === organisationId)
    }

    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byAccessLevel: Record<string, number> = {}
    let totalSize = 0
    const now = new Date().toISOString()

    docs.forEach((doc) => {
      // Count by type
      const docType = doc.document_type
      if (typeof docType === 'string') {
        byType[docType] = (byType[docType] || 0) + 1
      }

      // Count by status
      const docStatus = doc.status
      if (typeof docStatus === 'string') {
        byStatus[docStatus] = (byStatus[docStatus] || 0) + 1
      }

      // Count by access level
      const accessLevel = doc.access_level
      if (typeof accessLevel === 'string') {
        byAccessLevel[accessLevel] = (byAccessLevel[accessLevel] || 0) + 1
      }

      // Accumulate file size
      const fileSize = doc.file_size
      if (typeof fileSize === 'number') {
        totalSize += fileSize
      }
    })

    return {
      total: docs.length,
      totalSize,
      byType,
      byStatus,
      byAccessLevel,
      pendingApproval: docs.filter((d) => d.status === 'UNDER_REVIEW').length,
      expired: docs.filter((d) => {
        const expiresAt = d.expires_at
        return typeof expiresAt === 'string' && expiresAt.length > 0 && expiresAt <= now
      }).length,
    }
  }

  /**
   * Search documents by title or description
   */
  async searchDocuments(query: string): Promise<Document[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    const searchLower = query.toLowerCase().trim()

    return this.table
      .filter((doc) => {
        const title = doc.title
        const description = doc.description

        const titleMatch = typeof title === 'string' && title.toLowerCase().includes(searchLower)
        const descMatch =
          typeof description === 'string' && description.toLowerCase().includes(searchLower)

        return titleMatch || descMatch
      })
      .toArray()
  }

  /**
   * Find documents by approval status and date range
   */
  async findApprovedInDateRange(startDate: string, endDate: string): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const docStatus = doc.status
        const approvedAt = doc.approved_at

        // Check status is APPROVED
        if (docStatus !== 'APPROVED') {
          return false
        }

        // Check approved_at is within range
        if (typeof approvedAt !== 'string' || approvedAt.length === 0) {
          return false
        }

        return approvedAt >= startDate && approvedAt <= endDate
      })
      .toArray()
  }

  /**
   * Find documents that have download count above threshold
   */
  async findPopularDocuments(minDownloads: number = 10): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const count = doc.download_count
        return typeof count === 'number' && count >= minDownloads
      })
      .toArray()
  }

  /**
   * Increment download count for a document
   */
  async incrementDownloadCount(uuid: string): Promise<void> {
    const doc = await this.findById(uuid)
    if (doc) {
      const currentCount = typeof doc.download_count === 'number' ? doc.download_count : 0
      await this.table.update(uuid, {
        download_count: currentCount + 1,
      } as any)
    }
  }

  /**
   * Get total download count across all documents
   */
  async getTotalDownloads(): Promise<number> {
    const docs = await this.findAll()
    return docs.reduce((sum, doc) => {
      const count = doc.download_count
      return sum + (typeof count === 'number' ? count : 0)
    }, 0)
  }

  /**
   * Find documents uploaded within a date range
   */
  async findByUploadDateRange(startDate: string, endDate: string): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const createdAt = doc.created_at

        if (typeof createdAt !== 'string' || createdAt.length === 0) {
          return false
        }

        return createdAt >= startDate && createdAt <= endDate
      })
      .toArray()
  }

  /**
   * Find documents that have metadata
   */
  async findWithMetadata(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const metadata = doc.metadata
        return (
          metadata !== null &&
          metadata !== undefined &&
          typeof metadata === 'object' &&
          Object.keys(metadata).length > 0
        )
      })
      .toArray()
  }

  /**
   * Find documents that have checksums (verified integrity)
   */
  async findWithChecksum(): Promise<Document[]> {
    return this.table
      .filter((doc) => {
        const checksum = doc.checksum
        return typeof checksum === 'string' && checksum.length > 0
      })
      .toArray()
  }
}
