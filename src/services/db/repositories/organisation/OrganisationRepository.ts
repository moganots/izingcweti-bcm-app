import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import type {
  Organisation,
  BusinessUnit,
  Department,
  OrganisationStatsDto,
  BusinessUnitStatsDto,
  DepartmentStatsDto,
} from './../../../../models/entities'
import {
  IndustryType,
  MaturityScore,
  CriticalityScore,
} from './../../../../models/entities'

/**
 * Organisation Repository
 * Handles CRUD operations for Organisation entities with camelCase field names
 * Aligned with organisation.entity.ts
 */
export class OrganisationRepository extends BaseRepository<Organisation> {
  constructor(table: Table<Organisation, string>) {
    super(table, 'organisations')
  }

  /**
   * Find organisation by name
   */
  async findByName(name: string): Promise<Organisation | undefined> {
    return this.findOne({ name } as Partial<Organisation>)
  }

  /**
   * Find organisation by tenant ID
   */
  async findByTenant(tenantId: string): Promise<Organisation | undefined> {
    return this.findOne({ tenantId } as Partial<Organisation>)
  }

  /**
   * Find organisations by industry type
   */
  async findByIndustry(industryType: IndustryType): Promise<Organisation[]> {
    return this.findMany({ industryType } as Partial<Organisation>)
  }

  /**
   * Find organisations by maturity score
   */
  async findByMaturityScore(maturityScore: MaturityScore): Promise<Organisation[]> {
    return this.findMany({ maturityScore } as Partial<Organisation>)
  }

  /**
   * Find active organisations
   */
  async findActive(): Promise<Organisation[]> {
    return this.findMany({ isActive: true } as Partial<Organisation>)
  }

  /**
   * Find inactive organisations
   */
  async findInactive(): Promise<Organisation[]> {
    return this.findMany({ isActive: false } as Partial<Organisation>)
  }

  /**
   * Find organisations by region
   */
  async findByRegion(region: string): Promise<Organisation[]> {
    return this.findMany({ region } as Partial<Organisation>)
  }

  /**
   * Search organisations by name
   */
  async searchByName(query: string): Promise<Organisation[]> {
    const all = await this.findAll()
    const lowerQuery = query.toLowerCase()
    return all.filter((org) => org.name.toLowerCase().includes(lowerQuery))
  }

  /**
   * Get high maturity organisations (based on maturity score enum)
   */
  async getHighMaturityOrganisations(minScore: MaturityScore = MaturityScore.DEFINED): Promise<Organisation[]> {
    const all = await this.findAll()
    const scoreOrder: Record<MaturityScore, number> = {
      [MaturityScore.INITIAL]: 1,
      [MaturityScore.REPEATABLE]: 2,
      [MaturityScore.DEFINED]: 3,
      [MaturityScore.QUANTITATIVELY_MANAGED]: 4,
      [MaturityScore.OPTIMIZING]: 5,
    }
    const threshold = scoreOrder[minScore]
    return all.filter((org) => {
      const score = org.maturityScore ? scoreOrder[org.maturityScore] : 0
      return score >= threshold
    })
  }

  /**
   * Get organisation statistics
   * Returns stats matching OrganisationStatsDto
   */
  async getStats(): Promise<OrganisationStatsDto> {
    const all = await this.findAll()

    const byIndustry: Record<string, number> = {}
    const byMaturity: Record<string, number> = {}

    let totalBusinessUnits = 0
    let totalDepartments = 0
    let totalUsers = 0

    for (const org of all) {
      // Count by industry
      const industry = org.industryType || 'OTHER'
      byIndustry[industry] = (byIndustry[industry] || 0) + 1

      // Count by maturity
      const maturity = org.maturityScore || 'INITIAL'
      byMaturity[maturity] = (byMaturity[maturity] || 0) + 1

      // Count business units (this would need to query BusinessUnit table)
      // For now, we'll approximate with a placeholder
      // In practice, this would be a separate query
    }

    return {
      totalOrganisations: all.length,
      byIndustry,
      byMaturity,
      totalBusinessUnits,
      totalDepartments,
      totalUsers,
    }
  }

