import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from '../../../utils/constants'
import {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  ComplianceRecord,
} from './../../../models/entities'
import type { PaginatedResponse, QueryParams } from './../../../types'

/**
 * BCM API Service
 * Handles all Business Continuity Management operations
 */
export class BcmService extends BaseService {
  // ============================================
  // Critical Functions
  // ============================================

  async getCriticalFunctions(params?: QueryParams): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BASE, params)
  }

  async getCriticalFunction(id: string): Promise<CriticalFunction> {
    const response = await this.get<CriticalFunction>(
      API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BY_ID(id)
    )
    return this.extractData(response)
  }

  async createCriticalFunction(data: Partial<CriticalFunction>): Promise<CriticalFunction> {
    const response = await this.post<CriticalFunction>(
      API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BASE,
      data
    )
    return this.extractData(response)
  }

  async updateCriticalFunction(
    id: string,
    data: Partial<CriticalFunction>
  ): Promise<CriticalFunction> {
    const response = await this.put<CriticalFunction>(
      API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteCriticalFunction(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BY_ID(id))
  }

  async getCriticalFunctionsByDepartment(
    departmentId: string
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BY_DEPARTMENT(departmentId)
    )
  }

  async getCriticalFunctionsByOrganisation(
    organisationId: string
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.BCM.CRITICAL_FUNCTIONS.BY_ORGANISATION(organisationId)
    )
  }

  // ============================================
  // Business Impact Assessments
  // ============================================

  async getBIAs(params?: QueryParams): Promise<PaginatedResponse<BusinessImpactAssessment>> {
    return this.getPaginated<BusinessImpactAssessment>(API_ENDPOINTS.BCM.BIA.BASE, params)
  }

  async getBIA(id: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(API_ENDPOINTS.BCM.BIA.BY_ID(id))
    return this.extractData(response)
  }

  async createBIA(data: Partial<BusinessImpactAssessment>): Promise<BusinessImpactAssessment> {
    const response = await this.post<BusinessImpactAssessment>(API_ENDPOINTS.BCM.BIA.BASE, data)
    return this.extractData(response)
  }

  async updateBIA(
    id: string,
    data: Partial<BusinessImpactAssessment>
  ): Promise<BusinessImpactAssessment> {
    const response = await this.put<BusinessImpactAssessment>(API_ENDPOINTS.BCM.BIA.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteBIA(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCM.BIA.BY_ID(id))
  }

  async getBIAByFunction(functionId: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(
      API_ENDPOINTS.BCM.BIA.BY_FUNCTION(functionId)
    )
    return this.extractData(response)
  }

  async getBIAByOrganisation(
    organisationId: string
  ): Promise<PaginatedResponse<BusinessImpactAssessment>> {
    return this.getPaginated<BusinessImpactAssessment>(
      API_ENDPOINTS.BCM.BIA.BY_ORGANISATION(organisationId)
    )
  }

  // Fixed: Use proper endpoint for BIA stats
  async getBIAStats(): Promise<any> {
    const response = await this.get(`${API_ENDPOINTS.BCM.BIA.BASE}/stats`)
    return this.extractData(response)
  }

  // ============================================
  // Business Continuity Plans
  // ============================================

  async getBCPs(params?: QueryParams): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(API_ENDPOINTS.BCM.BCP.BASE, params)
  }

  async getBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(API_ENDPOINTS.BCM.BCP.BY_ID(id))
    return this.extractData(response)
  }

  async createBCP(data: Partial<BusinessContinuityPlan>): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCM.BCP.BASE, data)
    return this.extractData(response)
  }

  async updateBCP(
    id: string,
    data: Partial<BusinessContinuityPlan>
  ): Promise<BusinessContinuityPlan> {
    const response = await this.put<BusinessContinuityPlan>(API_ENDPOINTS.BCM.BCP.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteBCP(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCM.BCP.BY_ID(id))
  }

  async getBCPByFunction(functionId: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(
      API_ENDPOINTS.BCM.BCP.BY_FUNCTION(functionId)
    )
    return this.extractData(response)
  }

  async getBCPByOrganisation(
    organisationId: string
  ): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(
      API_ENDPOINTS.BCM.BCP.BY_ORGANISATION(organisationId)
    )
  }

  // Fixed: Use proper endpoint for active BCPs
  async getActiveBCPs(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(`${API_ENDPOINTS.BCM.BCP.BASE}?status=ACTIVE`)
  }

  async approveBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.patch<BusinessContinuityPlan>(API_ENDPOINTS.BCM.BCP.APPROVE(id))
    return this.extractData(response)
  }

  // Fixed: Use proper endpoint for archive
  async archiveBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.patch<BusinessContinuityPlan>(
      `${API_ENDPOINTS.BCM.BCP.BY_ID(id)}/archive`
    )
    return this.extractData(response)
  }

  async activateBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.patch<BusinessContinuityPlan>(
      `${API_ENDPOINTS.BCM.BCP.BY_ID(id)}/activate`
    )
    return this.extractData(response)
  }

  async reviewBCP(id: string, data?: { comments?: string }): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(
      API_ENDPOINTS.BCM.BCP.REVIEW(id),
      data || {}
    )
    return this.extractData(response)
  }

  async exportBCP(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<void> {
    await this.download(
      API_ENDPOINTS.BCM.BCP.EXPORT(id),
      `bcp_${id}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  // ============================================
  // Recovery Strategies
  // ============================================

  async getRecoveryStrategies(params?: QueryParams): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getPaginated<RecoveryStrategy>(API_ENDPOINTS.BCM.RECOVERY_STRATEGIES.BASE, params)
  }

  async getRecoveryStrategy(id: string): Promise<RecoveryStrategy> {
    const response = await this.get<RecoveryStrategy>(
      API_ENDPOINTS.BCM.RECOVERY_STRATEGIES.BY_ID(id)
    )
    return this.extractData(response)
  }

  async createRecoveryStrategy(data: Partial<RecoveryStrategy>): Promise<RecoveryStrategy> {
    const response = await this.post<RecoveryStrategy>(
      API_ENDPOINTS.BCM.RECOVERY_STRATEGIES.BASE,
      data
    )
    return this.extractData(response)
  }

  async updateRecoveryStrategy(
    id: string,
    data: Partial<RecoveryStrategy>
  ): Promise<RecoveryStrategy> {
    const response = await this.put<RecoveryStrategy>(
      API_ENDPOINTS.BCM.RECOVERY_STRATEGIES.BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteRecoveryStrategy(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCM.RECOVERY_STRATEGIES.BY_ID(id))
  }

  async getRecoveryStrategiesByBCP(bcpId: string): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getPaginated<RecoveryStrategy>(API_ENDPOINTS.BCM.RECOVERY_STRATEGIES.BY_BCP(bcpId))
  }

  // ============================================
  // Exercise Tests
  // ============================================

  async getExerciseTests(params?: QueryParams): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.BCM.EXERCISE_TESTS.BASE, params)
  }

  async getExerciseTest(id: string): Promise<ExerciseTest> {
    const response = await this.get<ExerciseTest>(API_ENDPOINTS.BCM.EXERCISE_TESTS.BY_ID(id))
    return this.extractData(response)
  }

  async createExerciseTest(data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const response = await this.post<ExerciseTest>(API_ENDPOINTS.BCM.EXERCISE_TESTS.BASE, data)
    return this.extractData(response)
  }

  async updateExerciseTest(id: string, data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const response = await this.put<ExerciseTest>(API_ENDPOINTS.BCM.EXERCISE_TESTS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteExerciseTest(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCM.EXERCISE_TESTS.BY_ID(id))
  }

  // Fixed: Use proper endpoint for recording test results
  async recordTestResult(
    id: string,
    data: {
      passed: boolean
      lessons_learned: string
      corrective_actions: string
    }
  ): Promise<ExerciseTest> {
    const response = await this.patch<ExerciseTest>(
      API_ENDPOINTS.BCM.EXERCISE_TESTS.COMPLETE(id),
      data
    )
    return this.extractData(response)
  }

  // Fixed: Use proper endpoints for test queries
  async getUpcomingTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(
      `${API_ENDPOINTS.BCM.EXERCISE_TESTS.BASE}?status=UPCOMING`
    )
  }

  async getOverdueTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(
      `${API_ENDPOINTS.BCM.EXERCISE_TESTS.BASE}?status=OVERDUE`
    )
  }

  async getCompletedTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(
      `${API_ENDPOINTS.BCM.EXERCISE_TESTS.BASE}?status=COMPLETED`
    )
  }

  async getExerciseTestsByBCP(bcpId: string): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(API_ENDPOINTS.BCM.EXERCISE_TESTS.BY_BCP(bcpId))
  }

  async scheduleTest(id: string, scheduledDate: string): Promise<ExerciseTest> {
    const response = await this.patch<ExerciseTest>(API_ENDPOINTS.BCM.EXERCISE_TESTS.SCHEDULE(id), {
      date: scheduledDate,
    })
    return this.extractData(response)
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

  async deleteComplianceRecord(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.COMPLIANCE.BY_ID(id))
  }

  async getComplianceByOrganisation(
    organisationId: string
  ): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.BY_ORGANISATION(organisationId)
    )
  }

  // Fixed: Use proper endpoint for overdue audits
  async getOverdueAudits(): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(`${API_ENDPOINTS.COMPLIANCE.BASE}?status=OVERDUE`)
  }

  // Fixed: Use proper endpoint for upcoming audits
  async getUpcomingAudits(days?: number): Promise<PaginatedResponse<ComplianceRecord>> {
    const params: Record<string, unknown> = {}
    if (days !== undefined && days !== null) {
      params.days = days
    }
    return this.getPaginated<ComplianceRecord>(
      `${API_ENDPOINTS.COMPLIANCE.BASE}?status=UPCOMING`,
      params
    )
  }

  async getComplianceByStandard(standard: string): Promise<PaginatedResponse<ComplianceRecord>> {
    return this.getPaginated<ComplianceRecord>(API_ENDPOINTS.COMPLIANCE.BY_STANDARD(standard))
  }

  async updateComplianceStatus(id: string, status: string): Promise<ComplianceRecord> {
    const response = await this.patch<ComplianceRecord>(
      API_ENDPOINTS.COMPLIANCE.UPDATE_STATUS(id),
      {
        compliance_status: status,
      }
    )
    return this.extractData(response)
  }

  async getComplianceStats(organisationId: string): Promise<any> {
    const response = await this.get(API_ENDPOINTS.COMPLIANCE.STATS(organisationId))
    return this.extractData(response)
  }

  async getComplianceGaps(organisationId: string): Promise<any[]> {
    const response = await this.get(API_ENDPOINTS.COMPLIANCE.GAPS(organisationId))
    return this.extractData(response)
  }

  // ============================================
  // Departments
  // ============================================

  async getDepartments(params?: QueryParams): Promise<PaginatedResponse<any>> {
    return this.getPaginated(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE, params)
  }

  async getDepartment(id: string): Promise<any> {
    const response = await this.get(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BY_ID(id))
    return this.extractData(response)
  }

  async getDepartmentsByBusinessUnit(businessUnitId: string): Promise<PaginatedResponse<any>> {
    return this.getPaginated(
      `${API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE}?business_id=${businessUnitId}`
    )
  }
}

// Export singleton
export const bcmService = new BcmService()
