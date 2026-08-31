import { BaseService } from '@/services/BaseService';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import type {
  Risk,
  CreateRiskDto,
  UpdateRiskDto,
  AssessRiskDto,
  ApproveRiskDto,
  AssignRiskDto,
  AddControlDto,
  RiskQueryDto,
  RiskStatsDto,
  RiskComprehensiveAnalytics,
  RiskMatrixData,
  RiskTrendData,
  RiskHeatmapData,
  PaginatedResult,
} from '@/types/risk';

export class RiskService extends BaseService {
  constructor() {
    super();
  }

  // ============================================
  // CRUD Operations
  // ============================================

  async getRisks(params?: RiskQueryDto): Promise<PaginatedResult<Risk>> {
    return this.getPaginated<Risk>(
      API_ENDPOINTS.RISKS.BASE,
      params as Record<string, any>
    );
  }

  async getRisk(uuid: string): Promise<Risk> {
    const response = await this.get<Risk>(API_ENDPOINTS.RISKS.BY_ID(uuid));
    return this.extractData(response);
  }

  async createRisk(data: CreateRiskDto): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.BASE, data);
    return this.extractData(response);
  }

  async updateRisk(uuid: string, data: UpdateRiskDto): Promise<Risk> {
    const response = await this.put<Risk>(API_ENDPOINTS.RISKS.BY_ID(uuid), data);
    return this.extractData(response);
  }

  async deleteRisk(uuid: string): Promise<void> {
    await this.delete(API_ENDPOINTS.RISKS.BY_ID(uuid));
  }

  // ============================================
  // Risk Actions
  // ============================================

  async assessRisk(uuid: string, data: AssessRiskDto): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.ASSESS(uuid), data);
    return this.extractData(response);
  }

  async approveRisk(uuid: string, data: ApproveRiskDto): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.APPROVE(uuid), data);
    return this.extractData(response);
  }

  async assignRisk(uuid: string, data: AssignRiskDto): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.ASSIGN(uuid), data);
    return this.extractData(response);
  }

  async closeRisk(uuid: string): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.CLOSE(uuid));
    return this.extractData(response);
  }

  // ============================================
  // Control Operations
  // ============================================

  async addControl(uuid: string, data: AddControlDto): Promise<Risk> {
    const response = await this.post<Risk>(API_ENDPOINTS.RISKS.CONTROLS(uuid), data);
    return this.extractData(response);
  }

  async removeControl(uuid: string, controlId: string): Promise<Risk> {
    const response = await this.delete<Risk>(API_ENDPOINTS.RISKS.CONTROL(uuid, controlId));
    return this.extractData(response);
  }

  // ============================================
  // Query Operations
  // ============================================

  async getHighRisks(organisationId?: string): Promise<Risk[]> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<Risk[]>(API_ENDPOINTS.RISKS.HIGH, params);
    return this.extractData(response);
  }

  async getMyAssignedRisks(): Promise<Risk[]> {
    const response = await this.get<Risk[]>(API_ENDPOINTS.RISKS.MY_ASSIGNED);
    return this.extractData(response);
  }

  async getOverdueReviews(organisationId?: string): Promise<Risk[]> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<Risk[]>(API_ENDPOINTS.RISKS.OVERDUE_REVIEWS, params);
    return this.extractData(response);
  }

  async getRisksByAssignee(userId: string, organisationId?: string): Promise<Risk[]> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<Risk[]>(`/risks/assignee/${userId}`, params);
    return this.extractData(response);
  }

  // ============================================
  // Statistics
  // ============================================

  async getStats(organisationId?: string): Promise<RiskStatsDto> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<RiskStatsDto>(
      API_ENDPOINTS.RISKS.STATISTICS,
      params
    );
    return this.extractData(response);
  }

  async getComprehensiveAnalytics(organisationId?: string): Promise<RiskComprehensiveAnalytics> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<RiskComprehensiveAnalytics>(
      '/risks/analytics/comprehensive',
      params
    );
    return this.extractData(response);
  }

  // ============================================
  // Matrix & Trends
  // ============================================

  async getRiskMatrix(organisationId?: string): Promise<number[][]> {
    const params = organisationId ? { organisationId } : undefined;
    const response = await this.get<number[][]>(API_ENDPOINTS.RISKS.MATRIX, params);
    return this.extractData(response);
  }

  async getOrganisationMatrix(organisationId: string): Promise<number[][]> {
    const response = await this.get<number[][]>(
      API_ENDPOINTS.RISKS.ORGANISATION_MATRIX(organisationId)
    );
    return this.extractData(response);
  }

  async getRiskTrends(organisationId?: string, from?: Date, to?: Date): Promise<RiskTrendData[]> {
    const params: any = {};
    if (organisationId) params.organisationId = organisationId;
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();
    const response = await this.get<RiskTrendData[]>(API_ENDPOINTS.RISKS.TRENDS, params);
    return this.extractData(response);
  }

  async getRiskHeatmap(organisationId: string): Promise<RiskHeatmapData> {
    const response = await this.get<RiskHeatmapData>(`/risks/${organisationId}/heatmap`);
    return this.extractData(response);
  }

  // ============================================
  // Export
  // ============================================

  async exportRisks(organisationId: string, format: 'csv' | 'json' = 'json'): Promise<Risk[]> {
    const response = await this.get<Risk[]>(
      API_ENDPOINTS.RISKS.ORGANISATION_EXPORT(organisationId),
      { format }
    );
    return this.extractData(response);
  }

  // ============================================
  // Utility
  // ============================================

  getRiskScoreLevel(score: number): string {
    if (score < 8) return 'LOW';
    if (score < 15) return 'MEDIUM';
    if (score < 20) return 'HIGH';
    return 'EXTREME';
  }

  getRiskColor(score: number): string {
    if (score < 8) return '#10B981';
    if (score < 15) return '#F59E0B';
    if (score < 20) return '#F97316';
    return '#EF4444';
  }
}

export const riskService = new RiskService();