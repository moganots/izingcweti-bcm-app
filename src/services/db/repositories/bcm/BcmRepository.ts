import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  ComplianceRecord,
  BCMPlanStatus,
  RecoveryStrategyType,
  ExerciseTestType,
  ReputationalImpact,
  RecoveryPriority,
} from './../../../../models/entities'

/**
 * Critical Function Repository
 * Handles CRUD operations for CriticalFunction entities with camelCase field names
 */
export class CriticalFunctionRepository extends BaseRepository<CriticalFunction> {
  constructor(table: Table<CriticalFunction, string>) {
    super(table, 'critical_functions')
  }

  async findByDepartment(departmentId: string): Promise<CriticalFunction[]> {
    return this.findMany({ departmentId } as Partial<CriticalFunction>)
  }

  async findByOrganisation(organisationId: string): Promise<CriticalFunction[]> {
    return this.findMany({ organisationId } as Partial<CriticalFunction>)
  }

  async findByName(name: string): Promise<CriticalFunction | undefined> {
    return this.findOne({ name } as Partial<CriticalFunction>)
  }

  async findByRecoveryPriority(priority: RecoveryPriority): Promise<CriticalFunction[]> {
    return this.findMany({ recoveryPriority: priority } as Partial<CriticalFunction>)
  }

  async findActive(): Promise<CriticalFunction[]> {
    return this.findMany({ isActive: true } as Partial<CriticalFunction>)
  }

  async findRequiringBCP(): Promise<CriticalFunction[]> {
    return this.findMany({ requiresBcp: true } as Partial<CriticalFunction>)
  }

  async findWithDependencies(): Promise<CriticalFunction[]> {
    return this.table
      .filter((cf) => {
        const deps = cf.dependencies
        return Array.isArray(deps) && deps.length > 0
      })
      .toArray()
  }

  async findWithBIA(): Promise<CriticalFunction[]> {
    return this.table
      .filter((cf) => cf.businessImpactAssessment !== undefined)
      .toArray()
  }

  async findWithBCP(): Promise<CriticalFunction[]> {
    return this.table
      .filter((cf) => cf.businessContinuityPlan !== undefined)
      .toArray()
  }

  async findByMaximumTolerableDowntime(maxMtd: number): Promise<CriticalFunction[]> {
    return this.table
      .filter((cf) => {
        const mtd = cf.maximumTolerableDowntime
        return typeof mtd === 'number' && mtd <= maxMtd
      })
      .toArray()
  }

  async getPriorityDistribution(): Promise<Record<RecoveryPriority, number>> {
    const functions = await this.findAll()
    const distribution: Record<RecoveryPriority, number> = {
      [RecoveryPriority.CRITICAL]: 0,
      [RecoveryPriority.HIGH]: 0,
      [RecoveryPriority.MEDIUM]: 0,
      [RecoveryPriority.LOW]: 0,
    }

    for (const fn of functions) {
      if (fn.recoveryPriority) {
        distribution[fn.recoveryPriority] = (distribution[fn.recoveryPriority] || 0) + 1
      }
    }

    return distribution
  }
}

/**
 * BIA Repository
 * Handles CRUD operations for BusinessImpactAssessment entities with camelCase field names
 */
export class BIARepository extends BaseRepository<BusinessImpactAssessment> {
  constructor(table: Table<BusinessImpactAssessment, string>) {
    super(table, 'business_impact_assessments')
  }

  async findByFunction(functionId: string): Promise<BusinessImpactAssessment | undefined> {
    return this.findOne({ criticalFunctionId: functionId } as Partial<BusinessImpactAssessment>)
  }

  async findByOrganisation(organisationId: string): Promise<BusinessImpactAssessment[]> {
    return this.findMany({ organisationId } as Partial<BusinessImpactAssessment>)
  }

  async findByReputationalImpact(impact: ReputationalImpact): Promise<BusinessImpactAssessment[]> {
    return this.findMany({ reputationalImpact: impact } as Partial<BusinessImpactAssessment>)
  }

  async getHighImpactAssessments(threshold: number = 100000): Promise<BusinessImpactAssessment[]> {
    return this.table
      .filter((bia) => {
        const impact = bia.financialImpactPerDay
        return typeof impact === 'number' && impact >= threshold
      })
      .toArray()
  }

  async getAssessedFunctions(): Promise<string[]> {
    const bias = await this.findAll()
    return bias
      .map((b) => b.criticalFunctionId)
      .filter((id): id is string => id !== undefined && id !== null)
  }