  /**
   * Get organisations by employee count range
   */
  async findByEmployeeCountRange(min: number, max: number): Promise<Organisation[]> {
    const all = await this.findAll()
    return all.filter((org) => {
      const count = org.employeeCount || 0
      return count >= min && count <= max
    })
  }

  /**
   * Get organisations with upcoming assessments
   */
  async findWithUpcomingAssessments(days: number = 30): Promise<Organisation[]> {
    const all = await this.findAll()
    const today = new Date()
    const future = new Date(today)
    future.setDate(future.getDate() + days)

    return all.filter((org) => {
      if (!org.nextAssessmentDate) return false
      const date = org.nextAssessmentDate instanceof Date ? org.nextAssessmentDate : new Date(org.nextAssessmentDate)
      return date >= today && date <= future
    })
  }

  /**
   * Get organisations with overdue assessments
   */
  async findWithOverdueAssessments(): Promise<Organisation[]> {
    const all = await this.findAll()
    const today = new Date()

    return all.filter((org) => {
      if (!org.nextAssessmentDate) return false
      const date = org.nextAssessmentDate instanceof Date ? org.nextAssessmentDate : new Date(org.nextAssessmentDate)
      return date < today
    })
  }

  /**
   * Get organisation by ID with full verification
   */
  async getOrganisationByIdWithVerification(
    uuid: string,
    organisationId?: string
  ): Promise<Organisation | null> {
    const org = await this.findById(uuid)
    if (!org) return null

    // If organisationId is provided, verify it matches
    if (organisationId && org.uuid !== organisationId) {
      return null
    }

    return org
  }

  /**
   * Count organisations by industry
   */
  async countByIndustry(): Promise<Record<IndustryType, number>> {
    const all = await this.findAll()
    const counts: Record<IndustryType, number> = {
      [IndustryType.FINANCE]: 0,
      [IndustryType.HEALTHCARE]: 0,
      [IndustryType.TECH]: 0,
      [IndustryType.MANUFACTURING]: 0,
      [IndustryType.RETAIL]: 0,
      [IndustryType.GOVERNMENT]: 0,
      [IndustryType.EDUCATION]: 0,
      [IndustryType.OTHER]: 0,
    }

    for (const org of all) {
      const type = org.industryType || IndustryType.OTHER
      counts[type] = (counts[type] || 0) + 1
    }

    return counts
  }

  /**
   * Count organisations by maturity
   */
  async countByMaturity(): Promise<Record<MaturityScore, number>> {
    const all = await this.findAll()
    const counts: Record<MaturityScore, number> = {
      [MaturityScore.INITIAL]: 0,
      [MaturityScore.REPEATABLE]: 0,
      [MaturityScore.DEFINED]: 0,
      [MaturityScore.QUANTITATIVELY_MANAGED]: 0,
      [MaturityScore.OPTIMIZING]: 0,
    }

    for (const org of all) {
      const score = org.maturityScore || MaturityScore.INITIAL
      counts[score] = (counts[score] || 0) + 1
    }

    return counts
  }

  /**
   * Get organisation distribution by industry and maturity
   */
  async getDistributionStats(): Promise<{
    byIndustry: Record<string, number>
    byMaturity: Record<string, number>
    byRegion: Record<string, number>
    totalActive: number
    totalInactive: number
  }> {
    const all = await this.findAll()

    const byIndustry: Record<string, number> = {}
    const byMaturity: Record<string, number> = {}
    const byRegion: Record<string, number> = {}
    let totalActive = 0
    let totalInactive = 0

    for (const org of all) {
      const industry = org.industryType || 'OTHER'
      byIndustry[industry] = (byIndustry[industry] || 0) + 1

      const maturity = org.maturityScore || 'INITIAL'
      byMaturity[maturity] = (byMaturity[maturity] || 0) + 1

      if (org.region) {
        byRegion[org.region] = (byRegion[org.region] || 0) + 1
      }

      if (org.isActive) {
        totalActive++
      } else {
        totalInactive++
      }
    }

    return {
      byIndustry,
      byMaturity,
      byRegion,
      totalActive,
      totalInactive,
    }
  }
}

