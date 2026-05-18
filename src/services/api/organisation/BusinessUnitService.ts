import { BaseService } from '../BaseService'
import type { BusinessUnit, Department } from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import type {
  CreateBusinessUnitRequest,
  UpdateBusinessUnitRequest,
  BusinessUnitQueryParams,
  BulkImportResult,
  PaginatedResponse,
} from './../../../types'

/**
 * Business Unit API Service
 */
export class BusinessUnitService extends BaseService {
  // ============================================
  // Business Unit CRUD
  // ============================================

  async getBusinessUnits(
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BASE,
      params as Record<string, any>
    )
  }

  async getBusinessUnit(id: string): Promise<BusinessUnit & { departments?: Department[] }> {
    const response = await this.get<BusinessUnit>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BY_ID(id)
    )
    return this.extractData(response)
  }

  async getBusinessUnitsByOrganisation(
    organisationId: string,
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BASE, {
      ...params,
      organisation_id: organisationId,
    } as Record<string, any>)
  }

  async createBusinessUnit(data: CreateBusinessUnitRequest): Promise<BusinessUnit> {
    const response = await this.post<BusinessUnit>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BASE,
      data
    )
    return this.extractData(response)
  }

  async updateBusinessUnit(id: string, data: UpdateBusinessUnitRequest): Promise<BusinessUnit> {
    const response = await this.put<BusinessUnit>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteBusinessUnit(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BY_ID(id))
  }

  async getCriticalBusinessUnits(organisationId: string): Promise<BusinessUnit[]> {
    const response = await this.get<BusinessUnit[]>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.CRITICAL(organisationId)
    )
    return this.extractData(response)
  }

  async getCriticalityScores(): Promise<{ value: string; label: string; description: string }[]> {
    const response = await this.get<{ value: string; label: string; description: string }[]>(
      API_ENDPOINTS.ORGANISATIONS.CRITICALITY_SCORES
    )
    return this.extractData(response)
  }

  async searchBusinessUnits(
    query: string,
    organisationId?: string
  ): Promise<PaginatedResponse<BusinessUnit>> {
    const params: Record<string, any> = { q: query }
    if (organisationId) params.organisation_id = organisationId

    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.SEARCH,
      params
    )
  }

  async bulkImportBusinessUnits(
    organisationId: string,
    businessUnits: CreateBusinessUnitRequest[]
  ): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.BULK_IMPORT(organisationId),
      { business_units: businessUnits }
    )
    return this.extractData(response)
  }

  async exportBusinessUnits(organisationId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      API_ENDPOINTS.ORGANISATIONS.BUSINESS_UNITS.EXPORT(organisationId),
      `business_units_${organisationId}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }
}

export const businessUnitService = new BusinessUnitService()
