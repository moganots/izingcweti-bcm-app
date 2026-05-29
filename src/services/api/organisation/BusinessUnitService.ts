import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  CriticalityScore,
  type BusinessUnit,
  type Department,
  type CreateBusinessUnitRequest,
  type PaginatedResponse,
  type QueryParams,
  UpdateBusinessUnitRequest,
} from './../../../modules'

export interface BusinessUnitQueryParams extends QueryParams {
  organisation_id?: string
  criticality_score?: CriticalityScore
  head_user_id?: string
}

export interface BulkImportResult {
  imported: number
  updated: number
  failed: number
  errors: string[]
}

export class BusinessUnitService extends BaseService {
  async getBusinessUnits(
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.BUSINESS_UNITS.BASE,
      params as Record<string, any>
    )
  }

  async getBusinessUnit(id: string): Promise<BusinessUnit & { departments?: Department[] }> {
    const response = await this.get<BusinessUnit>(API_ENDPOINTS.BUSINESS_UNITS.BY_ID(id))
    return this.extractData(response)
  }

  async getBusinessUnitsByOrganisation(
    organisationId: string,
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getBusinessUnits({ ...params, organisation_id: organisationId })
  }

  async createBusinessUnit(data: CreateBusinessUnitRequest): Promise<BusinessUnit> {
    const response = await this.post<BusinessUnit>(API_ENDPOINTS.BUSINESS_UNITS.BASE, data)
    return this.extractData(response)
  }

  async updateBusinessUnit(id: string, data: UpdateBusinessUnitRequest): Promise<BusinessUnit> {
    const response = await this.put<BusinessUnit>(API_ENDPOINTS.BUSINESS_UNITS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteBusinessUnit(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BUSINESS_UNITS.BY_ID(id))
  }

  async permanentlyDeleteBusinessUnit(id: string): Promise<void> {
    await this.delete(`/business-units/${id}/permanent`)
  }

  async restoreBusinessUnit(id: string): Promise<BusinessUnit> {
    const response = await this.post<BusinessUnit>(`/business-units/${id}/restore`)
    return this.extractData(response)
  }

  async getCriticalBusinessUnits(organisationId: string): Promise<BusinessUnit[]> {
    const response = await this.get<BusinessUnit[]>(`/business-units/${organisationId}/critical`)
    return this.extractData(response)
  }

  async getBusinessUnitsByCriticality(
    criticalityScore: CriticalityScore,
    organisationId?: string
  ): Promise<PaginatedResponse<BusinessUnit>> {
    const params: BusinessUnitQueryParams = { criticality_score: criticalityScore }
    if (organisationId) params.organisation_id = organisationId
    return this.getBusinessUnits(params)
  }

  async getBusinessUnitsByHead(headUserId: string): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getBusinessUnits({ head_user_id: headUserId })
  }

  async getCriticalityScores(): Promise<
    { value: CriticalityScore; label: string; description: string }[]
  > {
    const response = await this.get<
      { value: CriticalityScore; label: string; description: string }[]
    >('/business-units/criticality-scores')
    return this.extractData(response)
  }

  async searchBusinessUnits(
    query: string,
    organisationId?: string
  ): Promise<PaginatedResponse<BusinessUnit>> {
    const params: BusinessUnitQueryParams = { search: query }
    if (organisationId) params.organisation_id = organisationId
    return this.getBusinessUnits(params)
  }

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

  async exportBusinessUnits(organisationId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      `/business-units/${organisationId}/export`,
      `business_units_${organisationId}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

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

export const businessUnitService = new BusinessUnitService()