/**
 * Business Unit Repository
 * Handles CRUD operations for BusinessUnit entities with camelCase field names
 */
export class BusinessUnitRepository extends BaseRepository<BusinessUnit> {
  constructor(table: Table<BusinessUnit, string>) {
    super(table, 'business_units')
  }

  /**
   * Find business units by organisation
   */
  async findByOrganisation(organisationId: string): Promise<BusinessUnit[]> {
    return this.findMany({ organisationId } as Partial<BusinessUnit>)
  }

  /**
   * Find business units by head user
   */
  async findByHead(headUserId: string): Promise<BusinessUnit[]> {
    return this.findMany({ headUserId } as Partial<BusinessUnit>)
  }

  /**
   * Find business units by criticality score
   */
  async findByCriticality(criticalityScore: CriticalityScore): Promise<BusinessUnit[]> {
    return this.findMany({ criticalityScore } as Partial<BusinessUnit>)
  }

  /**
   * Find active business units
   */
  async findActive(): Promise<BusinessUnit[]> {
    return this.findMany({ isActive: true } as Partial<BusinessUnit>)
  }

  /**
   * Find critical business units (CRITICAL and URGENT)
   */
  async findCritical(): Promise<BusinessUnit[]> {
    const all = await this.findAll()
    return all.filter((bu) =>
      bu.criticalityScore === CriticalityScore.CRITICAL ||
      bu.criticalityScore === CriticalityScore.URGENT
    )
  }

  /**
   * Find business units by name search
   */
  async searchByName(query: string, organisationId?: string): Promise<BusinessUnit[]> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((bu) => bu.organisationId === organisationId)
    }
    const lowerQuery = query.toLowerCase()
    return all.filter((bu) => bu.name.toLowerCase().includes(lowerQuery))
  }

  /**
   * Get business unit with departments
   */
  async getWithDepartments(
    businessUnitId: string,
    departmentRepo: DepartmentRepository
  ): Promise<{ businessUnit: BusinessUnit; departments: Department[] } | undefined> {
    const businessUnit = await this.findById(businessUnitId)
    if (!businessUnit) return undefined

    const departments = await departmentRepo.findByBusinessUnit(businessUnitId)
    return { businessUnit, departments }
  }

  /**
   * Get business unit statistics
   * Returns stats matching BusinessUnitStatsDto
   */
  async getStats(organisationId?: string): Promise<BusinessUnitStatsDto> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((bu) => bu.organisationId === organisationId)
    }

    const byCriticality: Record<string, number> = {}
    let totalDepartments = 0
    let totalEmployees = 0

    for (const bu of all) {
      const criticality = bu.criticalityScore || CriticalityScore.NORMAL
      byCriticality[criticality] = (byCriticality[criticality] || 0) + 1
      totalEmployees += bu.employeeCount || 0
    }

    return {
      total: all.length,
      active: all.filter((bu) => bu.isActive).length,
      byCriticality,
      totalDepartments,
      totalEmployees,
    }
  }

  /**
   * Get business units by employee count range
   */
  async findByEmployeeCountRange(min: number, max: number): Promise<BusinessUnit[]> {
    const all = await this.findAll()
    return all.filter((bu) => {
      const count = bu.employeeCount || 0
      return count >= min && count <= max
    })
  }

  /**
   * Get business units with budget
   */
  async findWithBudget(): Promise<BusinessUnit[]> {
    return this.table
      .filter((bu) => bu.budget !== undefined && bu.budget !== null)
      .toArray()
  }

  /**
   * Count business units by criticality
   */
  async countByCriticality(): Promise<Record<CriticalityScore, number>> {
    const all = await this.findAll()
    const counts: Record<CriticalityScore, number> = {
      [CriticalityScore.CRITICAL]: 0,
      [CriticalityScore.URGENT]: 0,
      [CriticalityScore.IMPORTANT]: 0,
      [CriticalityScore.NORMAL]: 0,
      [CriticalityScore.NON_ESSENTIAL]: 0,
    }

    for (const bu of all) {
      const score = bu.criticalityScore || CriticalityScore.NORMAL
      counts[score] = (counts[score] || 0) + 1
    }

    return counts
  }
}

