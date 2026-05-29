import { BaseService } from '../../BaseService'
import {
  // Enums
  BCMPlanStatus,
  RecoveryPriority,
  BCMLifecyclePhase,
  // Types
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
  // Shared Types
  type PaginatedResponse,
} from './../../../modules'

export class BcmService extends BaseService {
  // Critical Functions
  async getCriticalFunctions(
    params?: CriticalFunctionQueryParams
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(
      '/bcm/critical-functions',
      params as Record<string, any>
    )
  }

  async getCriticalFunction(id: string): Promise<CriticalFunction> {
    const response = await this.get<CriticalFunction>(`/bcm/critical-functions/${id}`)
    return this.extractData(response)
  }

  async createCriticalFunction(data: Partial<CriticalFunction>): Promise<CriticalFunction> {
    const response = await this.post<CriticalFunction>('/bcm/critical-functions', data)
    return this.extractData(response)
  }

  async updateCriticalFunction(
    id: string,
    data: Partial<CriticalFunction>
  ): Promise<CriticalFunction> {
    const response = await this.put<CriticalFunction>(`/bcm/critical-functions/${id}`, data)
    return this.extractData(response)
  }

  async deleteCriticalFunction(id: string): Promise<void> {
    await this.delete(`/bcm/critical-functions/${id}`)
  }

  async getCriticalFunctionsByDepartment(
    departmentId: string
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getCriticalFunctions({ department_id: departmentId })
  }

  async getCriticalFunctionsByPriority(
    priority: RecoveryPriority
  ): Promise<PaginatedResponse<CriticalFunction>> {
    return this.getPaginated<CriticalFunction>(`/bcm/critical-functions/priority/${priority}`)
  }

  async getFunctionsRequiringBCP(): Promise<CriticalFunction[]> {
    const response = await this.get<CriticalFunction[]>('/bcm/critical-functions/requires-bcp')
    return this.extractData(response)
  }

  // Business Impact Assessments
  async getBIAs(params?: BIAQueryParams): Promise<PaginatedResponse<BusinessImpactAssessment>> {
    return this.getPaginated<BusinessImpactAssessment>(
      '/bcm/impact-assessments',
      params as Record<string, any>
    )
  }

  async getBIA(id: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(`/bcm/impact-assessments/${id}`)
    return this.extractData(response)
  }

  async createBIA(data: CreateBIARequest): Promise<BusinessImpactAssessment> {
    const response = await this.post<BusinessImpactAssessment>('/bcm/impact-assessments', data)
    return this.extractData(response)
  }

  async updateBIA(id: string, data: Partial<CreateBIARequest>): Promise<BusinessImpactAssessment> {
    const response = await this.put<BusinessImpactAssessment>(`/bcm/impact-assessments/${id}`, data)
    return this.extractData(response)
  }

  async deleteBIA(id: string): Promise<void> {
    await this.delete(`/bcm/impact-assessments/${id}`)
  }

  async getBIAByFunction(functionId: string): Promise<BusinessImpactAssessment> {
    const response = await this.get<BusinessImpactAssessment>(
      `/bcm/impact-assessments/function/${functionId}`
    )
    return this.extractData(response)
  }