  async getFinancialImpactTotal(): Promise<number> {
    const bias = await this.findAll()
    return bias.reduce((sum, b) => sum + (b.financialImpactPerDay || 0), 0)
  }

  async getAverageFinancialImpact(): Promise<number> {
    const bias = await this.findAll()
    if (bias.length === 0) return 0
    const total = bias.reduce((sum, b) => sum + (b.financialImpactPerDay || 0), 0)
    return total / bias.length
  }

  async findAssessedAfter(date: Date): Promise<BusinessImpactAssessment[]> {
    return this.table
      .filter((bia) => {
        const assessedDate = bia.assessedDate
        if (!assessedDate) return false
        const dateObj = assessedDate instanceof Date ? assessedDate : new Date(assessedDate)
        return dateObj >= date
      })
      .toArray()
  }
}

/**
 * BCP Repository
 * Handles CRUD operations for BusinessContinuityPlan entities with camelCase field names
 */
export class BCPRepository extends BaseRepository<BusinessContinuityPlan> {
  constructor(table: Table<BusinessContinuityPlan, string>) {
    super(table, 'business_continuity_plans')
  }

  async findByFunction(functionId: string): Promise<BusinessContinuityPlan | undefined> {
    return this.findOne({ criticalFunctionId: functionId } as Partial<BusinessContinuityPlan>)
  }

  async findByOrganisation(organisationId: string): Promise<BusinessContinuityPlan[]> {
    return this.findMany({ organisationId } as Partial<BusinessContinuityPlan>)
  }

  async findByStatus(status: BCMPlanStatus): Promise<BusinessContinuityPlan[]> {
    return this.findMany({ planStatus: status } as Partial<BusinessContinuityPlan>)
  }

  async findActive(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus(BCMPlanStatus.ACTIVE)
  }

  async findApproved(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus(BCMPlanStatus.APPROVED)
  }

  async findDraft(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus(BCMPlanStatus.DRAFT)
  }

  async findArchived(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus(BCMPlanStatus.ARCHIVED)
  }

  async findUnderReview(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus(BCMPlanStatus.UNDER_REVIEW)
  }

  /**
   * Find BCPs due for review before a given date
   */
  async findDueForReview(beforeDate: string): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const dueDate = bcp.reviewDueDate
        if (!dueDate) return false

        const dateStr =
          dueDate instanceof Date
            ? dueDate.toISOString().split('T')[0]
            : typeof dueDate === 'string'
              ? dueDate
              : String(dueDate)

        if (!dateStr) return false

        return dateStr <= beforeDate
      })
      .toArray()
  }

  /**
   * Find BCPs that are overdue for review
   */
  async findOverdue(): Promise<BusinessContinuityPlan[]> {
    const today = formatISO(new Date()) ?? ''
    return this.findDueForReview(today!)
  }

  async getByVersion(version: number): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const bcpVersion = bcp.version
        return typeof bcpVersion === 'number' && bcpVersion === version
      })
      .toArray()
  }

  /**
   * Find BCPs with emergency contacts configured
   */
  async findWithEmergencyContacts(): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const contacts = bcp.emergencyContactList
        return (
          contacts !== null &&
          contacts !== undefined &&
          typeof contacts === 'object' &&
          Object.keys(contacts).length > 0
        )
      })
      .toArray()
  }

  /**
   * Find BCPs that have associated documents
   */
  async findWithDocuments(): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const docUrl = bcp.planDocumentUrl
        return typeof docUrl === 'string' && docUrl.length > 0
      })
      .toArray()
  }

  /**
   * Find BCPs with recovery strategies
   */
  async findWithStrategies(): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const strategies = bcp.recoveryStrategies
        return Array.isArray(strategies) && strategies.length > 0
      })
      .toArray()
  }

  /**
   * Find BCPs with exercise tests
   */
  async findWithTests(): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const tests = bcp.exerciseTests
        return Array.isArray(tests) && tests.length > 0
      })
      .toArray()
  }

  async getStatusDistribution(): Promise<Record<BCMPlanStatus, number>> {
    const plans = await this.findAll()
    const distribution: Record<BCMPlanStatus, number> = {
      [BCMPlanStatus.DRAFT]: 0,
      [BCMPlanStatus.APPROVED]: 0,
      [BCMPlanStatus.ACTIVE]: 0,
      [BCMPlanStatus.ARCHIVED]: 0,
      [BCMPlanStatus.UNDER_REVIEW]: 0,
    }

    for (const plan of plans) {
      if (plan.planStatus) {
        distribution[plan.planStatus] = (distribution[plan.planStatus] || 0) + 1
      }
    }

    return distribution
  }
}