/**
 * Department Repository
 * Handles CRUD operations for Department entities with camelCase field names
 */
export class DepartmentRepository extends BaseRepository<Department> {
  constructor(table: Table<Department, string>) {
    super(table, 'departments')
  }

  /**
   * Find departments by business unit
   */
  async findByBusinessUnit(businessUnitId: string): Promise<Department[]> {
    return this.findMany({ businessUnitId } as Partial<Department>)
  }

  /**
   * Find departments by parent department
   */
  async findByParent(parentDepartmentId: string): Promise<Department[]> {
    return this.findMany({ parentDepartmentId } as Partial<Department>)
  }

  /**
   * Find departments by name
   */
  async findByName(name: string): Promise<Department | undefined> {
    return this.findOne({ name } as Partial<Department>)
  }

  /**
   * Find active departments
   */
  async findActive(): Promise<Department[]> {
    return this.findMany({ isActive: true } as Partial<Department>)
  }

  /**
   * Find departments with RTO defined
   */
  async findWithRTO(): Promise<Department[]> {
    return this.table
      .filter((dept) => dept.recoveryTimeObjectiveHours !== undefined && dept.recoveryTimeObjectiveHours !== null)
      .toArray()
  }

  /**
   * Find departments with RPO defined
   */
  async findWithRPO(): Promise<Department[]> {
    return this.table
      .filter((dept) => dept.recoveryPointObjectiveHours !== undefined && dept.recoveryPointObjectiveHours !== null)
      .toArray()
  }

  /**
   * Find departments without RTO or RPO (missing BIA)
   */
  async findWithoutBIA(): Promise<Department[]> {
    return this.table
      .filter((dept) =>
        (dept.recoveryTimeObjectiveHours === undefined || dept.recoveryTimeObjectiveHours === null) &&
        (dept.recoveryPointObjectiveHours === undefined || dept.recoveryPointObjectiveHours === null)
      )
      .toArray()
  }

  /**
   * Find departments by search name
   */
  async searchByName(query: string, businessUnitId?: string): Promise<Department[]> {
    let all = await this.findAll()
    if (businessUnitId) {
      all = all.filter((dept) => dept.businessUnitId === businessUnitId)
    }
    const lowerQuery = query.toLowerCase()
    return all.filter((dept) => dept.name.toLowerCase().includes(lowerQuery))
  }

