// src/services/organisation/organisation.service.ts
import { BaseService } from '@/services/BaseService';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import type {
  Organisation,
  CreateOrganisationDto,
  UpdateOrganisationDto,
  OrganisationStatsDto,
  OrganisationQueryParams,
  OrganisationHierarchy,
} from '@/types/organisation';
import type { PaginatedResult } from '@/types/common';

export class OrganisationService extends BaseService {
  constructor() {
    super();
  }

  async getOrganisations(params?: OrganisationQueryParams): Promise<PaginatedResult<Organisation>> {
    return this.getPaginated<Organisation>(
      API_ENDPOINTS.ORGANISATIONS.BASE,
      params as Record<string, any>
    );
  }

  async getOrganisation(uuid: string): Promise<Organisation> {
    const response = await this.get<Organisation>(API_ENDPOINTS.ORGANISATIONS.BY_ID(uuid));
    return this.extractData(response);
  }

  async createOrganisation(data: CreateOrganisationDto): Promise<Organisation> {
    const response = await this.post<Organisation>(API_ENDPOINTS.ORGANISATIONS.BASE, data);
    return this.extractData(response);
  }

  async updateOrganisation(uuid: string, data: UpdateOrganisationDto): Promise<Organisation> {
    const response = await this.put<Organisation>(API_ENDPOINTS.ORGANISATIONS.BY_ID(uuid), data);
    return this.extractData(response);
  }

  async deleteOrganisation(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.ORGANISATIONS.BY_ID(uuid));
  }

  async getStats(organisationId?: string): Promise<OrganisationStatsDto> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<OrganisationStatsDto>(
      API_ENDPOINTS.ORGANISATIONS.STATISTICS,
      params
    );
    return this.extractData(response);
  }

  async getOrganisationsByTenant(tenantId: string): Promise<Organisation[]> {
    const response = await this.get<Organisation[]>(
      API_ENDPOINTS.ORGANISATIONS.BY_TENANT(tenantId)
    );
    return this.extractData(response);
  }

  async getOrganisationsByIndustry(industryType: string): Promise<Organisation[]> {
    const response = await this.get<Organisation[]>(
      API_ENDPOINTS.ORGANISATIONS.BY_INDUSTRY(industryType)
    );
    return this.extractData(response);
  }

  async getOrganisationHierarchy(organisationId: string): Promise<OrganisationHierarchy> {
    const response = await this.get<OrganisationHierarchy>(
      `/organisations/hierarchy/${organisationId}`
    );
    return this.extractData(response);
  }

  async searchOrganisations(query: string, params?: OrganisationQueryParams): Promise<PaginatedResult<Organisation>> {
    return this.getOrganisations({ ...params, search: query });
  }
}

export const organisationService = new OrganisationService();