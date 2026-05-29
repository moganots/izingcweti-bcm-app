import { BaseService } from './../../BaseService'
import {
  // Enums
  CriticalityScore,
  // Types
  type BusinessUnit,
  type Department,
  type CreateBusinessUnitRequest,
  // Shared Types
  type PaginatedResponse,
  type QueryParams,
  UpdateBusinessUnitRequest,
} from './../../../modules'

/**
 * Business Unit Query Parameters
 */
export interface BusinessUnitQueryParams extends QueryParams {
  organisation_id?: string
  criticality_score?: CriticalityScore
  head_user_id?: string
}

/**
 * Bulk Import Result
 */
export interface BulkImportResult {
  imported: number
  updated: number
  failed: number
  errors: string[]
}

/**
 * Business Unit API Service
 * Uses consolidated module types and enums
 */
export class BusinessUnitService extends BaseService {
  // ============================================
  // Business Unit CRUD
  // ============================================

  /**
   * Get all business units with pagination and filters
   */
  async getBusinessUnits(
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>('/business-units', params as Record<string, any>)
  }

  /**
   * Get business unit by ID
   */
  async getBusinessUnit(id: string): Promise<BusinessUnit & { departments?: Department[] }> {
    const response = await this.get<BusinessUnit>(`/business-units/${id}`)
    return this.extractData(response)
  }

  /**
   * Get business units by organisation
   */
  async getBusinessUnitsByOrganisation(
    organisationId: string,
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getBusinessUnits({ ...params, organisation_id: organisationId })
  }

  /**
   * Create a new business unit
   */
  async createBusinessUnit(data: CreateBusinessUnitRequest): Promise<BusinessUnit> {
    const response = await this.post<BusinessUnit>('/business-units', data)
    return this.extractData(response)
  }

  /**
   * Update a business unit
   */
  async updateBusinessUnit(id: string, data: UpdateBusinessUnitRequest): Promise<BusinessUnit> {
    const response = await this.put<BusinessUnit>(`/business-units/${id}`, data)
    return this.extractData(response)
  }

  /**
   * Delete a business unit (soft delete)
   */
  async deleteBusinessUnit(id: string): Promise<void> {
    await this.delete(`/business-units/${id}`)
  }

  /**
   * Permanently delete a business unit
   */
  async permanentlyDeleteBusinessUnit(id: string): Promise<void> {
    await this.delete(`/business-units/${id}/permanent`)
  }

  /**
   * Restore a deleted business unit
   */
  async restoreBusinessUnit(id: string): Promise<BusinessUnit> {
    const response = await this.post<BusinessUnit>(`/business-units/${id}/restore`)
    return this.extractData(response)
  }

  /**
   * Get critical business units (CRITICAL or HIGH criticality)
   */
  async getCriticalBusinessUnits(organisationId: string): Promise<BusinessUnit[]> {
    const response = await this.get<BusinessUnit[]>(`/business-units/${organisationId}/critical`)
    return this.extractData(response)
  }

  /**
   * Get business units by criticality score
   */
  async getBusinessUnitsByCriticality(
    criticalityScore: CriticalityScore,
    organisationId?: string
  ): Promise<PaginatedResponse<BusinessUnit>> {
    const params: BusinessUnitQueryParams = { criticality_score: criticalityScore }
    if (organisationId) params.organisation_id = organisationId
    return this.getBusinessUnits(params)
  }

  /**
   * Get business units by head user
   */
  async getBusinessUnitsByHead(headUserId: string): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getBusinessUnits({ head_user_id: headUserId })
  }

  /**
   * Get all available criticality scores
   */
  async getCriticalityScores(): Promise<
    { value: CriticalityScore; label: string; description: string }[]
  > {
    const response = await this.get<
      { value: CriticalityScore; label: string; description: string }[]
    >('/business-units/criticality-scores')
    return this.extractData(response)
  }

  /**
   * Search business units by name
   */
  async searchBusinessUnits(
    query: string,
    organisationId?: string
  ): Promise<PaginatedResponse<BusinessUnit>> {
    const params: BusinessUnitQueryParams = { search: query }
    if (organisationId) params.organisation_id = organisationId
    return this.getBusinessUnits(params)
  }

  /**
   * Bulk import business units
   */
  async bulkImportBusinessUnits(
    organisationId: string,
    businessUnits: CreateBusinessUnitRequest[]
  ): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(
      `/business-units/${organisationId}/bulk-import`,
      {
        business_units: businessUnits,
      }
    )
    return this.extractData(response)
  }

  /**
   * Export business units
   */
  async exportBusinessUnits(organisationId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      `/business-units/${organisationId}/export`,
      `business_units_${organisationId}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  /**
   * Get business unit hierarchy with departments
   */
  async getBusinessUnitHierarchy(businessUnitId: string): Promise<{
    businessUnit: BusinessUnit
    departments: Department[]
  }> {
    const response = await this.get<{
      businessUnit: BusinessUnit
      departments: Department[]
    }>(`/business-units/${businessUnitId}/hierarchy`)
    return this.extractData(response)
  }

  /**
   * Get all business units with departments for an organisation
   */
  async getOrganisationHierarchy(organisationId: string): Promise<{
    organisation: { uuid: string; name: string }
    businessUnits: Array<{
      businessUnit: BusinessUnit
      departments: Department[]
    }>
  }> {
    const response = await this.get<{
      organisation: { uuid: string; name: string }
      businessUnits: Array<{
        businessUnit: BusinessUnit
        departments: Department[]
      }>
    }>(`/business-units/organisation/${organisationId}/hierarchy`)
    return this.extractData(response)
  }

  /**
   * Validate business unit name uniqueness
   */
  async validateBusinessUnitName(
    name: string,
    organisationId: string,
    excludeId?: string
  ): Promise<{ valid: boolean; message?: string }> {
    const response = await this.post<{ valid: boolean; message?: string }>(
      '/business-units/validate-name',
      { name, organisation_id: organisationId, exclude_id: excludeId }
    )
    return this.extractData(response)
  }
}

// Export singleton
export const businessUnitService = new BusinessUnitService()
