import { BaseService } from '../../BaseService'
import type { Department } from './../../../models/entities'
import { API_ENDPOINTS } from './../../../utils/constants'
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQueryParams,
  BulkImportResult,
  PaginatedResponse,
} from './../../../types'

/**
 * Department API Service
 */
export class DepartmentService extends BaseService {
  // ============================================
  // Department CRUD
  // ============================================

  async getDepartments(params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> {
    return this.getPaginated<Department>(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE,
      params as Record<string, any>
    )
  }

  async getDepartment(id: string): Promise<Department> {
    const response = await this.get<Department>(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BY_ID(id))
    return this.extractData(response)
  }

  async getDepartmentsByBusinessUnit(
    businessId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<Department>> {
    return this.getPaginated<Department>(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE, {
      ...params,
      business_id: businessId,
    } as Record<string, any>)
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const response = await this.post<Department>(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE, data)
    return this.extractData(response)
  }

  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await this.put<Department>(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BY_ID(id),
      data
    )
    return this.extractData(response)
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BY_ID(id))
  }

  async getDepartmentsWithoutBIA(organisationId: string): Promise<Department[]> {
    const response = await this.get<Department[]>(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.WITHOUT_BIA(organisationId)
    )
    return this.extractData(response)
  }

  async getDepartmentsWithRTO(businessUnitId?: string): Promise<Department[]> {
    const params: Record<string, any> = { has_rto: true }
    if (businessUnitId) params.business_id = businessUnitId

    const response = await this.get<Department[]>(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE,
      params
    )
    return this.extractData(response)
  }

  async getDepartmentsWithRPO(businessUnitId?: string): Promise<Department[]> {
    const params: Record<string, any> = { has_rpo: true }
    if (businessUnitId) params.business_id = businessUnitId

    const response = await this.get<Department[]>(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BASE,
      params
    )
    return this.extractData(response)
  }

  async searchDepartments(
    query: string,
    businessUnitId?: string
  ): Promise<PaginatedResponse<Department>> {
    const params: Record<string, any> = { q: query }
    if (businessUnitId) params.business_id = businessUnitId

    return this.getPaginated<Department>(API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.SEARCH, params)
  }

  async bulkImportDepartments(
    businessUnitId: string,
    departments: CreateDepartmentRequest[]
  ): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.BULK_IMPORT(businessUnitId),
      { departments }
    )
    return this.extractData(response)
  }

  async exportDepartments(businessUnitId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      API_ENDPOINTS.ORGANISATIONS.DEPARTMENTS.EXPORT(businessUnitId),
      `departments_${businessUnitId}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }
}

export const departmentService = new DepartmentService()
