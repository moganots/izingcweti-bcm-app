import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  BCMPlanStatus,
  RecoveryPriority,
  BCPTemplateCategory,
  type CriticalFunction,
  type BusinessImpactAssessment,
  type BusinessContinuityPlan,
  type RecoveryStrategy,
  type ExerciseTest,
  type BCPTemplate,
  type BCMMetrics,
  type BCMDashboardData,
  type CreateCriticalFunctionRequest,
  type UpdateCriticalFunctionRequest,
  type CreateBIARequest,
  type UpdateBIARequest,
  type CreateBCPRequest,
  type UpdateBCPRequest,
  type CreateRecoveryStrategyRequest,
  type UpdateRecoveryStrategyRequest,
  type CreateExerciseTestRequest,
  type UpdateExerciseTestRequest,
  type RecordTestResultRequest,
  type CreateBCPTemplateRequest,
  type UpdateBCPTemplateRequest,
  type ApplyTemplateRequest,
  type BIASummary,
  type TestStatistics,
  type MaturityAssessment,
  type CriticalFunctionQueryParams,
  type BIAQueryParams,
  type BCPQueryParams,
  type RecoveryStrategyQueryParams,
  type ExerciseTestQueryParams,
} from './../../../models/entities/bcm/bcm.entity'
import { PaginatedResponse } from './../../../shared/types/common.types'

/**
 * BCM Service - Aligned with Backend DTOs (camelCase)
 */
export class BcmService extends BaseService {
  // ============================================
  // Critical Functions
  // ============================================

