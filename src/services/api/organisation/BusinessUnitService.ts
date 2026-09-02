import { BaseService } from './../../BaseService';
import { API_ENDPOINTS } from './../../../core/constants/api.constants';
import type {
  BusinessUnit,
  CreateBusinessUnitDto,
  UpdateBusinessUnitDto,
  BusinessUnitQueryParams,
  BusinessUnitStatsDto,
} from './../../../models/entities/organisation/organisation.entity';
import { PaginatedResponse } from './../../../shared/types/common.types'

export class BusinessUnitService extends BaseService {
  constructor() {
    super();
  }

  async getBusinessUnits(params?: BusinessUnitQueryParams): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.BUSINESS_UNITS.BASE,
      params as Record<string, any>
    );
  }

  async getBusinessUnit(uuid: string): Promise<BusinessUnit> {
    const response = await this.get<BusinessUnit>(API_ENDPOINTS.BUSINESS_UNITS.BY_ID(uuid));
    return this.extractData(response);
  }

  async getBusinessUnitsByOrganisation(
    organisationId: string,
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.BUSINESS_UNITS.BY_ORGANISATION(organisationId),
      params as Record<string, any>
    );
  }

  async getBusinessUnitsByHeadUser(
    headUserId: string,
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.BUSINESS_UNITS.BY_HEAD_USER(headUserId),
      params as Record<string, any>
    );
  }

  async getBusinessUnitsByCriticality(
    criticalityScore: string,
    params?: BusinessUnitQueryParams
  ): Promise<PaginatedResponse<BusinessUnit>> {
    return this.getPaginated<BusinessUnit>(
      API_ENDPOINTS.BUSINESS_UNITS.BY_CRITICALITY(criticalityScore),
      params as Record<string, any>
    );
  }

  async createBusinessUnit(data: CreateBusinessUnitDto): Promise<BusinessUnit> {
    const response = await this.post<BusinessUnit>(API_ENDPOINTS.BUSINESS_UNITS.BASE, data);
    return this.extractData(response);
  }

  async updateBusinessUnit(uuid: string, data: UpdateBusinessUnitDto): Promise<BusinessUnit> {
    const response = await this.put<BusinessUnit>(API_ENDPOINTS.BUSINESS_UNITS.BY_ID(uuid), data);
    return this.extractData(response);
  }

  async deleteBusinessUnit(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.BUSINESS_UNITS.BY_ID(uuid));
  }

  async getStats(organisationId?: string): Promise<BusinessUnitStatsDto> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<BusinessUnitStatsDto>(
      API_ENDPOINTS.BUSINESS_UNITS.STATISTICS,
      params
    );
    return this.extractData(response);
  }

  async searchBusinessUnits(query: string, organisationId?: string): Promise<PaginatedResponse<BusinessUnit>> {
    const params: BusinessUnitQueryParams = { search: query };
    if (organisationId) params.organisationId = organisationId;
    return this.getBusinessUnits(params);
  }
}

export const businessUnitService = new BusinessUnitService();