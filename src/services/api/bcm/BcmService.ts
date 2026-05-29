import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  BCMPlanStatus,
  RecoveryPriority,
  BCMLifecyclePhase,
  type CriticalFunction,
  type BusinessImpactAssessment,
  type BusinessContinuityPlan,
  type RecoveryStrategy,
  type ExerciseTest,
  type BCMLifecycleStatus,
  type LifecycleTask,
  type BCMMetrics,
  type BCMDashboardData,
  type CreateBCPRequest,
  type CreateBIARequest,
  type CreateRecoveryStrategyRequest,
  type RecordTestResultRequest,
  type ValidateBCPRequest,
  type BCPValidationResult,
  type BIAAnalysisRequest,
  type BIAAnalysisResult,
  type BIASummary,
  type BCPProgress,
  type TestStatistics,
  type StrategyComparison,
  type MaturityAssessment,
  type LifecycleProgress,
  type CriticalFunctionQueryParams,
  type BIAQueryParams,
  type BCPQueryParams,
  type RecoveryStrategyQueryParams,
  type ExerciseTestQueryParams,
  type PaginatedResponse,
} from './../../../modules'

export class BcmService extends BaseService {
  // Critical Functions
  async getCriticalFunctions(
    params?: CriticalFunctionQueryParams
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.BASE,
      params as Record<string, any>
    )
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
    return this.getCriticalFunctions({ department_id: departmentId })
  }

  async getCriticalFunctionsByPriority(
    priority: RecoveryPriority
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.BY_PRIORITY(priority)
    )
  }

  async getFunctionsRequiringBCP(): Promise<CriticalFunction[]> {
    const response = await this.get<CriticalFunction[]>(
      API_ENDPOINTS.CRITICAL_FUNCTIONS.REQUIRES_BCP
    )
    return this.extractData(response)
  }

  // Business Impact Assessments
  async getBIAs(params?: BIAQueryParams): Promise<PaginatedResponse<BusinessImpactAssessment>> {
    return this.getPaginated<BusinessImpactAssessment>(
      API_ENDPOINTS.BIA.BASE,
      params as Record<string, any>
    )
  }

  async getBIA(id: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BY_ID(id))
    return this.extractData(response)
  }

  async createBIA(data: CreateBIARequest): Promise<BusinessImpactAssessment> {
    const response = await this.post<BusinessImpactAssessment>(API_ENDPOINTS.BIA.BASE, data)
    return this.extractData(response)
  }

  async updateBIA(id: string, data: Partial<CreateBIARequest>): Promise<BusinessImpactAssessment> {
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
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BIASummary>(API_ENDPOINTS.BIA.FINANCIAL_SUMMARY, params)
    return this.extractData(response)
  }

  // Business Continuity Plans
  async getBCPs(params?: BCPQueryParams): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(
      API_ENDPOINTS.BCP.BASE,
      params as Record<string, any>
    )
  }

  async getBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BY_ID(id))
    return this.extractData(response)
  }

  async createBCP(data: CreateBCPRequest): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCP.BASE, data)
    return this.extractData(response)
  }

  async updateBCP(id: string, data: Partial<CreateBCPRequest>): Promise<BusinessContinuityPlan> {
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

  async approveBCP(id: string, approverId?: string): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCP.APPROVE(id), {
      approved_by: approverId,
    })
    return this.extractData(response)
  }

  async archiveBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCP.ARCHIVE(id))
    return this.extractData(response)
  }

  async validateBCP(data: ValidateBCPRequest): Promise<BCPValidationResult> {
    const response = await this.post<BCPValidationResult>(API_ENDPOINTS.BCP.VALIDATE, data)
    return this.extractData(response)
  }

  async getActiveBCPs(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getBCPs({ plan_status: BCMPlanStatus.ACTIVE })
  }

  async getPlansDueForReview(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>(API_ENDPOINTS.BCP.DUE_FOR_REVIEW)
  }

  // Recovery Strategies
  async getRecoveryStrategies(
    params?: RecoveryStrategyQueryParams
  ): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getPaginated<RecoveryStrategy>(
      API_ENDPOINTS.RECOVERY_STRATEGIES.BASE,
      params as Record<string, any>
    )
  }

  async getRecoveryStrategy(id: string): Promise<RecoveryStrategy> {
    const response = await this.get<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BY_ID(id))
    return this.extractData(response)
  }

  async createRecoveryStrategy(data: CreateRecoveryStrategyRequest): Promise<RecoveryStrategy> {
    const response = await this.post<RecoveryStrategy>(API_ENDPOINTS.RECOVERY_STRATEGIES.BASE, data)
    return this.extractData(response)
  }

  async updateRecoveryStrategy(
    id: string,
    data: Partial<CreateRecoveryStrategyRequest>
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
    return this.getRecoveryStrategies({ bcp_id: bcpId })
  }

  // Exercise Tests
  async getExerciseTests(
    params?: ExerciseTestQueryParams
  ): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>(
      API_ENDPOINTS.EXERCISE_TESTS.BASE,
      params as Record<string, any>
    )
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

  async deleteExerciseTest(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.EXERCISE_TESTS.BY_ID(id))
  }

  async recordTestResult(id: string, data: RecordTestResultRequest): Promise<ExerciseTest> {
    const response = await this.post<ExerciseTest>(
      API_ENDPOINTS.EXERCISE_TESTS.RECORD_RESULT(id),
      data
    )
    return this.extractData(response)
  }

  async getExerciseTestsByBCP(bcpId: string): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getExerciseTests({ bcp_id: bcpId })
  }

  async getTestStatistics(organisationId?: string): Promise<TestStatistics> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<TestStatistics>('/bcm/exercise-tests/statistics', params)
    return this.extractData(response)
  }

  async getUpcomingTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getExerciseTests({ upcoming_only: true })
  }

  async getOverdueTests(): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getExerciseTests({ overdue_only: true })
  }

  async activateBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(API_ENDPOINTS.BCP.ACTIVATE(id))
    return this.extractData(response)
  }

  async getBCPProgress(organisationId?: string): Promise<BCPProgress[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BCPProgress[]>(API_ENDPOINTS.BCP.PROGRESS, params)
    return this.extractData(response)
  }

  async exportBCP(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<void> {
    await this.download(
      API_ENDPOINTS.BCP.EXPORT(id),
      `bcp_${id}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  async exportBIAData(organisationId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      API_ENDPOINTS.BIA.EXPORT(organisationId),
      `bia_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  async analyzeBIA(data: BIAAnalysisRequest): Promise<BIAAnalysisResult> {
    const response = await this.post<BIAAnalysisResult>(API_ENDPOINTS.BIA.ANALYZE, data)
    return this.extractData(response)
  }

  async compareRecoveryStrategies(bcpId: string): Promise<StrategyComparison[]> {
    const response = await this.get<StrategyComparison[]>(
      API_ENDPOINTS.RECOVERY_STRATEGIES.COMPARE(bcpId)
    )
    return this.extractData(response)
  }

  async getLifecycleStatus(organisationId: string): Promise<BCMLifecycleStatus> {
    const response = await this.get<BCMLifecycleStatus>(
      API_ENDPOINTS.BCM_LIFECYCLE.BASE(organisationId)
    )
    return this.extractData(response)
  }

  async updateLifecyclePhase(
    organisationId: string,
    phase: BCMLifecyclePhase,
    progress: number
  ): Promise<BCMLifecycleStatus> {
    const response = await this.patch<BCMLifecycleStatus>(
      API_ENDPOINTS.BCM_LIFECYCLE.BASE(organisationId),
      {
        phase,
        progress_percentage: progress,
      }
    )
    return this.extractData(response)
  }

  async getLifecycleProgress(organisationId: string): Promise<LifecycleProgress[]> {
    const response = await this.get<LifecycleProgress[]>(
      API_ENDPOINTS.BCM_LIFECYCLE.PROGRESS(organisationId)
    )
    return this.extractData(response)
  }

  async updateLifecycleTask(
    organisationId: string,
    taskId: string,
    status: LifecycleTask['status']
  ): Promise<BCMLifecycleStatus> {
    const response = await this.patch<BCMLifecycleStatus>(
      API_ENDPOINTS.BCM_LIFECYCLE.TASK(organisationId, taskId),
      { status }
    )
    return this.extractData(response)
  }

  async getBCMMetrics(organisationId?: string): Promise<BCMMetrics> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BCMMetrics>(API_ENDPOINTS.BCM_METRICS.BASE, params)
    return this.extractData(response)
  }

  async getBCMDashboardData(organisationId?: string): Promise<BCMDashboardData> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BCMDashboardData>(API_ENDPOINTS.BCM_METRICS.DASHBOARD, params)
    return this.extractData(response)
  }

  async getMaturityAssessment(organisationId?: string): Promise<MaturityAssessment[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<MaturityAssessment[]>(
      API_ENDPOINTS.BCM_METRICS.MATURITY_ASSESSMENT,
      params
    )
    return this.extractData(response)
  }
}

export const bcmService = new BcmService()
