import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse, QueryParams } from '../../types/common.types'
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  ComplianceRecord,
} from '../../models/entities/bcm.entity'

/**
 * BCM API Service
 * Handles all Business Continuity Management operations
 */
export class BcmService extends BaseService {
  // ============================================
  // Critical Functions
  // ============================================

  async getCriticalFunctions(params?: QueryParams): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(API_ENDPOINTS.CRITICAL_FUNCTIONS.BASE, params)
  }

  async getCriticalFunction(id: string): Promise<CriticalFunction> {
    const response = await this.get<CriticalFunction>(API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_ID(id))
    return this.extractData(response)
  }

  async createCriticalFunction(data: Partial<CriticalFunction>): Promise<CriticalFunction> {
    const response = await this.post<CriticalFunction>(API_ENDPOINTS.CRITICAL_FUNCTIONS.BASE, data)
    return this.extractData(response)
  }

  async updateCriticalFunction(
    id: string,
    data: Partial<CriticalFunction>
  ): Promise<CriticalFunction> {
    const response = await this.put<CriticalFunction>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteCriticalFunction(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_ID(id))
  }

  async getCriticalFunctionsByDepartment(
    departmentId: string
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_DEPARTMENT(departmentId)
    )
  }

  // ============================================
  // Business Impact Assessments
  // ============================================

  async getBIAs(params?: QueryParams): Promise<PaginatedResponse<BusinessImpactAssessment>> {
    return this.getPaginated<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BASE, params)
  }

  async getBIA(id: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BY_ID(id))
    return this.extractData(response)
  }

  async createBIA(data: Partial<BusinessImpactAssessment>): Promise<BusinessImpactAssessment> {
    const response = await this.post<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BASE, data)
    return this.extractData(response)
  }

  async updateBIA(
    id: string,
    data: Partial<BusinessImpactAssessment>
  ): Promise<BusinessImpactAssessment> {
    const response = await this.put<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BY_ID(id), data)
    return this.extractData(response)
  }

  async getBIAByFunction(functionId: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(
      API_ENDPOINTS.BIA.BY_FUNCTION(functionId)
    )
    return this.extractData(response)
  }

  async getBIAStats(): Promise<any> {
    const response = await this.get(API_ENDPOINTS.BIA.STATS)
    return this.extractData(response)
  }

  // ============================================
  // Business Continuity Plans
  // ============================================

  async getBCPs(params?: QueryParams): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BASE, params)
  }

  async getBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BY_ID(id))
    return this.extractData(response)
  }

  async createBCP(data: Partial<BusinessContinuityPlan>): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BASE, data)
    return this.extractData(response)
  }

  async updateBCP(
    id: string,
    data: Partial<BusinessContinuityPlan>
  ): Promise<BusinessContinuityPlan> {
    const response = await this.put<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BY_ID(id), data)
    return this.extractData(response)
  }

  async getBCPByFunction(functionId: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(
      API_ENDPOINTS.BCP.BY_FUNCTION(functionId)
    )
    return this.extractData(response)
  }

  async getActiveBCPs(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(API_ENDPOINTS.BCP.ACTIVE)
  }

  async approveBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.patch<BusinessContinuityPlan>(API_ENDPOINTS.BCP.APPROVE(id))
    return this.extractData(response)
  }

  async archiveBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.patch<BusinessContinuityPlan>(API_ENDPOINTS.BCP.ARCHIVE(id))
    return this.extractData(response)
  }

  async activateBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.patch<BusinessContinuityPlan>(
      `/business-continuity-plans/${id}/activate`
    )
    return this.extractData(response)
  }

  // ============================================
  // Recovery Strategies
  // ============================================

  async getRecoveryStrategies(params?: QueryParams): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getPaginated<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BASE, params)
  }

  async getRecoveryStrategy(id: string): Promise<RecoveryStrategy> {
    const response = await this.get<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BY_ID(id))
    return this.extractData(response)
  }

  async createRecoveryStrategy(data: Partial<RecoveryStrategy>): Promise<RecoveryStrategy> {
    const response = await this.post<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BASE, data)
    return this.extractData(response)
  }

  async updateRecoveryStrategy(
    id: string,
    data: Partial<RecoveryStrategy>
  ): Promise<RecoveryStrategy> {
    const response = await this.put<RecoveryStrategy>(
      API_ENDPOINTS.RECOVERY_STRATEGIES.BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteRecoveryStrategy(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RECOVERY_STRATEGIES.BY_ID(id))
  }

  async getRecoveryStrategiesByBCP(bcpId: string): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getPaginated<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BY_BCP(bcpId))
  }

  // ============================================
  // Exercise Tests
  // ============================================

  async getExerciseTests(params?: QueryParams): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BASE, params)
  }

  async getExerciseTest(id: string): Promise<ExerciseTest> {
    const response = await this.get<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BY_ID(id))
    return this.extractData(response)
  }

  async createExerciseTest(data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const response = await this.post<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BASE, data)
    return this.extractData(response)
  }

  async updateExerciseTest(id: string, data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const response = await this.put<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BY_ID(id), data)
    return this.extractData(response)
  }

  async recordTestResult(
    id: string,
    data: {
      passed: boolean
      lessons_learned: string
      corrective_actions: string
    }
  ): Promise<ExerciseTest> {
    const response = await this.patch<ExerciseTest>(
      API_ENDPOINTS.EXERCISE_TESTS.RECORD_RESULT(id),
      data
    )
    return this.extractData(response)
  }

  async getUpcomingTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.UPCOMING)
  }

  async getOverdueTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.OVERDUE)
  }

  async getCompletedTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.COMPLETED)
  }

  async getExerciseTestsByBCP(bcpId: string): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BY_BCP(bcpId))
  }

  // ============================================
  // Compliance Records
  // ============================================

  async getComplianceRecords(params?: QueryParams): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, params)
  }

  async getComplianceRecord(id: string): Promise<ComplianceRecord> {
    const response = await this.get<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
    return this.extractData(response)
  }

  async createComplianceRecord(data: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    const response = await this.post<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BASE, data)
    return this.extractData(response)
  }

  async updateComplianceRecord(
    id: string,
    data: Partial<ComplianceRecord>
  ): Promise<ComplianceRecord> {
    const response = await this.put<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_ID(id), data)
    return this.extractData(response)
  }

  async getOverdueAudits(): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.OVERDUE)
  }

  async getUpcomingAudits(days?: number): Promise<PaginatedResponse<ComplianceRecord>> {
    const params: Record<string, unknown> = {}
    if (days !== undefined && days !== null) {
      params.days = days
    }
    return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.UPCOMING, params)
  }

  async getComplianceByStandard(standard: string): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_STANDARD(standard))
  }

  // ============================================
  // Departments
  // ============================================

  async getDepartments(params?: QueryParams): Promise<PaginatedResponse<any>> {
    return this.getPaginated(API_ENDPOINTS.DEPARTMENTS.BASE, params)
  }

  async getDepartment(id: string): Promise<any> {
    const response = await this.get(API_ENDPOINTS.DEPARTMENTS.BY_ID(id))
    return this.extractData(response)
  }
}

// Export singleton
export const bcmService = new BcmService()