  async getBIASummary(organisationId?: string): Promise<BIASummary> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BIASummary>('/bcm/impact-assessments/summary', params)
    return this.extractData(response)
  }

  async analyzeBIA(data: BIAAnalysisRequest): Promise<BIAAnalysisResult> {
    const response = await this.post<BIAAnalysisResult>('/bcm/impact-assessments/analyze', data)
    return this.extractData(response)
  }

  // Business Continuity Plans
  async getBCPs(params?: BCPQueryParams): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>('/bcm/plans', params as Record<string, any>)
  }

  async getBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(`/bcm/plans/${id}`)
    return this.extractData(response)
  }

  async createBCP(data: CreateBCPRequest): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>('/bcm/plans', data)
    return this.extractData(response)
  }

  async updateBCP(id: string, data: Partial<CreateBCPRequest>): Promise<BusinessContinuityPlan> {
    const response = await this.put<BusinessContinuityPlan>(`/bcm/plans/${id}`, data)
    return this.extractData(response)
  }

  async deleteBCP(id: string): Promise<void> {
    await this.delete(`/bcm/plans/${id}`)
  }

  async getBCPByFunction(functionId: string): Promise<BusinessContinuityPlan> {
    const response = await this.get<BusinessContinuityPlan>(`/bcm/plans/function/${functionId}`)
    return this.extractData(response)
  }

  async approveBCP(id: string, approverId?: string): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(`/bcm/plans/${id}/approve`, {
      approved_by: approverId,
    })
    return this.extractData(response)
  }

  async archiveBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(`/bcm/plans/${id}/archive`)
    return this.extractData(response)
  }

  async activateBCP(id: string): Promise<BusinessContinuityPlan> {
    const response = await this.post<BusinessContinuityPlan>(`/bcm/plans/${id}/activate`)
    return this.extractData(response)
  }

  async validateBCP(data: ValidateBCPRequest): Promise<BCPValidationResult> {
    const response = await this.post<BCPValidationResult>('/bcm/plans/validate', data)
    return this.extractData(response)
  }

  async getBCPProgress(organisationId?: string): Promise<BCPProgress[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BCPProgress[]>('/bcm/plans/progress', params)
    return this.extractData(response)
  }

  async getActiveBCPs(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getBCPs({ plan_status: BCMPlanStatus.ACTIVE })
  }

  async getPlansDueForReview(): Promise<PaginatedResponse<BusinessContinuityPlan>> {
    return this.getPaginated<BusinessContinuityPlan>('/bcm/plans/due-for-review')
  }

  // Recovery Strategies
  async getRecoveryStrategies(
    params?: RecoveryStrategyQueryParams
  ): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getPaginated<RecoveryStrategy>(
      '/bcm/recovery-strategies',
      params as Record<string, any>
    )
  }

  async getRecoveryStrategy(id: string): Promise<RecoveryStrategy> {
    const response = await this.get<RecoveryStrategy>(`/bcm/recovery-strategies/${id}`)
    return this.extractData(response)
  }

  async createRecoveryStrategy(data: CreateRecoveryStrategyRequest): Promise<RecoveryStrategy> {
    const response = await this.post<RecoveryStrategy>('/bcm/recovery-strategies', data)
    return this.extractData(response)
  }

  async updateRecoveryStrategy(
    id: string,
    data: Partial<CreateRecoveryStrategyRequest>
  ): Promise<RecoveryStrategy> {
    const response = await this.put<RecoveryStrategy>(`/bcm/recovery-strategies/${id}`, data)
    return this.extractData(response)
  }

  async deleteRecoveryStrategy(id: string): Promise<void> {
    await this.delete(`/bcm/recovery-strategies/${id}`)
  }

  async getRecoveryStrategiesByBCP(bcpId: string): Promise<PaginatedResponse<RecoveryStrategy>> {
    return this.getRecoveryStrategies({ bcp_id: bcpId })
  }

  async compareRecoveryStrategies(bcpId: string): Promise<StrategyComparison[]> {
    const response = await this.get<StrategyComparison[]>(
      `/bcm/recovery-strategies/${bcpId}/compare`
    )
    return this.extractData(response)
  }

  // Exercise Tests
  async getExerciseTests(
    params?: ExerciseTestQueryParams
  ): Promise<PaginatedResponse<ExerciseTest>> {
    return this.getPaginated<ExerciseTest>('/bcm/exercise-tests', params as Record<string, any>)
  }

  async getExerciseTest(id: string): Promise<ExerciseTest> {
    const response = await this.get<ExerciseTest>(`/bcm/exercise-tests/${id}`)
    return this.extractData(response)
  }

  async createExerciseTest(data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const response = await this.post<ExerciseTest>('/bcm/exercise-tests', data)
    return this.extractData(response)
  }

  async updateExerciseTest(id: string, data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const response = await this.put<ExerciseTest>(`/bcm/exercise-tests/${id}`, data)
    return this.extractData(response)
  }

  async deleteExerciseTest(id: string): Promise<void> {
    await this.delete(`/bcm/exercise-tests/${id}`)
  }

  async recordTestResult(id: string, data: RecordTestResultRequest): Promise<ExerciseTest> {
    const response = await this.post<ExerciseTest>(`/bcm/exercise-tests/${id}/record-result`, data)
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

  // BCM Lifecycle
  async getLifecycleStatus(organisationId: string): Promise<BCMLifecycleStatus> {
    const response = await this.get<BCMLifecycleStatus>(`/bcm/lifecycle/${organisationId}`)
    return this.extractData(response)
  }

  async updateLifecyclePhase(
    organisationId: string,
    phase: BCMLifecyclePhase,
    progress: number
  ): Promise<BCMLifecycleStatus> {
    const response = await this.patch<BCMLifecycleStatus>(`/bcm/lifecycle/${organisationId}`, {
      phase,
      progress_percentage: progress,
    })
    return this.extractData(response)
  }

  async getLifecycleProgress(organisationId: string): Promise<LifecycleProgress[]> {
    const response = await this.get<LifecycleProgress[]>(
      `/bcm/lifecycle/${organisationId}/progress`
    )
    return this.extractData(response)
  }

  async updateLifecycleTask(
    organisationId: string,
    taskId: string,
    status: LifecycleTask['status']
  ): Promise<BCMLifecycleStatus> {
    const response = await this.patch<BCMLifecycleStatus>(
      `/bcm/lifecycle/${organisationId}/tasks/${taskId}`,
      { status }
    )
    return this.extractData(response)
  }

  // Dashboard & Metrics
  async getBCMMetrics(organisationId?: string): Promise<BCMMetrics> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BCMMetrics>('/bcm/metrics', params)
    return this.extractData(response)
  }

  async getBCMDashboardData(organisationId?: string): Promise<BCMDashboardData> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<BCMDashboardData>('/bcm/dashboard', params)
    return this.extractData(response)
  }

  // Maturity Assessment
  async getMaturityAssessment(organisationId?: string): Promise<MaturityAssessment[]> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<MaturityAssessment[]>('/bcm/maturity-assessment', params)
    return this.extractData(response)
  }

  // Export Operations
  async exportBCP(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<void> {
    await this.download(
      `/bcm/plans/${id}/export`,
      `bcp_${id}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  async exportBIAData(organisationId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      `/bcm/impact-assessments/export/${organisationId}`,
      `bia_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }
}

export const bcmService = new BcmService()
