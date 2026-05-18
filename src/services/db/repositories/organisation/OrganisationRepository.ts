import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import type { Organisation, BusinessUnit, Department, Document } from './../../../../models/entities'

/**
 * Organisation Repository
 */
export class OrganisationRepository extends BaseRepository<Organisation> {
  constructor(table: Table<Organisation, string>) {
    super(table, 'organisations')
  }

  async findByName(name: string): Promise<Organisation | undefined> {
    return this.findOne({ name } as Partial<Organisation>)
  }

  async findByIndustry(industryType: string): Promise<Organisation[]> {
    return this.findMany({ industry_type: industryType } as Partial<Organisation>)
  }

  async findByMaturityScoreRange(minScore: number, maxScore: number): Promise<Organisation[]> {
    const all = await this.findAll()
    return all.filter(
      (org) => (org.maturity_score || 0) >= minScore && (org.maturity_score || 0) <= maxScore
    )
  }

  async getHighMaturityOrganisations(threshold: number = 70): Promise<Organisation[]> {
    const all = await this.findAll()
    return all.filter((org) => (org.maturity_score || 0) >= threshold)
  }

  async searchByName(query: string): Promise<Organisation[]> {
    const all = await this.findAll()
    const lowerQuery = query.toLowerCase()
    return all.filter((org) => org.name.toLowerCase().includes(lowerQuery))
  }
}

/**
 * Business Unit Repository
 */
export class BusinessUnitRepository extends BaseRepository<BusinessUnit> {
  constructor(table: Table<BusinessUnit, string>) {
    super(table, 'business_units')
  }

  async findByOrganisation(organisationId: string): Promise<BusinessUnit[]> {
    return this.findMany({ organisation_id: organisationId } as Partial<BusinessUnit>)
  }

  async findByHead(headUserId: string): Promise<BusinessUnit[]> {
    return this.findMany({ head_user_id: headUserId } as Partial<BusinessUnit>)
  }

  async findByCriticality(criticalityScore: string): Promise<BusinessUnit[]> {
    return this.findMany({ criticality_score: criticalityScore } as Partial<BusinessUnit>)
  }

  async getCriticalBusinessUnits(): Promise<BusinessUnit[]> {
    const all = await this.findAll()
    return all.filter(
      (bu) => bu.criticality_score === 'CRITICAL' || bu.criticality_score === 'HIGH'
    )
  }

  async searchByName(query: string, organisationId?: string): Promise<BusinessUnit[]> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((bu) => bu.organisation_id === organisationId)
    }
    const lowerQuery = query.toLowerCase()
    return all.filter((bu) => bu.name.toLowerCase().includes(lowerQuery))
  }

  async getWithDepartments(
    businessUnitId: string,
    departmentRepo: DepartmentRepository
  ): Promise<{ businessUnit: BusinessUnit; departments: Department[] } | undefined> {
    const businessUnit = await this.findById(businessUnitId)
    if (!businessUnit) return undefined

    const departments = await departmentRepo.findByBusinessUnit(businessUnitId)
    return { businessUnit, departments }
  }
}

/**
 * Department Repository
 */
export class DepartmentRepository extends BaseRepository<Department> {
  constructor(table: Table<Department, string>) {
    super(table, 'departments')
  }

  async findByBusinessUnit(businessUnitId: string): Promise<Department[]> {
    return this.findMany({ business_id: businessUnitId } as Partial<Department>)
  }

  async findByName(name: string): Promise<Department | undefined> {
    return this.findOne({ name } as Partial<Department>)
  }

  async searchByName(query: string, businessUnitId?: string): Promise<Department[]> {
    let all = await this.findAll()
    if (businessUnitId) {
      all = all.filter((dept) => dept.business_id === businessUnitId)
    }
    const lowerQuery = query.toLowerCase()
    return all.filter((dept) => dept.name.toLowerCase().includes(lowerQuery))
  }

  async getWithRTO(): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => dept.recovery_time_objective)
  }

  async getWithRPO(): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => dept.recovery_point_objective)
  }

  async getWithoutBIA(): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => !dept.recovery_time_objective && !dept.recovery_point_objective)
  }

  async findByBusinessUnits(businessUnitIds: string[]): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => businessUnitIds.includes(dept.business_id))
  }
}

/**
 * Document Repository
 */
export class DocumentRepository extends BaseRepository<Document> {
  constructor(table: Table<Document, string>) {
    super(table, 'documents')
  }

  async findByOrganisation(organisationId: string): Promise<Document[]> {
    return this.findMany({ organisation_id: organisationId } as Partial<Document>)
  }

  async findByType(documentType: string): Promise<Document[]> {
    return this.findMany({ document_type: documentType } as Partial<Document>)
  }

  async findByStatus(status: string): Promise<Document[]> {
    return this.findMany({ status } as Partial<Document>)
  }

  async findByUploader(uploadedBy: string): Promise<Document[]> {
    return this.findMany({ uploaded_by: uploadedBy } as Partial<Document>)
  }

  async getPublishedDocuments(): Promise<Document[]> {
    return this.findMany({ status: 'PUBLISHED' } as Partial<Document>)
  }

  async getApprovedDocuments(): Promise<Document[]> {
    return this.findMany({ status: 'APPROVED' } as Partial<Document>)
  }

  async getExpiringDocuments(daysThreshold: number = 30): Promise<Document[]> {
    const all = await this.findAll()
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

    return all.filter((doc) => doc.expires_at && new Date(doc.expires_at) <= thresholdDate)
  }

  async searchByTitle(query: string, organisationId?: string): Promise<Document[]> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((doc) => doc.organisation_id === organisationId)
    }
    const lowerQuery = query.toLowerCase()
    return all.filter((doc) => doc.title.toLowerCase().includes(lowerQuery))
  }

  async searchByTags(tags: string[]): Promise<Document[]> {
    const all = await this.findAll()
    return all.filter((doc) => doc.tags?.some((tag) => tags.includes(tag)))
  }

  async incrementDownloadCount(uuid: string): Promise<void> {
    const doc = await this.findById(uuid)
    if (doc) {
      await this.update(uuid, {
        download_count: (doc.download_count || 0) + 1,
      } as Partial<Document>)
    }
  }

  async getVersionHistory(uuid: string): Promise<Document['previous_versions']> {
    const doc = await this.findById(uuid)
    return doc?.previous_versions || []
  }

  async getByAccessLevel(accessLevel: string): Promise<Document[]> {
    return this.findMany({ access_level: accessLevel } as Partial<Document>)
  }

  async getStatsByOrganisation(organisationId: string): Promise<{
    total: number
    byType: Record<string, number>
    byStatus: Record<string, number>
    totalSize: number
  }> {
    const docs = await this.findByOrganisation(organisationId)

    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let totalSize = 0

    docs.forEach((doc) => {
      byType[doc.document_type] = (byType[doc.document_type] || 0) + 1
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1
      totalSize += doc.file_size || 0
    })

    return {
      total: docs.length,
      byType,
      byStatus,
      totalSize,
    }
  }
}
