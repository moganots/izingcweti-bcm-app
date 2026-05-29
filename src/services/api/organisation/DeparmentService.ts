import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  type Department,
  type CreateDepartmentRequest,
  type PaginatedResponse,
  type QueryParams,
  UpdateDepartmentRequest,
} from './../../../modules'

export interface DepartmentQueryParams extends QueryParams {
  business_unit_id?: string
  parent_department_id?: string
  has_rto?: boolean
  has_rpo?: boolean
}

export interface DepartmentTreeNode {
  id: string
  name: string
  description?: string
  order: number
  recovery_time_objective_hours?: number
  recovery_point_objective_hours?: number
  children: DepartmentTreeNode[]
}

export interface BulkImportResult {
  imported: number
  updated: number
  failed: number
  errors: string[]
}

export class DepartmentService extends BaseService {
  async getDepartments(params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> {
    return this.getPaginated<Department>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      params as Record<string, any>
    )
  }

  async getDepartment(id: string): Promise<Department> {
    const response = await this.get<Department>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id))
    return this.extractData(response)
  }

  async getDepartmentsByBusinessUnit(
    businessUnitId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<Department>> {
    return this.getDepartments({ ...params, business_unit_id: businessUnitId })
  }

  async getSubDepartments(
    parentDepartmentId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<Department>> {
    return this.getDepartments({ ...params, parent_department_id: parentDepartmentId })
  }

  async getRootDepartments(businessUnitId: string): Promise<PaginatedResponse<Department>> {
    return this.getDepartments({ business_unit_id: businessUnitId, parent_department_id: '' })
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const response = await this.post<Department>(API_ENDPOINTS.DEPARTMENTS.BASE, data)
    return this.extractData(response)
  }

  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await this.put<Department>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.DEPARTMENTS.BY_ID(id))
  }

  async permanentlyDeleteDepartment(id: string): Promise<void> {
    await this.delete(`/departments/${id}/permanent`)
  }

  async restoreDepartment(id: string): Promise<Department> {
    const response = await this.post<Department>(`/departments/${id}/restore`)
    return this.extractData(response)
  }

  async getDepartmentsWithoutBIA(organisationId: string): Promise<Department[]> {
    const response = await this.get<Department[]>(`/departments/${organisationId}/without-bia`)
    return this.extractData(response)
  }

  async getDepartmentsWithRTO(businessUnitId?: string): Promise<Department[]> {
    const params: DepartmentQueryParams = { has_rto: true }
    if (businessUnitId) params.business_unit_id = businessUnitId
    const response = await this.getPaginated<Department>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      params as Record<string, any>
    )
    return response.data ?? []
  }

  async getDepartmentsWithRPO(businessUnitId?: string): Promise<Department[]> {
    const params: DepartmentQueryParams = { has_rpo: true }
    if (businessUnitId) params.business_unit_id = businessUnitId
    const response = await this.getPaginated<Department>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      params as Record<string, any>
    )
    return response.data ?? []
  }

  async getDepartmentTree(businessUnitId: string): Promise<DepartmentTreeNode[]> {
    const response = await this.get<DepartmentTreeNode[]>(
      API_ENDPOINTS.DEPARTMENTS.TREE(businessUnitId)
    )
    return this.extractData(response)
  }

  async getDepartmentHierarchy(businessUnitId: string): Promise<{
    businessUnit: { uuid: string; name: string }
    departments: DepartmentTreeNode[]
  }> {
    const response = await this.get<{
      businessUnit: { uuid: string; name: string }
      departments: DepartmentTreeNode[]
    }>(`/departments/${businessUnitId}/hierarchy`)
    return this.extractData(response)
  }

  async reorderDepartments(orders: Array<{ id: string; order: number }>): Promise<void> {
    await this.post(API_ENDPOINTS.DEPARTMENTS.REORDER, { orders })
  }

  async searchDepartments(
    query: string,
    businessUnitId?: string
  ): Promise<PaginatedResponse<Department>> {
    const params: DepartmentQueryParams = { search: query }
    if (businessUnitId) params.business_unit_id = businessUnitId
    return this.getDepartments(params)
  }

  async bulkImportDepartments(
    businessUnitId: string,
    departments: CreateDepartmentRequest[]
  ): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(
      `/departments/${businessUnitId}/bulk-import`,
      {
        departments,
      }
    )
    return this.extractData(response)
  }

  async exportDepartments(businessUnitId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      `/departments/${businessUnitId}/export`,
      `departments_${businessUnitId}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  async getDepartmentStats(businessUnitId?: string): Promise<{
    total: number
    withRTO: number
    withRPO: number
    withBIA: number
    withoutBIA: number
    averageRTOHours: number
    averageRPOHours: number
  }> {
    const params = businessUnitId ? { business_unit_id: businessUnitId } : undefined
    const response = await this.get<{
      total: number
      withRTO: number
      withRPO: number
      withBIA: number
      withoutBIA: number
      averageRTOHours: number
      averageRPOHours: number
    }>(API_ENDPOINTS.DEPARTMENTS.STATISTICS, params)
    return this.extractData(response)
  }

  async getDepartmentPath(departmentId: string): Promise<Department[]> {
    const response = await this.get<Department[]>(`/departments/${departmentId}/path`)
    return this.extractData(response)
  }

  async moveDepartment(
    departmentId: string,
    target: { business_unit_id?: string; parent_department_id?: string | null }
  ): Promise<Department> {
    const response = await this.patch<Department>(`/departments/${departmentId}/move`, target)
    return this.extractData(response)
  }

  async validateDepartmentName(
    name: string,
    businessUnitId: string,
    excludeId?: string
  ): Promise<{ valid: boolean; message?: string }> {
    const response = await this.post<{ valid: boolean; message?: string }>(
      '/departments/validate-name',
      { name, business_unit_id: businessUnitId, exclude_id: excludeId }
    )
    return this.extractData(response)
  }
}

export const departmentService = new DepartmentService()
