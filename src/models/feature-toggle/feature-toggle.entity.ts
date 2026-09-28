import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation } from "../organisation/organisation.entity";

// ============================================
// Feature Toggle Module - Enums (Aligned with Backend)
// ============================================

export enum FeatureToggleType {
  RELEASE = "Release",
  EXPERIMENT = "Experiment",
  OPERATIONAL = "Operational",
  PERMISSION = "Permission",
  KILL_SWITCH = "KillSwitch",
}

export enum FeatureToggleStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  ARCHIVED = "Archived",
  SCHEDULED = "Scheduled",
}

export enum ToggleEnvironment {
  DEVELOPMENT = "Development",
  STAGING = "Staging",
  INTEGRATION = "Integration",
  PRODUCTION = "Production",
  TESTING = "Testing",
}

export enum TargetingType {
  USER_ID = "UserId",
  ORGANISATION_ID = "OrganisationId",
  ROLE = "Role",
  PERCENTAGE = "Percentage",
  CUSTOM = "Custom",
  ALL_USERS = "AllUsers",
  CUSTOM_RULE = "CustomRule",
}

export enum FeatureToggleAuditAction {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED",
  DELETED = "DELETED",
  OVERRIDE_ADDED = "OVERRIDE_ADDED",
  OVERRIDE_REMOVED = "OVERRIDE_REMOVED",
  CREATE_OVERRIDEN = "CREATE_OVERRIDEN",
  DELETE_OVERRIDEN = "DELETE_OVERRIDEN",
  ACTIVATE_SCHEDULED = "ACTIVATE_SCHEDULED",
}

// ============================================
// Feature Toggle Entity - Aligned with Backend
// Backend: src/modules/feature-toggle/models/entities/feature-toggle.entity.ts
// ============================================

export interface TargetingCondition {
  operator:
  | "IN"
  | "NOT_IN"
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "CONTAINS";
  values: any[];
  customRule?: string;
}

export interface TargetingRule {
  id: string;
  type: TargetingType;
  condition: TargetingCondition;
  value: boolean;
  order: number;
}

export interface FeatureToggle extends BaseEntity {
  organisationId: string;
  name: string;
  description?: string;
  toggleType: FeatureToggleType;
  status: FeatureToggleStatus;
  environment: ToggleEnvironment;
  defaultValue: boolean;
  targetingRules?: TargetingRule[];
  metadata?: Record<string, any>;
  activatedAt?: Date;
  deactivatedAt?: Date;
  scheduledFor?: Date;
  evaluationCount: number;
  trueEvaluationCount: number;

  // Relationships
  organisation?: Organisation;
}

/**
 * Feature Toggle Override Entity
 * Backend: src/modules/feature-toggle/models/entities/feature-toggle-override.entity.ts
 */
export interface FeatureToggleOverride extends BaseEntity {
  organisationId: string;
  featureToggleId: string;
  overriddenBy?: string;
  value: boolean;
  expiresAt?: Date;
  reason?: string;

  // Relationships
  featureToggle?: FeatureToggle;
  overriddenByUser?: { uuid: string; email: string };
  organisation?: Organisation;
}

/**
 * Feature Toggle Audit Log Entity
 * Backend: src/modules/feature-toggle/models/entities/feature-toggle-audit-log.entity.ts
 */
export interface FeatureToggleAuditLog extends BaseEntity {
  featureToggleId: string;
  auditedBy: string;
  action: FeatureToggleAuditAction;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;

  // Relationships
  featureToggle?: FeatureToggle;
  auditedByUser?: { uuid: string; email: string };
}

// ============================================
// Feature Evaluation - Request/Response Types
// Backend: src/modules/feature-toggle/dto/evaluate-feature.dto.ts
// ============================================

/**
 * Request payload for evaluating a feature toggle
 */
export interface FeatureEvaluationRequest {
  featureName: string;
  organisationId: string;
  userId?: string;
  userRole?: string;
  attributes?: Record<string, any>;
}

/**
 * Response from a feature toggle evaluation
 * Backend: src/modules/feature-toggle/dto/feature-evaluation-response.dto.ts
 */
export interface FeatureEvaluationResponse {
  /** The name of the feature that was evaluated */
  featureName: string;

  /** Whether the feature is enabled for the given context */
  enabled: boolean;

  /** The reason for the evaluation result (e.g., "default", "targeting-rule", "override") */
  reason?: string;

  /** The variant/version identifier if applicable */
  variant?: string;

  /** The ID of the toggle that was evaluated */
  toggleId?: string;

  /** The matched targeting rule ID, if any */
  matchedRuleId?: string;

  /** The override ID if an override was applied */
  overrideId?: string;

  /** Additional metadata from the evaluation */
  metadata?: Record<string, any>;

  /** Timestamp of the evaluation */
  evaluatedAt?: string;
}

/**
 * Bulk feature evaluation request
 */
export interface BulkFeatureEvaluationRequest {
  features: FeatureEvaluationRequest[];
}

/**
 * Bulk feature evaluation response
 */
export interface BulkFeatureEvaluationResponse {
  results: FeatureEvaluationResponse[];
}

// ============================================
// Helper Functions
// ============================================

export function getFeatureToggleStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
    SCHEDULED: "Scheduled",
  };
  return labels[status] || status;
}

export function getFeatureToggleStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "grey",
    ACTIVE: "positive",
    INACTIVE: "warning",
    ARCHIVED: "grey",
    SCHEDULED: "info",
  };
  return colors[status] || "grey";
}

export function getFeatureToggleStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    DRAFT: "edit",
    ACTIVE: "check_circle",
    INACTIVE: "pause_circle",
    ARCHIVED: "archive",
    SCHEDULED: "event",
  };
  return icons[status] || "help";
}

export function getToggleEnvironmentLabel(environment: string): string {
  const labels: Record<string, string> = {
    DEVELOPMENT: "Development",
    STAGING: "Staging",
    PRODUCTION: "Production",
    TESTING: "Testing",
    INTEGRATION: "Integration",
  };
  return labels[environment] || environment;
}

export function getToggleEnvironmentColor(environment: string): string {
  const colors: Record<string, string> = {
    DEVELOPMENT: "blue",
    STAGING: "orange",
    PRODUCTION: "positive",
    TESTING: "purple",
    INTEGRATION: "teal",
  };
  return colors[environment] || "grey";
}

export function getFeatureToggleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    RELEASE: "Release Toggle",
    EXPERIMENT: "Experiment",
    OPERATIONAL: "Operational",
    PERMISSION: "Permission",
    KILL_SWITCH: "Kill Switch",
  };
  return labels[type] || type;
}

export function getTargetingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    USER_ID: "User ID",
    ORGANISATION_ID: "Organisation",
    ROLE: "Role",
    PERCENTAGE: "Percentage",
    CUSTOM: "Custom",
    ALL_USERS: "All Users",
    CUSTOM_RULE: "Custom Rule",
  };
  return labels[type] || type;
}

// ============================================
// Type Guards
// ============================================

export function isFeatureEnabled(result: FeatureEvaluationResponse | null): boolean {
  return result?.enabled === true;
}

export function isOverrideActive(override: FeatureToggleOverride): boolean {
  if (!override.expiresAt) return true;
  return new Date(override.expiresAt) > new Date();
}

export function isOverrideExpired(override: FeatureToggleOverride): boolean {
  if (!override.expiresAt) return false;
  return new Date(override.expiresAt) <= new Date();
}