import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { Rule } from '../../models/entities/rules.entity'

export class RulesService extends BaseService {
  async getRules(params?: any): Promise<PaginatedResponse<Rule>> {
    return this.getPaginated<Rule>(API_ENDPOINTS.RULES.BASE, params)
  }

  async getRule(id: string): Promise<Rule> {
    const response = await this.get<Rule>(API_ENDPOINTS.RULES.BY_ID(id))
    return this.extractData(response)
  }

  async createRule(data: any): Promise<Rule> {
    const response = await this.post<Rule>(API_ENDPOINTS.RULES.BASE, data)
    return this.extractData(response)
  }

  async updateRule(id: string, data: any): Promise<Rule> {
    const response = await this.put<Rule>(API_ENDPOINTS.RULES.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteRule(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RULES.BY_ID(id))
  }

  async activateRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/activate`)
    return this.extractData(response)
  }

  async deactivateRule(id: string): Promise<Rule> {
    const response = await this.patch<Rule>(`/rules/${id}/deactivate`)
    return this.extractData(response)
  }

  async duplicateRule(id: string, newName: string): Promise<Rule> {
    const response = await this.post<Rule>(`/rules/${id}/duplicate`, { name: newName })
    return this.extractData(response)
  }

  async testRule(data: any): Promise<any> {
    const response = await this.post('/rules/test', data)
    return this.extractData(response)
  }
}

export const rulesService = new RulesService()
