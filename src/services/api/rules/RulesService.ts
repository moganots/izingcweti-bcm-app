import { BaseService } from '@/services/BaseService';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import type {
  Rule,
  RuleExecutionLog,
  CreateRuleDto,
  UpdateRuleDto,
  ExecuteRuleDto,
  RuleTestDto,
  RuleTestResultDto,
  RuleQueryDto,
  RuleStatsDto,
  RuleExecutionStatsDto,
  RuleExecutionSummaryDto,
  GlobalExecutionStatsDto,
  ExecutionLogQueryDto,
  PaginatedResult,
} from '@/types/rules';

export class RulesService extends BaseService {
  constructor() {
    super();
  }

  // ============================================
  // Rule CRUD Operations
  // ============================================

  async getRules(params?: RuleQueryDto): Promise<PaginatedResult<Rule>> {
    return this.getPaginated<Rule>(
      API_ENDPOINTS.RULES.BASE,
      params as Record<string, any>
    );
  }

  async getRule(uuid: string): Promise<Rule> {
    const response = await this.get<Rule>(API_ENDPOINTS.RULES.BY_ID(uuid));
    return this.extractData(response);
  }

  async createRule(data: CreateRuleDto): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.BASE, data);
    return this.extractData(response);
  }

  async updateRule(uuid: string, data: UpdateRuleDto): Promise<Rule> {
    const response = await this.put<Rule>(API_ENDPOINTS.RULES.BY_ID(uuid), data);
    return this.extractData(response);
  }

  async deleteRule(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RULES.BY_ID(uuid));
  }

  // ============================================
  // Rule Lifecycle Operations
  // ============================================

  async activateRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.ACTIVATE(uuid));
    return this.extractData(response);
  }

  async deactivateRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.DEACTIVATE(uuid));
    return this.extractData(response);
  }

  async archiveRule(uuid: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.ARCHIVE(uuid));
    return this.extractData(response);
  }

  async duplicateRule(uuid: string, name: string): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.DUPLICATE(uuid), { name });
    return this.extractData(response);
  }

  async getRuleVersions(uuid: string): Promise<any[]> {
    const response = await this.get<any[]>(API_ENDPOINTS.RULES.VERSIONS(uuid));
    return this.extractData(response);
  }

  async restoreRuleVersion(uuid: string, versionNumber: number): Promise<Rule> {
    const response = await this.post<Rule>(
      API_ENDPOINTS.RULES.RESTORE(uuid, versionNumber)
    );
    return this.extractData(response);
  }

  // ============================================
  // Rule Execution & Testing
  // ============================================

  async executeRule(uuid: string, data: ExecuteRuleDto): Promise<{
    success: boolean;
    message?: string;
    actions?: any[];
    executionId?: string;
  }> {
    const response = await this.post<{
      success: boolean;
      message?: string;
      actions?: any[];
      executionId?: string;
    }>(API_ENDPOINTS.RULES.EXECUTE(uuid), data);
    return this.extractData(response);
  }

  async testRule(uuid: string, data: RuleTestDto): Promise<RuleTestResultDto> {
    const response = await this.post<RuleTestResultDto>(
      API_ENDPOINTS.RULES.TEST(uuid),
      data
    );
    return this.extractData(response);
  }

  async testRuleDefinition(data: {
    conditions: any[];
    actions: any[];
    testData: any;
  }): Promise<RuleTestResultDto> {
    const response = await this.post<RuleTestResultDto>(
      API_ENDPOINTS.RULES.TEST_DEFINITION,
      data
    );
    return this.extractData(response);
  }

  async validateRule(data: Partial<Rule>): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const response = await this.post<{
      valid: boolean;
      errors: string[];
    }>(API_ENDPOINTS.RULES.VALIDATE, data);
    return this.extractData(response);
  }

  // ============================================
  // Query Operations
  // ============================================

  async getActiveRules(organisationId?: string): Promise<Rule[]> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<Rule[]>(API_ENDPOINTS.RULES.ACTIVE, params);
    return this.extractData(response);
  }

  async getRulesByTrigger(triggerEvent: string, organisationId?: string): Promise<Rule[]> {
    const params: any = { triggerEvent };
    if (organisationId) params.organisationId = organisationId;
    const response = await this.get<Rule[]>(`/rules/trigger/${triggerEvent}`, params);
    return this.extractData(response);
  }

  // ============================================
  // Statistics Operations
  // ============================================

  async getStats(organisationId?: string): Promise<RuleStatsDto> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<RuleStatsDto>(
      API_ENDPOINTS.RULES.STATISTICS,
      params
    );
    return this.extractData(response);
  }

  async getOrganisationStats(organisationId: string): Promise<RuleStatsDto> {
    const response = await this.get<RuleStatsDto>(
      API_ENDPOINTS.RULES.ORGANISATION_STATS(organisationId)
    );
    return this.extractData(response);
  }

  // ============================================
  // Execution Log Operations
  // ============================================

  async getExecutionLogs(
    ruleId: string,
    params?: ExecutionLogQueryDto
  ): Promise<PaginatedResult<RuleExecutionLog>> {
    return this.getPaginated<RuleExecutionLog>(
      API_ENDPOINTS.RULES.EXECUTION_LOGS(ruleId),
      params as Record<string, any>
    );
  }

  async getExecutionStats(ruleId: string, days?: number): Promise<RuleExecutionStatsDto> {
    const params = days ? { days } : undefined;
    const response = await this.get<RuleExecutionStatsDto>(
      API_ENDPOINTS.RULES.EXECUTION_STATS(ruleId),
      params
    );
    return this.extractData(response);
  }

  async getExecutionSummary(ruleId: string, days: number = 30): Promise<RuleExecutionSummaryDto> {
    const response = await this.get<RuleExecutionSummaryDto>(
      `/rules/${ruleId}/execution-logs/summary`,
      { days }
    );
    return this.extractData(response);
  }

  async getGlobalExecutionStats(): Promise<GlobalExecutionStatsDto> {
    const response = await this.get<GlobalExecutionStatsDto>(
      '/rules/execution-logs/global-stats'
    );
    return this.extractData(response);
  }

  async cleanupExecutionLogs(days: number = 90): Promise<{ count: number }> {
    const response = await this.delete<{ count: number }>(
      API_ENDPOINTS.RULES.EXECUTION_LOGS_CLEANUP,
      { days }
    );
    return this.extractData(response);
  }

  async deleteExecutionLog(uuid: string): Promise<void> {
    await this.delete(`/rules/execution-logs/${uuid}`);
  }
}

export const rulesService = new RulesService();