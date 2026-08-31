// src/services/organisation/department.service.ts
import { BaseService } from '@/services/BaseService';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import type {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  ReorderDepartmentsDto,
  DepartmentQueryParams,
  DepartmentStatsDto,
  DepartmentTreeNode,
} from '@/types/organisation';
import type { PaginatedResult } from '@/types/common';

export class DepartmentService extends BaseService {
  constructor() {
    super();
  }

  async getDepartments(params?: DepartmentQueryParams): Promise<PaginatedResult<Department>> {
    return this.getPaginated<Department>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      params as Record<string, any>
    );
  }

  async getDepartment(uuid: string): Promise<Department> {
    const response = await this.get<Department>(API_ENDPOINTS.DEPARTMENTS.BY_ID(uuid));
    return this.extractData(response);
  }

  async getDepartmentsByBusinessUnit(
    businessUnitId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResult<Department>> {
    return this.getPaginated<Department>(
      API_ENDPOINTS.DEPARTMENTS.BY_BUSINESS_UNIT(businessUnitId),
      params as Record<string, any>
    );
  }

  async getSubDepartments(
    parentDepartmentId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResult<Department>> {
    return this.getPaginated<Department>(
      API_ENDPOINTS.DEPARTMENTS.SUB_DEPARTMENTS(parentDepartmentId),
      params as Record<string, any>
    );
  }

  async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    const response = await this.post<Department>(API_ENDPOINTS.DEPARTMENTS.BASE, data);
    return this.extractData(response);
  }

  async updateDepartment(uuid: string, data: UpdateDepartmentDto): Promise<Department> {
    const response = await this.put<Department>(API_ENDPOINTS.DEPARTMENTS.BY_ID(uuid), data);
    return this.extractData(response);
  }

  async deleteDepartment(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.DEPARTMENTS.BY_ID(uuid));
  }

  async getStats(businessUnitId?: string): Promise<DepartmentStatsDto> {
    const params = businessUnitId ? { businessUnitId } : undefined;
    const response = await this.get<DepartmentStatsDto>(
      API_ENDPOINTS.DEPARTMENTS.STATISTICS,
      params
    );
    return this.extractData(response);
  }

  async getDepartmentTree(businessUnitId: string): Promise<DepartmentTreeNode[]> {
    const response = await this.get<DepartmentTreeNode[]>(
      API_ENDPOINTS.DEPARTMENTS.TREE(businessUnitId)
    );
    return this.extractData(response);
  }

  async reorderDepartments(departmentIds: string[]): Promise<void> {
    await this.post(API_ENDPOINTS.DEPARTMENTS.REORDER, { departmentIds });
  }

  async searchDepartments(query: string, businessUnitId?: string): Promise<PaginatedResult<Department>> {
    const params: DepartmentQueryParams = { search: query };
    if (businessUnitId) params.businessUnitId = businessUnitId;
    return this.getDepartments(params);
  }
}

export const departmentService = new DepartmentService();