  /**
   * Find departments by business units
   */
  async findByBusinessUnits(businessUnitIds: string[]): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => businessUnitIds.includes(dept.businessUnitId))
  }

  /**
   * Get department hierarchy
   */
  async getHierarchy(businessUnitId: string): Promise<DepartmentTreeNode[]> {
    const all = await this.findByBusinessUnit(businessUnitId)
    const topLevel = all.filter((dept) => !dept.parentDepartmentId)
    const childrenMap = new Map<string, Department[]>()

    for (const dept of all) {
      if (dept.parentDepartmentId) {
        const children = childrenMap.get(dept.parentDepartmentId) || []
        children.push(dept)
        childrenMap.set(dept.parentDepartmentId, children)
      }
    }

    function buildTree(department: Department): DepartmentTreeNode {
      const children = childrenMap.get(department.uuid) || []
      const node: DepartmentTreeNode = {
        uuid: department.uuid,
        name: department.name,
        order: department.order || 0,
        children: children.map(buildTree),
      }

      if (department.description !== undefined) {
        node.description = department.description
      }
      if (department.recoveryTimeObjectiveHours !== undefined) {
        node.recoveryTimeObjectiveHours = department.recoveryTimeObjectiveHours
      }
      if (department.recoveryPointObjectiveHours !== undefined) {
        node.recoveryPointObjectiveHours = department.recoveryPointObjectiveHours
      }

      return node
    }

    return topLevel.map(buildTree)
  }

  /**
   * Get department statistics
   * Returns stats matching DepartmentStatsDto
   */
  async getStats(businessUnitId?: string): Promise<DepartmentStatsDto> {
    let all = await this.findAll()
    if (businessUnitId) {
      all = all.filter((dept) => dept.businessUnitId === businessUnitId)
    }

    const withRTO = all.filter((d) => d.recoveryTimeObjectiveHours !== undefined && d.recoveryTimeObjectiveHours !== null)
    const withRPO = all.filter((d) => d.recoveryPointObjectiveHours !== undefined && d.recoveryPointObjectiveHours !== null)
    let totalEmployees = 0

    for (const dept of all) {
      totalEmployees += dept.employeeCount || 0
    }

    return {
      total: all.length,
      active: all.filter((d) => d.isActive).length,
      withRTO: withRTO.length,
      withRPO: withRPO.length,
      totalEmployees,
    }
  }

  /**
   * Reorder departments
   */
  async reorderDepartments(departmentIds: string[]): Promise<void> {
    for (let i = 0; i < departmentIds.length; i++) {
      await this.update(departmentIds[i]!, {
        order: i,
        updatedAt: new Date(),
      } as unknown as Partial<Department>)
    }
  }

  /**
   * Get departments by RTO range
   */
  async findByRTORange(min: number, max: number): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => {
      const rto = dept.recoveryTimeObjectiveHours
      return rto !== undefined && rto !== null && rto >= min && rto <= max
    })
  }

  /**
   * Get departments by RPO range
   */
  async findByRPORange(min: number, max: number): Promise<Department[]> {
    const all = await this.findAll()
    return all.filter((dept) => {
      const rpo = dept.recoveryPointObjectiveHours
      return rpo !== undefined && rpo !== null && rpo >= min && rpo <= max
    })
  }

  /**
   * Get department with critical functions count
   */
  async getDepartmentWithCriticalFunctions(
    departmentId: string,
    _criticalFunctionRepo: any // Would be CriticalFunctionRepository
  ): Promise<Department | { department: Department; criticalFunctions: any[] } | null> {
    const department = await this.findById(departmentId)
    if (!department) return null

    // This would call the CriticalFunctionRepository to get functions
    // For now, return the department with a placeholder
    return department
  }

  /**
   * Get department tree for an organisation
   */
  async getDepartmentTree(organisationId: string): Promise<DepartmentTreeNode[]> {
    // First get all business units for the organisation
    // Then get departments for each business unit
    // This is a simplified version
    const all = await this.findAll()
    const organisationUnits = all.filter((dept) => dept.businessUnitId === organisationId)

    // Build tree from flat list
    const topLevel = organisationUnits.filter((dept) => !dept.parentDepartmentId)
    const childrenMap = new Map<string, Department[]>()

    for (const dept of organisationUnits) {
      if (dept.parentDepartmentId) {
        const children = childrenMap.get(dept.parentDepartmentId) || []
        children.push(dept)
        childrenMap.set(dept.parentDepartmentId, children)
      }
    }

    function buildTree(department: Department): DepartmentTreeNode {
      const children = childrenMap.get(department.uuid) || []
      const node: DepartmentTreeNode = {
        uuid: department.uuid,
        name: department.name,
        order: department.order || 0,
        children: children.map(buildTree),
      }

      if (department.description !== undefined) {
        node.description = department.description
      }

      if (department.recoveryTimeObjectiveHours !== undefined) {
        node.recoveryTimeObjectiveHours = department.recoveryTimeObjectiveHours
      }

      if (department.recoveryPointObjectiveHours !== undefined) {
        node.recoveryPointObjectiveHours = department.recoveryPointObjectiveHours
      }

      return node
    }

    return topLevel.map(buildTree)
  }
}

// Type for DepartmentTreeNode (exported from organisation.entity.ts)
// We need to import it from the entity file
import { DepartmentTreeNode } from './../../../../models/entities'