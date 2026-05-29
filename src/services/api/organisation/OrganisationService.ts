import { BaseService } from './../../BaseService'
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
    return this.getPaginated<Organisation>('/organisations', params as Record<string, any>)
  }

  async getOrganisation(
    id: string,
    include?: string[]
  ): Promise<Organisation & { business_units?: BusinessUnit[]; documents?: any[] }> {
    const params = include ? { include: include.join(',') } : undefined
    const response = await this.get<Organisation>(`/organisations/${id}`, params)
    return this.extractData(response)
  }

  async createOrganisation(data: CreateOrganisationRequest): Promise<Organisation> {
    const response = await this.post<Organisation>('/organisations', data)
    return this.extractData(response)
  }

  async updateOrganisation(id: string, data: UpdateOrganisationRequest): Promise<Organisation> {
    const response = await this.put<Organisation>(`/organisations/${id}`, data)
    return this.extractData(response)
  }

  async deleteOrganisation(id: string): Promise<void> {
    await this.delete(`/organisations/${id}`)
  }

  async permanentlyDeleteOrganisation(id: string): Promise<void> {
    await this.delete(`/organisations/${id}/permanent`)
  }

  async restoreOrganisation(id: string): Promise<Organisation> {
    const response = await this.post<Organisation>(`/organisations/${id}/restore`)
    return this.extractData(response)
  }

  async getDashboard(organisationId: string): Promise<OrganisationDashboard> {
    const response = await this.get<OrganisationDashboard>(
      `/organisations/${organisationId}/dashboard`
    )
    return this.extractData(response)
  }

  async getStats(organisationId?: string): Promise<OrganisationStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<OrganisationStats>('/organisations/stats', params)
    return this.extractData(response)
  }

  async getOrganisationHierarchy(organisationId: string): Promise<{
    organisation: Organisation
    business_units: Array<{ business_unit: BusinessUnit; departments: Department[] }>
  }> {
    const response = await this.get<{
      organisation: Organisation
      business_units: Array<{ business_unit: BusinessUnit; departments: Department[] }>
    }>(`/organisations/${organisationId}/hierarchy`)
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
    const response = await this.get(`/organisations/${organisationId}/tree`)
    return this.extractData(response)
  }

  async validateOrganisationName(
    name: string,
    excludeId?: string
  ): Promise<{ valid: boolean; message?: string }> {
    const response = await this.post<{ valid: boolean; message?: string }>(
      '/organisations/validate-name',
      { name, exclude_id: excludeId }
    )
    return this.extractData(response)
  }

  async getIndustryTypes(): Promise<IndustryType[]> {
    const response = await this.get<IndustryType[]>('/organisations/industry-types')
    return this.extractData(response)
  }

  async getMaturityScores(): Promise<MaturityScore[]> {
    const response = await this.get<MaturityScore[]>('/organisations/maturity-scores')
    return this.extractData(response)
  }

  async searchOrganisations(
    query: string,
    params?: OrganisationQueryParams
  ): Promise<PaginatedResponse<Organisation>> {
    return this.getOrganisations({ ...params, search: query })
  }

  async bulkImportOrganisations(
    organisations: CreateOrganisationRequest[]
  ): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>('/organisations/bulk-import', {
      organisations,
    })
    return this.extractData(response)
  }

  async exportOrganisations(params?: ExportOptions): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      '/organisations/export',
      `organisations_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  async getOrganisationsByTenant(tenantId: string): Promise<PaginatedResponse<Organisation>> {
    return this.getOrganisations({ tenant_id: tenantId })
  }

  async getOrganisationsByIndustry(
    industryType: IndustryType
  ): Promise<PaginatedResponse<Organisation>> {
    return this.getOrganisations({ industry_type: industryType })
  }
}

export const organisationService = new OrganisationService()
