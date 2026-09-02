import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from './../../../core/constants/api.constants'
import type {
  Rule,
  RuleExecutionLog,
  CreateRuleDto,
  UpdateRuleDto,
  RuleQueryDto,
  RuleTestDto,
  RuleTestResultDto,
  RuleStatsDto,
  RuleExecutionStatsDto,
  RuleExecutionSummaryDto,
  ExecutionLogQueryDto,
} from './../../../models/entities/rules/rule.entity'
import type { PaginatedResponse } from './../../../shared/types/common.types'

export class RuleService extends BaseService {
  // ============================================
  // Rule CRUD Operations
  // ============================================

  /**
   * Get all rules with pagination
   * GET /admin/rules
   */
  async getRules(params?: RuleQueryDto): Promise<PaginatedResponse<Rule>> {
    return this.getPaginated<Rule>(API_ENDPOINTS.RULES.BASE, params as Record<string, any>)
  }

  /**
   * Get active rules
   * GET /admin/rules/active
   */
  async getActiveRules(organisationId?: string): Promise<Rule[]> {
    const response = await this.get<Rule[]>(API_ENDPOINTS.RULES.ACTIVE, { organisationId })
    return this.extractData(response)
  }

  /**
   * Get rule by ID
   * GET /admin/rules/:uuid
   */
  async getRule(uuid: string): Promise<Rule> {
    const response = await this.get<Rule>(API_ENDPOINTS.RULES.BY_ID(uuid))
    return this.extractData(response)
  }

  /**
   * Create a new rule
   * POST /admin/rules
   */
  async createRule(data: CreateRuleDto): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update a rule
   * PUT /admin/rules/:uuid
   */
  async updateRule(uuid: string, data: UpdateRuleDto): Promise<Rule> {
    const response = await this.put<Rule>(API_ENDPOINTS.RULES.BY_ID(uuid), data)
    return this.extractData(response)
  }

  /**
   * Delete a rule
   * DELETE /admin/rules/:uuid
   */
  async deleteRule(uuid: string): Promise<boolean> {
    const response = await this.delete<{ success: boolean }>(API_ENDPOINTS.RULES.BY_ID(uuid))
    return this.extractData(response).success
  }

