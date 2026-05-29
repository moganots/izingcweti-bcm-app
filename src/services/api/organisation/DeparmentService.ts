import { BaseService } from './../../BaseService'
import {
  // Enums (none specific to departments, but imported for consistency)
  // Types
  type Department,
  type CreateDepartmentRequest,
  // Shared Types
  type PaginatedResponse,
  type QueryParams,
  UpdateDepartmentRequest,
} from './../../../modules'

/**
 * Department Query Parameters
 */
export interface DepartmentQueryParams extends QueryParams {
  business_unit_id?: string
  parent_department_id?: string
  has_rto?: boolean
  has_rpo?: boolean
}

/**
 * Department Tree Node
 */
export interface DepartmentTreeNode {
  id: string
  name: string
  description?: string
  order: number
  recovery_time_objective_hours?: number
  recovery_point_objective_hours?: number
  children: DepartmentTreeNode[]
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
 * Department API Service
 * Uses consolidated module types and enums
 */
export class DepartmentService extends BaseService {
  // ============================================
  // Department CRUD
  // ============================================

  /**
   * Get all departments with pagination and filters
   */
  async getDepartments(params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> {
    return this.getPaginated<Department>('/departments', params as Record<string, any>)
  }

  /**
   * Get department by ID
   */
  async getDepartment(id: string): Promise<Department> {
    const response = await this.get<Department>(`/departments/${id}`)
    return this.extractData(response)
  }

  /**
   * Get departments by business unit
   */
  async getDepartmentsByBusinessUnit(
    businessUnitId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<Department>> {
    return this.getDepartments({ ...params, business_unit_id: businessUnitId })
  }

  /**
   * Get departments by parent department (sub-departments)
   */
  async getSubDepartments(
    parentDepartmentId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<Department>> {
    return this.getDepartments({ ...params, parent_department_id: parentDepartmentId })
  }

  /**
   * Get root departments (no parent) for a business unit
   */
  async getRootDepartments(businessUnitId: string): Promise<PaginatedResponse<Department>> {
    return this.getDepartments({ business_unit_id: businessUnitId, parent_department_id: '' })
  }

  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const response = await this.post<Department>('/departments', data)
    return this.extractData(response)
  }

  /**
   * Update a department
   */
  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await this.put<Department>(`/departments/${id}`, data)
    return this.extractData(response)
  }

  /**
   * Delete a department (soft delete)
   */
  async deleteDepartment(id: string): Promise<void> {
    await this.delete(`/departments/${id}`)
  }

  /**
   * Permanently delete a department
   */
  async permanentlyDeleteDepartment(id: string): Promise<void> {
    await this.delete(`/departments/${id}/permanent`)
  }

  /**
   * Restore a deleted department
   */
  async restoreDepartment(id: string): Promise<Department> {
    const response = await this.post<Department>(`/departments/${id}/restore`)
    return this.extractData(response)
  }

  /**
   * Get departments without BIA (missing RTO/RPO)
   */
  async getDepartmentsWithoutBIA(organisationId: string): Promise<Department[]> {
    const response = await this.get<Department[]>(`/departments/${organisationId}/without-bia`)
    return this.extractData(response)
  }

  /**
   * Get departments with RTO configured
   */
  async getDepartmentsWithRTO(businessUnitId?: string): Promise<Department[]> {
    const params: DepartmentQueryParams = { has_rto: true }
    if (businessUnitId) params.business_unit_id = businessUnitId
    const response = await this.getPaginated<Department>(
      '/departments',
      params as Record<string, any>
    )
    return response.data
  }

  /**
   * Get departments with RPO configured
   */
  async getDepartmentsWithRPO(businessUnitId?: string): Promise<Department[]> {
    const params: DepartmentQueryParams = { has_rpo: true }
    if (businessUnitId) params.business_unit_id = businessUnitId
    const response = await this.getPaginated<Department>(
      '/departments',
      params as Record<string, any>
    )
    return response.data
  }

  /**
   * Get department tree (hierarchical structure)
   */
  async getDepartmentTree(businessUnitId: string): Promise<DepartmentTreeNode[]> {
    const response = await this.get<DepartmentTreeNode[]>(`/departments/${businessUnitId}/tree`)
    return this.extractData(response)
  }

  /**
   * Get full department hierarchy for a business unit
   */
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

  /**
   * Reorder departments (update display order)
   */
  async reorderDepartments(orders: Array<{ id: string; order: number }>): Promise<void> {
    await this.post('/departments/reorder', { orders })
  }

  /**
   * Search departments by name
   */
  async searchDepartments(
    query: string,
    businessUnitId?: string
  ): Promise<PaginatedResponse<Department>> {
    const params: DepartmentQueryParams = { search: query }
    if (businessUnitId) params.business_unit_id = businessUnitId
    return this.getDepartments(params)
  }

  /**
   * Bulk import departments
   */
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

  /**
   * Export departments
   */
  async exportDepartments(businessUnitId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    await this.download(
      `/departments/${businessUnitId}/export`,
      `departments_${businessUnitId}_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: { format } }
    )
  }

  /**
   * Get department statistics
   */
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
    }>('/departments/stats', params)
    return this.extractData(response)
  }

  /**
   * Get department path (breadcrumb)
   */
  async getDepartmentPath(departmentId: string): Promise<Department[]> {
    const response = await this.get<Department[]>(`/departments/${departmentId}/path`)
    return this.extractData(response)
  }

  /**
   * Move department to different parent or business unit
   */
  async moveDepartment(
    departmentId: string,
    target: { business_unit_id?: string; parent_department_id?: string | null }
  ): Promise<Department> {
    const response = await this.patch<Department>(`/departments/${departmentId}/move`, target)
    return this.extractData(response)
  }

  /**
   * Validate department name uniqueness within business unit
   */
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

// Export singleton
export const departmentService = new DepartmentService()
