import { BaseService } from '../BaseService'
import type { Organisation, BusinessUnit, Department, Document } from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import type {
  BulkImportResult,
  CreateOrganisationRequest,
  ExportOptions,
  OrganisationDashboard,
  OrganisationQueryParams,
  OrganisationStats,
  PaginatedResponse,
  UpdateOrganisationRequest,
} from './../../../types'

/**
 * Organisation API Service
 */
export class OrganisationService extends BaseService {
  // ============================================
  // Organisation CRUD
  // ============================================

  async getOrganisations(
    params?: OrganisationQueryParams
  ): Promise<PaginatedResponse<Organisation>> {
    return this.getPaginated<Organisation>(
      API_ENDPOINTS.ORGANISATIONS.BASE,
      params as Record<string, any>
    )
  }

  async getOrganisation(
    id: string,
    include?: string[]
  ): Promise<
    Organisation & {
      business_units?: BusinessUnit[]
      documents?: Document[]
    }
  > {
    const params: Record<string, any> = {}
    if (include?.length) params.include = include.join(',')

    const response = await this.get<Organisation>(API_ENDPOINTS.ORGANISATIONS.BY_ID(id), params)
    return this.extractData(response)
  }

  async createOrganisation(data: CreateOrganisationRequest): Promise<Organisation> {
    const response = await this.post<Organisation>(API_ENDPOINTS.ORGANISATIONS.BASE, data)
    return this.extractData(response)
  }

  async updateOrganisation(id: string, data: UpdateOrganisationRequest): Promise<Organisation> {
    const response = await this.put<Organisation>(API_ENDPOINTS.ORGANISATIONS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteOrganisation(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.ORGANISATIONS.BY_ID(id))
  }

  async permanentlyDeleteOrganisation(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.ORGANISATIONS.PERMANENT_DELETE(id))
  }

  async restoreOrganisation(id: string): Promise<Organisation> {
    const response = await this.post<Organisation>(API_ENDPOINTS.ORGANISATIONS.RESTORE(id))
    return this.extractData(response)
  }

  async getDashboard(organisationId: string): Promise<OrganisationDashboard> {
    const response = await this.get<OrganisationDashboard>(
      API_ENDPOINTS.ORGANISATIONS.DASHBOARD(organisationId)
    )
    return this.extractData(response)
  }

  async getStats(organisationId?: string): Promise<OrganisationStats> {
    const params: Record<string, any> = {}
    if (organisationId) params.organisation_id = organisationId

    const response = await this.get<OrganisationStats>(API_ENDPOINTS.ORGANISATIONS.STATS, params)
    return this.extractData(response)
  }

  async getOrganisationHierarchy(organisationId: string): Promise<{
    organisation: Organisation
    business_units: Array<{
      business_unit: BusinessUnit
      departments: Department[]
    }>
  }> {
    const response = await this.get<{
      organisation: Organisation
      business_units: Array<{
        business_unit: BusinessUnit
        departments: Department[]
      }>
    }>(API_ENDPOINTS.ORGANISATIONS.HIERARCHY(organisationId))
    return this.extractData(response)
  }

  async getOrganisationTree(organisationId: string): Promise<{
    id: string
    name: string
    type: 'organisation'
    children: Array<{
      id: string
      name: string
      type: 'business_unit'
      criticality: string
      children: Array<{
        id: string
        name: string
        type: 'department'
        rto?: string
        rpo?: string
      }>
    }>
  }> {
    const response = await this.get(API_ENDPOINTS.ORGANISATIONS.TREE(organisationId))
    return this.extractData(response)
  }

  async validateOrganisationName(
    name: string,
    excludeId?: string
  ): Promise<{ valid: boolean; message?: string }> {
    const response = await this.post<{ valid: boolean; message?: string }>(
      API_ENDPOINTS.ORGANISATIONS.VALIDATE_NAME,
      { name, exclude_id: excludeId }
    )
    return this.extractData(response)
  }

  async getIndustryTypes(): Promise<string[]> {
    const response = await this.get<string[]>(API_ENDPOINTS.ORGANISATIONS.INDUSTRY_TYPES)
    return this.extractData(response)
  }

  async searchOrganisations(
    query: string,
    params?: OrganisationQueryParams
  ): Promise<PaginatedResponse<Organisation>> {
    return this.getPaginated<Organisation>(API_ENDPOINTS.ORGANISATIONS.SEARCH, {
      ...params,
      q: query,
    } as Record<string, any>)
  }

  async bulkImportOrganisations(
    organisations: CreateOrganisationRequest[]
  ): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(API_ENDPOINTS.ORGANISATIONS.BULK_IMPORT, {
      organisations,
    })
    return this.extractData(response)
  }

  async exportOrganisations(params?: ExportOptions): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      API_ENDPOINTS.ORGANISATIONS.EXPORT,
      `organisations_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }
}

// Export singleton
export const organisationService = new OrganisationService()