/**
 * Recovery Strategy Repository
 * Handles CRUD operations for RecoveryStrategy entities with camelCase field names
 */
export class RecoveryStrategyRepository extends BaseRepository<RecoveryStrategy> {
  constructor(table: Table<RecoveryStrategy, string>) {
    super(table, 'recovery_strategies')
  }

  async findByBCP(bcpId: string): Promise<RecoveryStrategy[]> {
    return this.findMany({
      businessContinuityPlanId: bcpId,
    } as Partial<RecoveryStrategy>)
  }

  async findByOrganisation(organisationId: string): Promise<RecoveryStrategy[]> {
    return this.findMany({ organisationId } as Partial<RecoveryStrategy>)
  }

  async findByType(type: RecoveryStrategyType): Promise<RecoveryStrategy[]> {
    return this.findMany({
      recoveryStrategyType: type,
    } as Partial<RecoveryStrategy>)
  }

  async findPrimary(): Promise<RecoveryStrategy[]> {
    return this.findMany({ isPrimary: true } as Partial<RecoveryStrategy>)
  }

  async findActive(): Promise<RecoveryStrategy[]> {
    return this.findMany({ isActive: true } as Partial<RecoveryStrategy>)
  }

  async getHighSuccessRate(minRate: number = 80): Promise<RecoveryStrategy[]> {
    return this.table
      .filter((rs) => {
        const rate = rs.testSuccessRate
        return typeof rate === 'number' && rate >= minRate
      })
      .toArray()
  }

  async getLowSuccessRate(maxRate: number = 50): Promise<RecoveryStrategy[]> {
    return this.table
      .filter((rs) => {
        const rate = rs.testSuccessRate
        return typeof rate === 'number' && rate <= maxRate
      })
      .toArray()
  }

  async getTotalCost(bcpId: string): Promise<number> {
    const strategies = await this.findByBCP(bcpId)
    return strategies.reduce((sum, s) => {
      const cost = s.estimatedRecoveryCost
      return sum + (typeof cost === 'number' ? cost : 0)
    }, 0)
  }

  async getAverageSuccessRate(bcpId: string): Promise<number> {
    const strategies = await this.findByBCP(bcpId)
    if (strategies.length === 0) return 0

    const total = strategies.reduce((sum, s) => {
      const rate = s.testSuccessRate
      return sum + (typeof rate === 'number' ? rate : 0)
    }, 0)

    return Math.round((total / strategies.length) * 100) / 100
  }

  async getTypeDistribution(): Promise<Record<RecoveryStrategyType, number>> {
    const strategies = await this.findAll()
    const distribution: Record<RecoveryStrategyType, number> = {
      [RecoveryStrategyType.HOT_SITE]: 0,
      [RecoveryStrategyType.COLD_SITE]: 0,
      [RecoveryStrategyType.CLOUD_FAILOVER]: 0,
      [RecoveryStrategyType.MANUAL_WORKAROUND]: 0,
      [RecoveryStrategyType.HYBRID]: 0,
      [RecoveryStrategyType.MUTUAL_AGREEMENT]: 0,
    }

    for (const strategy of strategies) {
      if (strategy.recoveryStrategyType) {
        distribution[strategy.recoveryStrategyType] = (distribution[strategy.recoveryStrategyType] || 0) + 1
      }
    }

    return distribution
  }
}

/**
 * Exercise Test Repository
 * Handles CRUD operations for ExerciseTest entities with camelCase field names
 */
export class ExerciseTestRepository extends BaseRepository<ExerciseTest> {
  constructor(table: Table<ExerciseTest, string>) {
    super(table, 'exercise_tests')
  }

  async findByBCP(bcpId: string): Promise<ExerciseTest[]> {
    return this.findMany({
      businessContinuityPlanId: bcpId,
    } as Partial<ExerciseTest>)
  }

  async findByOrganisation(organisationId: string): Promise<ExerciseTest[]> {
    return this.findMany({ organisationId } as Partial<ExerciseTest>)
  }

  async findByType(type: ExerciseTestType): Promise<ExerciseTest[]> {
    return this.findMany({
      exerciseTestType: type,
    } as Partial<ExerciseTest>)
  }

