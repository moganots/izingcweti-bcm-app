import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { Rule, RuleExecutionLog } from '../../models/entities/rules.entity'

/**
 * Rule Statistics interface
 */
export interface RuleStats {
  total_rules: number
  active_rules: number
  total_executions: number
  total_failures: number
  success_rate: number
  by_type: Record<string, number>
  by_status: Record<string, number>
}

/**
 * Rules API Service
 */
export class RulesService extends BaseService {
  /**
   * Get all rules with pagination
   */
  async getRules(params?: any): Promise<PaginatedResponse<Rule>> {
    return this.getPaginated<Rule>(API_ENDPOINTS.RULES.BASE, params)
  }

  /**
   * Get rule by ID
   */
  async getRule(id: string): Promise<Rule> {
    const response = await this.get<Rule>(API_ENDPOINTS.RULES.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create a new rule
   */
  async createRule(data: Partial<Rule>): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.BASE, data)
    return this.extractData(response)
  }

  /**
   * Update a rule
   */
  async updateRule(id: string, data: Partial<Rule>): Promise<Rule> {
    const response = await this.put<Rule>(API_ENDPOINTS.RULES.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Delete a rule
   */
  async deleteRule(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RULES.BY_ID(id))
  }

  /**
   * Activate a rule
   */
  async activateRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/activate`)
    return this.extractData(response)
  }

  /**
   * Deactivate a rule
   */
  async deactivateRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/deactivate`)
    return this.extractData(response)
  }

  /**
   * Duplicate a rule
   */
  async duplicateRule(id: string, newName: string): Promise<Rule> {
    const response = await this.post<Rule>(`/rules/${id}/duplicate`, {
      name: newName,
    })
    return this.extractData(response)
  }

  /**
   * Test a rule without saving
   */
  async testRule(data: { conditions: any[]; actions: any[]; test_data: any }): Promise<{
    success: boolean
    conditions_met: boolean
    execution_time_ms: number
    results: Array<{ action: string; success: boolean; result: any }>
    error?: string
  }> {
    const response = await this.post('/rules/test', data)
    return this.extractData(response)
  }

  /**
   * Execute a rule manually
   */
  async executeRule(
    id: string,
    data: { entity_id: string; entity_type: string; context_data?: any }
  ): Promise<RuleExecutionLog> {
    const response = await this.post<RuleExecutionLog>(API_ENDPOINTS.RULES.EXECUTE(id), data)
    return this.extractData(response)
  }

  /**
   * Get rule statistics
   */
  async getStats(organisationId?: string): Promise<RuleStats> {
    const params: Record<string, any> = {}
    if (organisationId) params.organisation_id = organisationId

    const response = await this.get<RuleStats>('/rules/stats', params)
    return this.extractData(response)
  }

  /**
   * Get execution logs for a rule
   */
  async getExecutionLogs(
    ruleId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<RuleExecutionLog>> {
    return this.getPaginated<RuleExecutionLog>(
      `/rules/${ruleId}/logs`,
      params as Record<string, any>
    )
  }

  /**
   * Get execution statistics for a rule
   */
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
    const params: Record<string, any> = {}
    if (days) params.days = days

    const response = await this.get(`/rules/${ruleId}/execution-stats`, params)
    return this.extractData(response)
  }

  /**
   * Get rules by entity type
   */
  async getRulesByEntityType(entityType: string, params?: any): Promise<PaginatedResponse<Rule>> {
    return this.getPaginated<Rule>(API_ENDPOINTS.RULES.BASE, {
      ...params,
      entity_type: entityType,
    })
  }

  /**
   * Get active rules by trigger and entity
   */
  async getActiveRulesByTrigger(trigger: string, entityType: string): Promise<Rule[]> {
    const response = await this.get<Rule[]>(API_ENDPOINTS.RULES.ACTIVE, {
      rule_trigger: trigger,
      entity_type: entityType,
    })
    return this.extractData(response)
  }
}

// Export singleton
export const rulesService = new RulesService()
