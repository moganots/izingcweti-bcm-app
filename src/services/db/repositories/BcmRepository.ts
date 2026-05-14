import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  ComplianceRecord,
} from '../../../models/entities/bcm.entity'

/**
 * Critical Function Repository
 */
export class CriticalFunctionRepository extends BaseRepository<CriticalFunction> {
  constructor(table: Table<CriticalFunction, string>) {
    super(table, 'critical_functions')
  }

  async findByDepartment(departmentId: string): Promise<CriticalFunction[]> {
    return this.findMany({ department_id: departmentId } as Partial<CriticalFunction>)
  }

  async findByName(name: string): Promise<CriticalFunction | undefined> {
    return this.findOne({ name } as Partial<CriticalFunction>)
  }

  async findWithDependencies(): Promise<CriticalFunction[]> {
    return this.table
      .filter((cf) => {
        const deps = cf.dependency_ids
        return Array.isArray(deps) && deps.length > 0
      })
      .toArray()
  }

  async findByMTO(maxTolerableOutage: string): Promise<CriticalFunction[]> {
    return this.findMany({ max_tolerable_outage: maxTolerableOutage } as Partial<CriticalFunction>)
  }
}

/**
 * BIA Repository
 */
export class BIARepository extends BaseRepository<BusinessImpactAssessment> {
  constructor(table: Table<BusinessImpactAssessment, string>) {
    super(table, 'business_impact_assessments')
  }

  async findByFunction(functionId: string): Promise<BusinessImpactAssessment | undefined> {
    return this.findOne({ function_id: functionId } as Partial<BusinessImpactAssessment>)
  }

  async findByImpactLevel(level: string): Promise<BusinessImpactAssessment[]> {
    return this.findMany({ reputational_impact: level } as Partial<BusinessImpactAssessment>)
  }

  async getHighImpactAssessments(threshold: number = 100000): Promise<BusinessImpactAssessment[]> {
    return this.table
      .filter((bia) => {
        const impact = bia.financial_impact_per_day
        return typeof impact === 'number' && impact >= threshold
      })
      .toArray()
  }

  async getAssessedFunctions(): Promise<string[]> {
    const bias = await this.findAll()
    return bias
      .map((b) => b.function_id)
      .filter((id): id is string => id !== undefined && id !== null)
  }
}

/**
 * BCP Repository
 */
export class BCPRepository extends BaseRepository<BusinessContinuityPlan> {
  constructor(table: Table<BusinessContinuityPlan, string>) {
    super(table, 'business_continuity_plans')
  }

  async findByFunction(functionId: string): Promise<BusinessContinuityPlan | undefined> {
    return this.findOne({ function_id: functionId } as Partial<BusinessContinuityPlan>)
  }

  async findByStatus(status: string): Promise<BusinessContinuityPlan[]> {
    return this.findMany({ plan_status: status } as Partial<BusinessContinuityPlan>)
  }

  async findActive(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus('Active')
  }

  /**
   * Find BCPs due for review before a given date
   * Fixed: Ensure date comparison is between string types
   */
  async findDueForReview(beforeDate: string): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        // Ensure review_due_date exists and is a string
        const dueDate: string | null | undefined = bcp.review_due_date
        if (!dueDate || typeof dueDate !== 'string') {
          return false
        }
        // Both are strings now, safe to compare
        return dueDate <= beforeDate
      })
      .toArray()
  }

  async findApproved(): Promise<BusinessContinuityPlan[]> {
    return this.findByStatus('Approved')
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
   * Find BCPs that are overdue for review
   */
  async findOverdue(): Promise<BusinessContinuityPlan[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.findDueForReview(today!)
  }

  /**
   * Find BCPs with emergency contacts configured
   */
  async findWithEmergencyContacts(): Promise<BusinessContinuityPlan[]> {
    return this.table
      .filter((bcp) => {
        const contacts = bcp.emergency_contact_list
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
        const docUrl = bcp.plan_document_url
        return typeof docUrl === 'string' && docUrl.length > 0
      })
      .toArray()
  }
}

/**
 * Recovery Strategy Repository
 */
export class RecoveryStrategyRepository extends BaseRepository<RecoveryStrategy> {
  constructor(table: Table<RecoveryStrategy, string>) {
    super(table, 'recovery_strategies')
  }

  async findByBCP(bcpId: string): Promise<RecoveryStrategy[]> {
    return this.findMany({
      business_continuity_plan_id: bcpId,
    } as Partial<RecoveryStrategy>)
  }

  async findByType(type: string): Promise<RecoveryStrategy[]> {
    return this.findMany({
      recovery_strategy_type: type,
    } as Partial<RecoveryStrategy>)
  }

  async getHighSuccessRate(minRate: number = 80): Promise<RecoveryStrategy[]> {
    return this.table
      .filter((rs) => {
        const rate = rs.test_success_rate
        return typeof rate === 'number' && rate >= minRate
      })
      .toArray()
  }

  async getLowSuccessRate(maxRate: number = 50): Promise<RecoveryStrategy[]> {
    return this.table
      .filter((rs) => {
        const rate = rs.test_success_rate
        return typeof rate === 'number' && rate <= maxRate
      })
      .toArray()
  }

  async getTotalCost(bcpId: string): Promise<number> {
    const strategies = await this.findByBCP(bcpId)
    return strategies.reduce((sum, s) => {
      const cost = s.estimated_recovery_cost
      return sum + (typeof cost === 'number' ? cost : 0)
    }, 0)
  }

  async getAverageSuccessRate(bcpId: string): Promise<number> {
    const strategies = await this.findByBCP(bcpId)
    if (strategies.length === 0) return 0

    const total = strategies.reduce((sum, s) => {
      const rate = s.test_success_rate
      return sum + (typeof rate === 'number' ? rate : 0)
    }, 0)

    return Math.round((total / strategies.length) * 100) / 100
  }
}