  async findPassed(): Promise<ExerciseTest[]> {
    return this.table
      .filter((test) => {
        return test.passed === true
      })
      .toArray()
  }

  async findFailed(): Promise<ExerciseTest[]> {
    return this.table
      .filter((test) => {
        return test.passed === false
      })
      .toArray()
  }

  /**
   * Find upcoming tests (scheduled date is today or in the future, not yet passed)
   */
  async findUpcoming(): Promise<ExerciseTest[]> {
    const today = formatISO(new Date())
    return this.table
      .filter((test) => {
        const scheduledDate = test.scheduledDate
        if (!scheduledDate) return false

        const dateStr =
          scheduledDate instanceof Date ? scheduledDate.toISOString().split('T')[0] : String(scheduledDate ?? '')

        if (!dateStr) return false

        // Only upcoming if date is today or future AND not passed
        return dateStr >= today! && test.passed !== true
      })
      .toArray()
  }

  /**
   * Find overdue tests (scheduled date is in the past, not yet passed)
   */
  async findOverdue(): Promise<ExerciseTest[]> {
    const today = formatISO(new Date())
    return this.table
      .filter((test) => {
        const scheduledDate = test.scheduledDate
        if (!scheduledDate) return false

        const dateStr =
          scheduledDate instanceof Date ? scheduledDate.toISOString().split('T')[0] : String(scheduledDate ?? '')

        if (!dateStr) return false

        // Overdue if date is in the past AND not passed
        return dateStr < today! && test.passed !== true
      })
      .toArray()
  }

  /**
   * Find tests within a date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<ExerciseTest[]> {
    return this.table
      .filter((test) => {
        const scheduledDate = test.scheduledDate
        if (!scheduledDate) return false

        const dateStr =
          scheduledDate instanceof Date ? scheduledDate.toISOString().split('T')[0] : String(scheduledDate ?? '')

        if (!dateStr) return false

        return dateStr >= startDate && dateStr <= endDate
      })
      .toArray()
  }

  /**
   * Get test statistics
   */
  async getStats(bcpId?: string): Promise<{
    total: number
    passed: number
    failed: number
    upcoming: number
    overdue: number
    passRate: number
    byType: Record<ExerciseTestType, number>
  }> {
    let tests = await this.findAll()

    if (bcpId) {
      tests = tests.filter((t) => t.businessContinuityPlanId === bcpId)
    }

    const passed = tests.filter((t) => t.passed === true).length
    const failed = tests.filter((t) => t.passed === false).length
    const total = tests.length

    const byType: Record<ExerciseTestType, number> = {
      [ExerciseTestType.TABLETOP]: 0,
      [ExerciseTestType.WALKTHROUGH]: 0,
      [ExerciseTestType.FULL]: 0,
      [ExerciseTestType.TECHNICAL]: 0,
      [ExerciseTestType.FULL_SCALE]: 0,
      [ExerciseTestType.SIMULATION]: 0,
    }

    const today = formatISO(new Date()) ?? ''

    let upcoming = 0
    let overdue = 0

    for (const test of tests) {
      if (test.exerciseTestType) {
        byType[test.exerciseTestType] = (byType[test.exerciseTestType] || 0) + 1
      }

      const scheduledDate = test.scheduledDate
      if (scheduledDate) {
        const dateStr = scheduledDate instanceof Date ? scheduledDate.toISOString().split('T')[0] : String(scheduledDate)
        if (dateStr && dateStr >= today && test.passed !== true) {
          upcoming++
        } else if (dateStr && dateStr < today && test.passed !== true) {
          overdue++
        }
      }
    }

    return {
      total,
      passed,
      failed,
      upcoming,
      overdue,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      byType,
    }
  }

  async getTypeDistribution(): Promise<Record<ExerciseTestType, number>> {
    const tests = await this.findAll()
    const distribution: Record<ExerciseTestType, number> = {
      [ExerciseTestType.TABLETOP]: 0,
      [ExerciseTestType.WALKTHROUGH]: 0,
      [ExerciseTestType.FULL]: 0,
      [ExerciseTestType.TECHNICAL]: 0,
      [ExerciseTestType.FULL_SCALE]: 0,
      [ExerciseTestType.SIMULATION]: 0,
    }

    for (const test of tests) {
      if (test.exerciseTestType) {
        distribution[test.exerciseTestType] = (distribution[test.exerciseTestType] || 0) + 1
      }
    }

    return distribution
  }
}

