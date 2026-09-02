import type { BaseEntity } from './../../../core/base/base.entity';

export enum IndustryType {
  FINANCE = 'FINANCE',
  HEALTHCARE = 'HEALTHCARE',
  TECH = 'TECH',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export enum MaturityScore {
  INITIAL = 'INITIAL',
  REPEATABLE = 'REPEATABLE',
  DEFINED = 'DEFINED',
  QUANTITATIVELY_MANAGED = 'QUANTITATIVELY_MANAGED',
  OPTIMIZING = 'OPTIMIZING',
}

export enum CriticalityScore {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  IMPORTANT = 'IMPORTANT',
  NORMAL = 'NORMAL',
  NON_ESSENTIAL = 'NON_ESSENTIAL',
}

// ============================================
// Organisation Entities (camelCase aligned with backend)
// ============================================

export interface Organisation extends BaseEntity {
  tenantId: string;
  name: string;
  description?: string;
  industryType: IndustryType;
  bcmPolicyVersion?: string;
  maturityScore?: MaturityScore;
  employeeCount?: number;
  annualRevenue?: number;
  region?: string;
  isActive: boolean;
  lastAssessmentDate?: Date;
  nextAssessmentDate?: Date;
}

export interface BusinessUnit extends BaseEntity {
  organisationId: string;
  name: string;
  description?: string;
  criticalityScore: CriticalityScore;
  headUserId?: string;
  isActive: boolean;
  employeeCount?: number;
  budget?: number;
}

export interface Department extends BaseEntity {
  businessUnitId: string;
  parentDepartmentId?: string;
  name: string;
  description?: string;
  recoveryTimeObjectiveHours?: number;
  recoveryPointObjectiveHours?: number;
  order: number;
  isActive: boolean;
  employeeCount?: number;
  budget?: number;
}

// ============================================
// DTOs - Organisation (camelCase aligned with backend)
// ============================================

export interface OrganisationDto extends BaseEntity {
  name: string;
  tenantId: string;
  industryType: IndustryType;
  bcmPolicyVersion?: string;
  maturityScore?: MaturityScore;
}

export interface CreateOrganisationDto {
  name: string;
  tenantId: string;
  industryType: IndustryType;
  bcmPolicyVersion?: string;
  maturityScore?: MaturityScore;
}

export interface UpdateOrganisationDto {
  name?: string;
  industryType?: IndustryType;
  bcmPolicyVersion?: string;
  maturityScore?: MaturityScore;
}

export interface OrganisationStatsDto {
  totalOrganisations: number;
  byIndustry: Record<string, number>;
  byMaturity: Record<string, number>;
  totalBusinessUnits: number;
  totalDepartments: number;
  totalUsers: number;
}

// ============================================
// DTOs - Business Unit (camelCase aligned with backend)
// ============================================

export interface BusinessUnitDto extends BaseEntity {
  name: string;
  criticalityScore: CriticalityScore;
  organisationId: string;
  headUserId?: string;
}

export interface CreateBusinessUnitDto {
  name: string;
  criticalityScore: CriticalityScore;
  organisationId: string;
  headUserId?: string;
}

export interface UpdateBusinessUnitDto {
  name?: string;
  criticalityScore?: CriticalityScore;
  headUserId?: string;
}

export interface BusinessUnitStatsDto {
  total: number;
  active: number;
  byCriticality: Record<string, number>;
  totalDepartments: number;
  totalEmployees: number;
}

// ============================================
// DTOs - Department (camelCase aligned with backend)
// ============================================

export interface DepartmentDto extends BaseEntity {
  name: string;
  description?: string;
  businessUnitId: string;
  recoveryTimeObjectiveHours?: number;
  recoveryPointObjectiveHours?: number;
  order: number;
  parentDepartmentId?: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  businessUnitId: string;
  recoveryTimeObjectiveHours?: number;
  recoveryPointObjectiveHours?: number;
  parentDepartmentId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  businessUnitId?: string;
  recoveryTimeObjectiveHours?: number;
  recoveryPointObjectiveHours?: number;
  parentDepartmentId?: string;
}

export interface ReorderDepartmentsDto {
  departmentIds: string[];
}

export interface DepartmentStatsDto {
  total: number;
  active: number;
  withRTO: number;
  withRPO: number;
  totalEmployees: number;
}

// ============================================
// Query Params (camelCase aligned with backend)
// ============================================

export interface OrganisationQueryParams {
  tenantId?: string;
  industryType?: IndustryType;
  maturityScore?: MaturityScore;
  page?: number;
  limit?: number;
  search?: string;
}

export interface BusinessUnitQueryParams {
  organisationId?: string;
  criticalityScore?: CriticalityScore;
  headUserId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface DepartmentQueryParams {
  businessUnitId?: string;
  parentDepartmentId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// ============================================
// Tree/Structure Types
// ============================================

export interface DepartmentTreeNode {
  uuid: string;
  name: string;
  description?: string;
  order: number;
  recoveryTimeObjectiveHours?: number;
  recoveryPointObjectiveHours?: number;
  children: DepartmentTreeNode[];
}

export interface OrganisationHierarchy {
  organisation: Organisation;
  businessUnits: Array<{
    businessUnit: BusinessUnit;
    departments: Department[];
  }>;
}

export interface OrganisationTree {
  uuid: string;
  name: string;
  type: 'organisation';
  children: Array<{
    uuid: string;
    name: string;
    type: 'business_unit';
    criticality: string;
    children: Array<{
      uuid: string;
      name: string;
      type: 'department';
      rto?: number;
      rpo?: number;
    }>;
  }>;
}