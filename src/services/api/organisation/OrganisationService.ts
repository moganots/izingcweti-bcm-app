import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  IndustryType,
  MaturityScore,
  type Organisation,
  type BusinessUnit,
  type Department,
  type CreateOrganisationRequest,
  type UpdateOrganisationRequest,
  type PaginatedResponse,
} from './../../../modules'

export interface OrganisationQueryParams {
  tenant_id?: string
  industry_type?: IndustryType
  maturity_score?: MaturityScore
  page?: number
  limit?: number
  search?: string
}

export interface OrganisationStats {
  total: number
  byIndustry: Record<string, number>
  byMaturity: Record<string, number>
  activeCount: number
}

export interface OrganisationDashboard {
  totalBusinessUnits: number
  totalDepartments: number
  totalUsers: number
  totalBCPs: number
  complianceRate: number
}

export interface BulkImportResult {
  imported: number
  updated: number
  failed: number
  errors: string[]
}

export interface ExportOptions {
  format?: 'csv' | 'json'
  include?: string[]
}

export class OrganisationService extends BaseService {
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
  ): Promise<Organisation & { business_units?: BusinessUnit[]; documents?: any[] }> {
    const params = include ? { include: include.join(',') } : undefined
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

  async getStats(organisationId?: string): Promise<OrganisationStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<OrganisationStats>(
      API_ENDPOINTS.ORGANISATIONS.STATISTICS,
      params
    )
    return this.extractData(response)
  }

  async searchOrganisations(
    query: string,
    params?: OrganisationQueryParams
  ): Promise<PaginatedResponse<Organisation>> {
    return this.getOrganisations({ ...params, search: query })
  }

  async getOrganisationsByTenant(tenantId: string): Promise<PaginatedResponse<Organisation>> {
    return this.getOrganisations({ tenant_id: tenantId })
  }

  async getOrganisationsByIndustry(
    industryType: IndustryType
  ): Promise<PaginatedResponse<Organisation>> {
    return this.getOrganisations({ industry_type: industryType })
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

  async getOrganisationHierarchy(organisationId: string): Promise<{
    organisation: Organisation
    business_units: Array<{ business_unit: BusinessUnit; departments: Department[] }>
  }> {
    const response = await this.get<{
      organisation: Organisation
      business_units: Array<{ business_unit: BusinessUnit; departments: Department[] }>
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

  async getIndustryTypes(): Promise<IndustryType[]> {
    const response = await this.get<IndustryType[]>(API_ENDPOINTS.ORGANISATIONS.INDUSTRY_TYPES)
    return this.extractData(response)
  }

  async getMaturityScores(): Promise<MaturityScore[]> {
    const response = await this.get<MaturityScore[]>(API_ENDPOINTS.ORGANISATIONS.MATURITY_SCORES)
    return this.extractData(response)
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

export const organisationService = new OrganisationService()