/**
 * Compliance Record Repository
 * Handles CRUD operations for ComplianceRecord entities with camelCase field names
 */
export class ComplianceRecordRepository extends BaseRepository<ComplianceRecord> {
  constructor(table: Table<ComplianceRecord, string>) {
    super(table, 'compliance_records')
  }

  async findByOrganisation(orgId: string): Promise<ComplianceRecord[]> {
    return this.findMany({ organisationId: orgId } as Partial<ComplianceRecord>)
  }

  async findByStandard(standard: string): Promise<ComplianceRecord[]> {
    return this.findMany({
      complianceStandard: standard,
    } as Partial<ComplianceRecord>)
  }

  async findByStatus(status: string): Promise<ComplianceRecord[]> {
    return this.findMany({
      complianceStatus: status,
    } as Partial<ComplianceRecord>)
  }

  /**
   * Find records with overdue audits
   */
  async findOverdueAudits(): Promise<ComplianceRecord[]> {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] ?? ''

    return this.table
      .filter((record) => {
        const dueDate = record.nextAuditDate
        if (!dueDate) return false

        const dateStr = dueDate instanceof Date ? dueDate.toISOString().split('T')[0] ?? '' : String(dueDate).split('T')[0] ?? ''
        if (!dateStr) return false

        return dateStr <= todayStr
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

    const todayStr = today.toISOString().split('T')[0] ?? ''
    const futureStr = future.toISOString().split('T')[0] ?? ''

    return this.table
      .filter((record) => {
        const dueDate = record.nextAuditDate
        if (!dueDate) return false

        const dateStr = dueDate instanceof Date ? dueDate.toISOString().split('T')[0] ?? '' : String(dueDate).split('T')[0] ?? ''
        if (!dateStr) return false

        return dateStr >= todayStr && dateStr <= futureStr
      })
      .toArray()
  }

  /**
   * Get compliance statistics
   */
  async getStats(orgId?: string): Promise<{
    total: number
    compliant: number
    partiallyCompliant: number
    nonCompliant: number
    notAssessed: number
    overdueAudits: number
    upcomingAudits: number
    complianceRate: number
    byStandard: Record<string, { total: number; compliant: number; rate: number }>
  }> {
    let records = await this.findAll()

    if (orgId) {
      records = records.filter((r) => r.organisationId === orgId)
    }

    const compliant = records.filter((r) => r.complianceStatus === 'COMPLIANT').length
    const partiallyCompliant = records.filter((r) => r.complianceStatus === 'PARTIALLY_COMPLIANT').length
    const nonCompliant = records.filter((r) => r.complianceStatus === 'NON_COMPLIANT').length
    const notAssessed = records.filter((r) => r.complianceStatus === 'NOT_ASSESSED').length
    const total = records.length

    const byStandard: Record<string, { total: number; compliant: number; rate: number }> = {}

    for (const record of records) {
      const standard = record.complianceStandard
      if (standard) {
        if (!byStandard[standard]) {
          byStandard[standard] = { total: 0, compliant: 0, rate: 0 }
        }
        byStandard[standard].total++
        if (record.complianceStatus === 'COMPLIANT') {
          byStandard[standard].compliant++
        }
      }
    }

    // Calculate rates for each standard
    for (const [, stats] of Object.entries(byStandard)) {
      stats.rate = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0
    }

    const today = formatISO(new Date()) ?? ''
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const futureStr = futureDate.toISOString().split('T')[0] ?? ''

    const overdueAudits = records.filter((r) => {
      const dueDate = r.nextAuditDate
      if (!dueDate) return false
      const dateStr = dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : String(dueDate)
      return dateStr && dateStr <= today
    }).length

    const upcomingAudits = records.filter((r) => {
      const dueDate = r.nextAuditDate
      if (!dueDate) return false
      const dateStr = dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : String(dueDate)
      return dateStr && dateStr >= today && dateStr <= futureStr
    }).length

    return {
      total,
      compliant,
      partiallyCompliant,
      nonCompliant,
      notAssessed,
      overdueAudits,
      upcomingAudits,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
      byStandard,
    }
  }

  async getStandardDistribution(): Promise<Record<string, number>> {
    const records = await this.findAll()
    const distribution: Record<string, number> = {}

    for (const record of records) {
      const standard = record.complianceStandard
      if (standard) {
        distribution[standard] = (distribution[standard] || 0) + 1
      }
    }

    return distribution
  }
}