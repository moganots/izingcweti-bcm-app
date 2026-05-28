import { BaseEntity } from '../../../core/base/base.entity'
import {
  FeatureToggleType,
  FeatureToggleStatus,
  ToggleEnvironment,
  TargetingType,
} from '../enums/feature-toggle.enum'

export interface TargetingRule {
  id: string
  type: TargetingType
  condition: TargetingCondition
  value: boolean
  order: number
}

export interface TargetingCondition {
  operator: 'IN' | 'NOT_IN' | 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS'
  values: any[]
  custom_rule?: string
}

export interface FeatureToggle extends BaseEntity {
  name: string
  description?: string
  toggle_type: FeatureToggleType
  status: FeatureToggleStatus
  environment: ToggleEnvironment
  default_value: boolean
  targeting_rules?: TargetingRule[]
  metadata?: Record<string, any>
  organisation_id: string
  activated_at?: string
  deactivated_at?: string
  scheduled_for?: string
  evaluation_count: number
  true_evaluation_count: number
}

export interface FeatureToggleOverride extends BaseEntity {
  feature_toggle_id: string
  overriden_by?: string
  organisation_id: string
  value: boolean
  expires_at?: string
  reason?: string
}

export interface CreateFeatureToggleRequest {
  name: string
  description?: string
  toggle_type: FeatureToggleType
  environment: ToggleEnvironment
  default_value: boolean
  targeting_rules?: TargetingRule[]
  metadata?: Record<string, any>
  organisation_id: string
  scheduled_for?: string
}

export interface EvaluateFeatureRequest {
  feature_name: string
  environment: ToggleEnvironment
  user_id?: string
  organisation_id?: string
  role?: string
  context?: Record<string, any>
}

export interface FeatureToggleEvaluation {
  feature_name: string
  enabled: boolean
  reason: string
  rule_matched?: string
  evaluated_at: string
  context: Record<string, any>
}

export interface BatchFeatureEvaluationRequest {
  features: string[]
  context: Record<string, any>
}

export interface BatchFeatureEvaluationResult {
  results: Record<string, FeatureToggleEvaluation>
  timestamp: string
}

export interface FeatureToggleAuditLog extends BaseEntity {
  feature_toggle_id: string
  action: string
  changed_by: string
  old_value?: any
  new_value?: any
  reason?: string
  ip_address?: string
  user_agent?: string
  changed_at: string
}

export interface FeatureToggleSchedule {
  feature_toggle_id: string
  action: 'ACTIVATE' | 'DEACTIVATE'
  scheduled_at: string
  status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED'
  executed_at?: string
  error_message?: string
  created_by: string
}

export interface FeatureToggleRollout {
  feature_toggle_id: string
  rollout_percentage: number
  current_percentage: number
  target_percentage: number
  increments: RolloutIncrement[]
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ROLLED_BACK'
  started_at: string
  completed_at?: string
}

export interface RolloutIncrement {
  percentage: number
  scheduled_at: string
  executed_at?: string
  status: 'PENDING' | 'EXECUTED' | 'FAILED'
}
