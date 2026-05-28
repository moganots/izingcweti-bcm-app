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