/**
 * Exercise Test Repository
 */
export class ExerciseTestRepository extends BaseRepository<ExerciseTest> {
  constructor(table: Table<ExerciseTest, string>) {
    super(table, 'exercise_tests')
  }

  async findByBCP(bcpId: string): Promise<ExerciseTest[]> {
    return this.findMany({
      business_continuity_plan_id: bcpId,
    } as Partial<ExerciseTest>)
  }

  async findByType(type: string): Promise<ExerciseTest[]> {
    return this.findMany({
      exercise_test_type: type,
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
   * Find upcoming tests (date is today or in the future, not yet passed)
   * Fixed: Ensure proper date comparison with string types
   */
  async findUpcoming(): Promise<ExerciseTest[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.table
      .filter((test) => {
        const testDate = test.date
        // Ensure testDate is a string before comparison
        if (typeof testDate !== 'string') {
          return false
        }
        // Only upcoming if date is today or future AND not passed
        return testDate >= today! && test.passed !== true
      })
      .toArray()
  }

  /**
   * Find overdue tests (date is in the past, not yet passed)
   * Fixed: Ensure proper date comparison with string types
   */
  async findOverdue(): Promise<ExerciseTest[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.table
      .filter((test) => {
        const testDate = test.date
        // Ensure testDate is a string before comparison
        if (typeof testDate !== 'string') {
          return false
        }
        // Overdue if date is in the past AND not passed
        return testDate < today! && test.passed !== true
      })
      .toArray()
  }

  /**
   * Find tests within a date range
   * Fixed: Ensure proper date comparison with string types
   */
  async findByDateRange(startDate: string, endDate: string): Promise<ExerciseTest[]> {
    return this.table
      .filter((test) => {
        const testDate = test.date
        // Ensure testDate is a string before comparison
        if (typeof testDate !== 'string') {
          return false
        }
        return testDate >= startDate && testDate <= endDate
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
  }> {
    let tests = await this.findAll()

    if (bcpId) {
      tests = tests.filter((t) => t.business_continuity_plan_id === bcpId)
    }

    const passed = tests.filter((t) => t.passed === true).length
    const failed = tests.filter((t) => t.passed === false).length
    const total = tests.length

    return {
      total,
      passed,
      failed,
      upcoming: tests.filter((t) => {
        const testDate = t.date
        return (
          typeof testDate === 'string' &&
          testDate >= new Date().toISOString().split('T')[0]! &&
          t.passed !== true
        )
      }).length,
      overdue: tests.filter((t) => {
        const testDate = t.date
        return (
          typeof testDate === 'string' &&
          testDate < new Date().toISOString().split('T')[0]! &&
          t.passed !== true
        )
      }).length,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    }
  }
}

/**
 * Compliance Record Repository
 */
export class ComplianceRecordRepository extends BaseRepository<ComplianceRecord> {
  constructor(table: Table<ComplianceRecord, string>) {
    super(table, 'compliance_records')
  }

  async findByOrganisation(orgId: string): Promise<ComplianceRecord[]> {
    return this.findMany({ organisation_id: orgId } as Partial<ComplianceRecord>)
  }

  async findByStandard(standard: string): Promise<ComplianceRecord[]> {
    return this.findMany({
      compliance_standard: standard,
    } as Partial<ComplianceRecord>)
  }

  async findByStatus(status: string): Promise<ComplianceRecord[]> {
    return this.findMany({
      compliance_status: status,
    } as Partial<ComplianceRecord>)
  }

  /**
   * Find records with overdue audits
   * Fixed: Ensure proper date comparison with string types
   */
  async findOverdueAudits(): Promise<ComplianceRecord[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.table
      .filter((record) => {
        const dueDate = record.next_audit_due
        if (typeof dueDate !== 'string') {
          return false
        }
        return dueDate <= today!
      })
      .toArray()
  }

  /**
   * Find records with upcoming audits within specified days
   * Fixed: Ensure proper date comparison with string types
   */
  async findUpcomingAudits(days: number = 30): Promise<ComplianceRecord[]> {
    const today = new Date()
    const future = new Date(today)
    future.setDate(future.getDate() + days)

    const todayStr = today.toISOString().split('T')[0]
    const futureStr = future.toISOString().split('T')[0]

    return this.table
      .filter((record) => {
        const dueDate = record.next_audit_due
        if (typeof dueDate !== 'string') {
          return false
        }
        return dueDate >= todayStr! && dueDate <= futureStr!
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
    overdueAudits: number
    upcomingAudits: number
    complianceRate: number
  }> {
    let records = await this.findAll()

    if (orgId) {
      records = records.filter((r) => r.organisation_id === orgId)
    }

    const compliant = records.filter((r) => r.compliance_status === 'Compliant').length
    const partiallyCompliant = records.filter((r) => r.compliance_status === 'Partially').length
    const nonCompliant = records.filter((r) => r.compliance_status === 'NonCompliant').length
    const total = records.length

    return {
      total,
      compliant,
      partiallyCompliant,
      nonCompliant,
      overdueAudits: records.filter((r) => {
        const dueDate = r.next_audit_due
        return typeof dueDate === 'string' && dueDate <= new Date().toISOString().split('T')[0]!
      }).length,
      upcomingAudits: records.filter((r) => {
        const dueDate = r.next_audit_due
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        return (
          typeof dueDate === 'string' &&
          dueDate >= new Date().toISOString().split('T')[0]! &&
          dueDate <= futureDate.toISOString().split('T')[0]!
        )
      }).length,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
    }
  }
}