  async getCriticalFunctions(params?: CriticalFunctionQueryParams): Promise<PaginatedResponse<CriticalFunction>> {
    const response = await this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getCriticalFunction(id: string): Promise<CriticalFunction> {
    const response = await this.get<CriticalFunction>(API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_ID(id))
    return this.extractData(response)
  }

  async createCriticalFunction(data: CreateCriticalFunctionRequest): Promise<CriticalFunction> {
    const response = await this.post<CriticalFunction>(API_ENDPOINTS.CRITICAL_FUNCTIONS.BASE, data)
    return this.extractData(response)
  }

  async updateCriticalFunction(id: string, data: UpdateCriticalFunctionRequest): Promise<CriticalFunction> {
    const response = await this.put<CriticalFunction>(API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteCriticalFunction(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_ID(id))
  }

  async getCriticalFunctionsByDepartment(departmentId: string): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getCriticalFunctions({ departmentId })
  }

  async getCriticalFunctionsByPriority(priority: RecoveryPriority): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_PRIORITY(priority)
    )
  }

  async getFunctionsRequiringBCP(): Promise<CriticalFunction[]> {
    const response = await this.get<CriticalFunction[]>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.FUNCTIONS_REQUIRING_BCP
    )
    return this.extractData(response)
  }

  async getCriticalFunctionsSummary(): Promise<any> {
    const response = await this.get<any>(API_ENDPOINTS.CRITICAL_FUNCTIONS.SUMMARY)
    return this.extractData(response)
  }

  async getRecoveryPrioritySummary(): Promise<any> {
    const response = await this.get<any>(API_ENDPOINTS.CRITICAL_FUNCTIONS.PRIORITY_SUMMARY)
    return this.extractData(response)
  }

  // ============================================
  // Business Impact Assessments
  // ============================================

  async getBIAs(params?: BIAQueryParams): Promise<PaginatedResponse<BusinessImpactAssessment>> {
    const response = await this.getPaginated<BusinessImpactAssessment>(
      API_ENDPOINTS.BIA.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getBIA(id: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BY_ID(id))
    return this.extractData(response)
  }

  async createBIA(data: CreateBIARequest): Promise<BusinessImpactAssessment> {
    const response = await this.post<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BASE, data)
    return this.extractData(response)
  }

  async updateBIA(id: string, data: UpdateBIARequest): Promise<BusinessImpactAssessment> {
    const response = await this.put<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteBIA(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BIA.BY_ID(id))
  }

  async getBIAByFunction(functionId: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(
      API_ENDPOINTS.BIA.BY_FUNCTION(functionId)
    )
    return this.extractData(response)
  }

  async getBIASummary(organisationId?: string): Promise<BIASummary> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<BIASummary>(API_ENDPOINTS.BIA.FINANCIAL_SUMMARY, params)
    return this.extractData(response)
  }

  async getHighImpactAssessments(): Promise<BusinessImpactAssessment[]> {
    const response = await this.get<BusinessImpactAssessment[]>(API_ENDPOINTS.BIA.HIGH_IMPACT)
    return this.extractData(response)
  }

  // ============================================
  // Business Continuity Plans
  // ============================================

  async getBCPs(params?: BCPQueryParams): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    const response = await this.getPaginated<BusinessContinuityPlan>(
      API_ENDPOINTS.BCP.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BY_ID(id))
    return this.extractData(response)
  }

  async createBCP(data: CreateBCPRequest): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BASE, data)
    return this.extractData(response)
  }

  async updateBCP(id: string, data: UpdateBCPRequest): Promise<BusinessContinuityPlan> {
    const response = await this.put<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteBCP(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCP.BY_ID(id))
  }

  async getBCPByFunction(functionId: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(
      API_ENDPOINTS.BCP.BY_FUNCTION(functionId)
    )
    return this.extractData(response)
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
    // Note: There's no explicit activate endpoint in the routes, using approve or update
    const response = await this.patch<BusinessContinuityPlan>(API_ENDPOINTS.BCP.APPROVE(id))
    return this.extractData(response)
  }

  async getActiveBCPs(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getBCPs({ planStatus: BCMPlanStatus.ACTIVE })
  }

  async getPlansDueForReview(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(API_ENDPOINTS.BCP.DUE_FOR_REVIEW)
  }

  async getBCPStatistics(): Promise<any> {
    const response = await this.get<any>(API_ENDPOINTS.BCP.STATISTICS)
    return this.extractData(response)
  }

  // ============================================
  // BCP Templates
  // ============================================

  async getBCPTemplates(params?: { category?: BCPTemplateCategory; tags?: string[] }): Promise<PaginatedResponse<BCPTemplate>> {
    const response = await this.getPaginated<BCPTemplate>(
      API_ENDPOINTS.BCP_TEMPLATES.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getBCPTemplate(id: string): Promise<BCPTemplate> {
    const response = await this.get<BCPTemplate>(API_ENDPOINTS.BCP_TEMPLATES.BY_ID(id))
    return this.extractData(response)
  }

  async createBCPTemplate(data: CreateBCPTemplateRequest): Promise<BCPTemplate> {
    const response = await this.post<BCPTemplate>(API_ENDPOINTS.BCP_TEMPLATES.BASE, data)
    return this.extractData(response)
  }

  async updateBCPTemplate(id: string, data: UpdateBCPTemplateRequest): Promise<BCPTemplate> {
    const response = await this.put<BCPTemplate>(API_ENDPOINTS.BCP_TEMPLATES.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteBCPTemplate(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BCP_TEMPLATES.BY_ID(id))
  }

  async getSystemTemplates(): Promise<BCPTemplate[]> {
    const response = await this.get<BCPTemplate[]>(API_ENDPOINTS.BCP_TEMPLATES.SYSTEM)
    return this.extractData(response)
  }

  async getTemplatesByCategory(category: BCPTemplateCategory): Promise<BCPTemplate[]> {
    const response = await this.get<BCPTemplate[]>(
      API_ENDPOINTS.BCP_TEMPLATES.BY_CATEGORY(category)
    )
    return this.extractData(response)
  }

  async applyTemplate(templateId: string, data: ApplyTemplateRequest): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(
      API_ENDPOINTS.BCP_TEMPLATES.APPLY(templateId),
      data
    )
    return this.extractData(response)
  }

  // ============================================
  // Recovery Strategies
  // ============================================

  async getRecoveryStrategies(params?: RecoveryStrategyQueryParams): Promise<PaginatedResponse<RecoveryStrategy>> {
    const response = await this.getPaginated<RecoveryStrategy>(
      API_ENDPOINTS.RECOVERY_STRATEGIES.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getRecoveryStrategy(id: string): Promise<RecoveryStrategy> {
    const response = await this.get<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BY_ID(id))
    return this.extractData(response)
  }

  async createRecoveryStrategy(data: CreateRecoveryStrategyRequest): Promise<RecoveryStrategy> {
    const response = await this.post<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BASE, data)
    return this.extractData(response)
  }

  async updateRecoveryStrategy(id: string, data: UpdateRecoveryStrategyRequest): Promise<RecoveryStrategy> {
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
    return this.getRecoveryStrategies({ businessContinuityPlanId: bcpId })
  }

  async getHighSuccessRateStrategies(): Promise<RecoveryStrategy[]> {
    const response = await this.get<RecoveryStrategy[]>(
      API_ENDPOINTS.RECOVERY_STRATEGIES.HIGH_SUCCESS_RATE
    )
    return this.extractData(response)
  }

  async getStrategyStatistics(): Promise<any> {
    const response = await this.get<any>(API_ENDPOINTS.RECOVERY_STRATEGIES.STATISTICS)
    return this.extractData(response)
  }

  // ============================================
  // Exercise Tests
  // ============================================

  async getExerciseTests(params?: ExerciseTestQueryParams): Promise<PaginatedResponse<ExerciseTest>> {
    const response = await this.getPaginated<ExerciseTest>(
      API_ENDPOINTS.EXERCISE_TESTS.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  async getExerciseTest(id: string): Promise<ExerciseTest> {
    const response = await this.get<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BY_ID(id))
    return this.extractData(response)
  }

  async createExerciseTest(data: CreateExerciseTestRequest): Promise<ExerciseTest> {
    const response = await this.post<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BASE, data)
    return this.extractData(response)
  }

  async updateExerciseTest(id: string, data: UpdateExerciseTestRequest): Promise<ExerciseTest> {
    const response = await this.put<ExerciseTest>(API_ENDPOINTS.EXERCISE_TESTS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteExerciseTest(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.EXERCISE_TESTS.BY_ID(id))
  }

  async recordTestResult(id: string, data: RecordTestResultRequest): Promise<ExerciseTest> {
    const response = await this.patch<ExerciseTest>(
      API_ENDPOINTS.EXERCISE_TESTS.RECORD_RESULT(id),
      data
    )
    return this.extractData(response)
  }

  async getExerciseTestsByBCP(bcpId: string): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getExerciseTests({ businessContinuityPlanId: bcpId })
  }

  async getPassedTests(): Promise<ExerciseTest[]> {
    const response = await this.get<ExerciseTest[]>(API_ENDPOINTS.EXERCISE_TESTS.PASSED)
    return this.extractData(response)
  }

  async getFailedTests(): Promise<ExerciseTest[]> {
    const response = await this.get<ExerciseTest[]>(API_ENDPOINTS.EXERCISE_TESTS.FAILED)
    return this.extractData(response)
  }

  async getUpcomingTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getExerciseTests({ upcomingOnly: true })
  }

  async getPastTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getExerciseTests({ upcomingOnly: false })
  }

  async getTestStatistics(organisationId?: string): Promise<TestStatistics> {
    const params = organisationId ? { organisationId } : undefined
    // This endpoint may not exist in the current routes - using base with stats
    const response = await this.get<TestStatistics>(API_ENDPOINTS.EXERCISE_TESTS.BASE + '/statistics', params)
    return this.extractData(response)
  }

  // ============================================
  // BCM Metrics
  // ============================================

  async getBCMMetrics(organisationId?: string): Promise<BCMMetrics> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<BCMMetrics>(API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(organisationId || ''), params)
    return this.extractData(response)
  }

  async getBCMDashboardData(organisationId?: string): Promise<BCMDashboardData> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<BCMDashboardData>(API_ENDPOINTS.DASHBOARD.COMPLETE(organisationId || ''), params)
    return this.extractData(response)
  }

  async getMaturityAssessment(organisationId?: string): Promise<MaturityAssessment[]> {
    const params = organisationId ? { organisationId } : undefined
    // This may need to be added to the dashboard or a separate endpoint
    const response = await this.get<MaturityAssessment[]>(
      API_ENDPOINTS.DASHBOARD.BCM_SUMMARY(organisationId || '') + '/maturity',
      params
    )
    return this.extractData(response)
  }
}

export const bcmService = new BcmService()