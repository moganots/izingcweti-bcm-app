import { BaseService } from './../../BaseService'
import {
  RuleType,
  RuleTrigger,
  RuleStatus,
  type Rule,
  type RuleSchedule,
  type RuleExecutionLog,
  type RuleExecutionSchedule,
  type CreateRuleRequest,
  type UpdateRuleRequest,
  type RuleTestRequest,
  type RuleTestResult,
  type RuleValidationRequest,
  type RuleValidationResult,
  type RuleQueryParams,
  type RuleExecutionQueryParams,
  type RuleStatistics,
  type PaginatedResponse,
} from './../../../modules'

export class RulesService extends BaseService {
  async getRules(params?: RuleQueryParams): Promise<PaginatedResponse<Rule>> {
    return this.getPaginated<Rule>('/rules', params as Record<string, any>)
  }

  async getRule(id: string): Promise<Rule> {
    const response = await this.get<Rule>(`/rules/${id}`)
    return this.extractData(response)
  }

  async createRule(data: CreateRuleRequest): Promise<Rule> {
    const response = await this.post<Rule>('/rules', data)
    return this.extractData(response)
  }

  async updateRule(id: string, data: UpdateRuleRequest): Promise<Rule> {
    const response = await this.put<Rule>(`/rules/${id}`, data)
    return this.extractData(response)
  }

  async deleteRule(id: string): Promise<void> {
    await this.delete(`/rules/${id}`)
  }

  async activateRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/activate`)
    return this.extractData(response)
  }

  async deactivateRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/deactivate`)
    return this.extractData(response)
  }

  async archiveRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/archive`)
    return this.extractData(response)
  }

  async duplicateRule(id: string, newName: string): Promise<Rule> {
    const response = await this.post<Rule>(`/rules/${id}/duplicate`, { name: newName })
    return this.extractData(response)
  }

  async testRule(data: RuleTestRequest): Promise<RuleTestResult> {
    const response = await this.post<RuleTestResult>('/rules/test', data)
    return this.extractData(response)
  }

  async executeRule(
    id: string,
    entityId: string,
    entityType: string,
    contextData?: Record<string, any>
  ): Promise<RuleExecutionLog> {
    const response = await this.post<RuleExecutionLog>(`/rules/${id}/execute`, {
      entity_id: entityId,
      entity_type: entityType,
      context_data: contextData,
    })
    return this.extractData(response)
  }

  async getStats(organisationId?: string): Promise<RuleStatistics> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<RuleStatistics>('/rules/stats', params)
    return this.extractData(response)
  }

  async getExecutionLogs(
    ruleId: string,
    params?: RuleExecutionQueryParams
  ): Promise<PaginatedResponse<RuleExecutionLog>> {
    return this.getPaginated<RuleExecutionLog>(
      `/rules/${ruleId}/logs`,
      params as Record<string, any>
    )
  }

  async getExecutionStats(
    ruleId: string,
    days?: number
  ): Promise<{
    total: number
    successful: number
    failed: number
    avg_execution_time: number
    by_date: Array<{ date: string; count: number }>
  }> {
    const params = days ? { days } : undefined
    const response = await this.get(`/rules/${ruleId}/execution-stats`, params)
    return this.extractData(response)
  }

  async getRulesByEntityType(
    entityType: string,
    params?: RuleQueryParams
  ): Promise<PaginatedResponse<Rule>> {
    return this.getRules({ ...params, entity_type: entityType })
  }

  async getActiveRulesByTrigger(trigger: RuleTrigger, entityType: string): Promise<Rule[]> {
    const response = await this.get<Rule[]>(`/rules/active`, {
      rule_trigger: trigger,
      entity_type: entityType,
    })
    return this.extractData(response)
  }

  async validateRule(data: RuleValidationRequest): Promise<RuleValidationResult> {
    const response = await this.post<RuleValidationResult>('/rules/validate', data)
    return this.extractData(response)
  }

  async getRuleExecutionSchedule(ruleId: string): Promise<RuleExecutionSchedule> {
    const response = await this.get<RuleExecutionSchedule>(`/rules/${ruleId}/schedule`)
    return this.extractData(response)
  }

  async updateRuleExecutionSchedule(
    ruleId: string,
    schedule: RuleSchedule
  ): Promise<RuleExecutionSchedule> {
    const response = await this.put<RuleExecutionSchedule>(`/rules/${ruleId}/schedule`, schedule)
    return this.extractData(response)
  }

  async getRulesByType(
    ruleType: RuleType,
    params?: RuleQueryParams
  ): Promise<PaginatedResponse<Rule>> {
    return this.getRules({ ...params, rule_type: ruleType })
  }

  async getRulesByStatus(
    status: RuleStatus,
    params?: RuleQueryParams
  ): Promise<PaginatedResponse<Rule>> {
    return this.getRules({ ...params, status })
  }

  async getActiveRules(params?: RuleQueryParams): Promise<PaginatedResponse<Rule>> {
    return this.getRules({ ...params, is_active: true })
  }

  async bulkActivateRules(ids: string[]): Promise<{ activated: number }> {
    const response = await this.post<{ activated: number }>('/rules/bulk-activate', { ids })
    return this.extractData(response)
  }

  async bulkDeactivateRules(ids: string[]): Promise<{ deactivated: number }> {
    const response = await this.post<{ deactivated: number }>('/rules/bulk-deactivate', { ids })
    return this.extractData(response)
  }

  async bulkDeleteRules(ids: string[]): Promise<{ deleted: number }> {
    const response = await this.post<{ deleted: number }>('/rules/bulk-delete', { ids })
    return this.extractData(response)
  }
}

export const rulesService = new RulesService()