  /**
   * Activate a rule
   * POST /admin/rules/:uuid/activate
   */
  async activateRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.ACTIVATE(uuid))
    return this.extractData(response)
  }

  /**
   * Deactivate a rule
   * POST /admin/rules/:uuid/deactivate
   */
  async deactivateRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.DEACTIVATE(uuid))
    return this.extractData(response)
  }

  /**
   * Archive a rule
   * POST /admin/rules/:uuid/archive
   */
  async archiveRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.ARCHIVE(uuid))
    return this.extractData(response)
  }

  /**
   * Execute a rule
   * POST /admin/rules/:uuid/execute
   */
  async executeRule(uuid: string, data: { context?: Record<string, any>; async?: boolean }): Promise<any> {
    const response = await this.post(API_ENDPOINTS.RULES.EXECUTE(uuid), data)
    return this.extractData(response)
  }

  /**
   * Test a rule
   * POST /admin/rules/:uuid/test
   */
  async testRule(uuid: string, data: RuleTestDto): Promise<RuleTestResultDto> {
    const response = await this.post<RuleTestResultDto>(API_ENDPOINTS.RULES.TEST(uuid), data)
    return this.extractData(response)
  }

  /**
   * Duplicate a rule
   * POST /admin/rules/:uuid/duplicate
   */
  async duplicateRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.DUPLICATE(uuid))
    return this.extractData(response)
  }

  // ============================================
  // Rule Statistics
  // ============================================

  /**
   * Get rule statistics
   * GET /admin/rules/statistics
   */
  async getStats(organisationId?: string): Promise<RuleStatsDto> {
    const response = await this.get<RuleStatsDto>(API_ENDPOINTS.RULES.STATISTICS, { organisationId })
    return this.extractData(response)
  }

  /**
   * Get rule execution statistics
   * GET /admin/rules/:uuid/execution-logs/stats
   */
  async getExecutionStats(uuid: string, days?: number): Promise<RuleExecutionStatsDto> {
    const response = await this.get<RuleExecutionStatsDto>(
      API_ENDPOINTS.RULES.EXECUTION_STATS(uuid),
      { days }
    )
    return this.extractData(response)
  }

  /**
   * Get rule execution summary
   * GET /admin/rules/:uuid/execution-logs/summary
   */
  async getExecutionSummary(uuid: string, days: number = 30): Promise<RuleExecutionSummaryDto> {
    const response = await this.get<RuleExecutionSummaryDto>(
      API_ENDPOINTS.RULES.EXECUTION_SUMMARY(uuid),
      { days }
    )
    return this.extractData(response)
  }

  // ============================================
  // Execution Logs
  // ============================================

  /**
   * Get rule execution logs
   * GET /admin/rules/:uuid/execution-logs
   */
  async getExecutionLogs(
    ruleId: string,
    params?: ExecutionLogQueryDto
  ): Promise<PaginatedResponse<RuleExecutionLog>> {
    return this.getPaginated<RuleExecutionLog>(
      API_ENDPOINTS.RULES.EXECUTION_LOGS(ruleId),
      params as Record<string, any>
    )
  }

  /**
   * Get execution log by ID
   * GET /admin/rules/execution-logs/:uuid
   */
  async getExecutionLog(uuid: string): Promise<RuleExecutionLog> {
    const response = await this.get<RuleExecutionLog>(API_ENDPOINTS.RULES.EXECUTION_LOG_BY_ID(uuid))
    return this.extractData(response)
  }

  /**
   * Delete execution log
   * DELETE /admin/rules/execution-logs/:uuid
   */
  async deleteExecutionLog(uuid: string): Promise<boolean> {
    const response = await this.delete<{ success: boolean }>(API_ENDPOINTS.RULES.EXECUTION_LOG_DELETE(uuid))
    return this.extractData(response).success
  }

  /**
   * Cleanup old execution logs
   * DELETE /admin/rules/execution-logs/cleanup
   */
  async cleanupExecutionLogs(days: number = 90): Promise<{ cleanedCount: number }> {
    const response = await this.delete<{ cleanedCount: number }>(
      API_ENDPOINTS.RULES.EXECUTION_LOGS_CLEANUP,
      { days }
    )
    return this.extractData(response)
  }

  // ============================================
  // Rule Validation
  // ============================================

  /**
   * Validate a rule definition
   * POST /admin/rules/validate
   */
  async validateRule(data: { rule: CreateRuleDto }): Promise<{ valid: boolean; errors: string[] }> {
    const response = await this.post<{ valid: boolean; errors: string[] }>(
      API_ENDPOINTS.RULES.VALIDATE,
      data
    )
    return this.extractData(response)
  }

  /**
   * Test rule with sample data
   * POST /admin/rules/test-rule
   */
  async testRuleDefinition(data: { 
    conditions: any[]; 
    actions: any[]; 
    testData: Record<string, any> 
  }): Promise<RuleTestResultDto> {
    const response = await this.post<RuleTestResultDto>(
      API_ENDPOINTS.RULES.TEST_DEFINITION,
      data
    )
    return this.extractData(response)
  }

  // ============================================
  // Version Management
  // ============================================

  /**
   * Get rule versions
   * GET /admin/rules/:uuid/versions
   */
  async getRuleVersions(uuid: string): Promise<Rule[]> {
    const response = await this.get<Rule[]>(API_ENDPOINTS.RULES.VERSIONS(uuid))
    return this.extractData(response)
  }

  /**
   * Restore rule version
   * POST /admin/rules/:uuid/restore/:versionNumber
   */
  async restoreRuleVersion(uuid: string, versionNumber: number): Promise<Rule> {
    const response = await this.post<Rule>(
      API_ENDPOINTS.RULES.RESTORE(uuid, versionNumber)
    )
    return this.extractData(response)
  }
}

export const ruleService = new RuleService()