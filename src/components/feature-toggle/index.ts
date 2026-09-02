// ============================================================
//  Feature Toggle Components - Barrel Export
//  All feature toggle management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as FeatureToggleList } from './FeatureToggleList.vue'
export { default as FeatureToggleDetail } from './FeatureToggleDetail.vue'
export { default as FeatureToggleForm } from './FeatureToggleForm.vue'

// ----- Status & Badges -----
export { default as FeatureToggleStatusBadge } from './FeatureToggleStatusBadge.vue'

// ----- Override Management -----
export { default as FeatureToggleOverrideList } from './FeatureToggleOverrideList.vue'

// ----- Audit & Analytics -----
export { default as FeatureToggleAuditLog } from './FeatureToggleAuditLog.vue'
export { default as FeatureToggleStatsWidget } from './FeatureToggleStatsWidget.vue'

// ----- Evaluation -----
export { default as FeatureToggleEvaluator } from './FeatureToggleEvaluator.vue'

// ============================================================
//  Composables
//  Export shared feature toggle composable
// ============================================================

export { useFeatureToggle } from './../../composables/useFeatureToggle'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for feature toggle components
//  Aligned with feature-toggle.entity.ts
// ============================================================

export type {
  // Core Feature Toggle Entity
  FeatureToggle,
  FeatureToggleOverride,
  FeatureToggleAuditLog as FeatureToggleAuditLogType,
  
  // Rollout & Schedule
  FeatureToggleSchedule,
  FeatureToggleRollout,
  RolloutIncrement,
  
  // Targeting
  TargetingCondition,
  TargetingRule,
  
  // Request/Response DTOs
  CreateFeatureToggleRequest,
  UpdateFeatureToggleRequest,
  CreateFeatureToggleOverrideRequest,
  UpdateFeatureToggleOverrideRequest,
  EvaluateFeatureRequest,
  FeatureEvaluationResponse,
  BatchFeatureEvaluationRequest,
  BatchFeatureEvaluationResponse,
  FeatureToggleQueryParams,
  FeatureToggleStats,
  FeatureToggleAuditQueryParams,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for feature toggles
//  Aligned with feature-toggle.entity.ts
// ============================================================

export {
  FeatureToggleType,
  FeatureToggleStatus,
  ToggleEnvironment,
  TargetingType,
  getFeatureToggleStatusLabel,
  getFeatureToggleStatusColor,
  getFeatureToggleStatusIcon,
  getToggleEnvironmentLabel,
  getToggleEnvironmentColor,
  getFeatureToggleTypeLabel,
  getTargetingTypeLabel,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import FeatureToggleList from './FeatureToggleList.vue'
import FeatureToggleDetail from './FeatureToggleDetail.vue'
import FeatureToggleForm from './FeatureToggleForm.vue'
import FeatureToggleStatusBadge from './FeatureToggleStatusBadge.vue'
import FeatureToggleOverrideList from './FeatureToggleOverrideList.vue'
import FeatureToggleAuditLog from './FeatureToggleAuditLog.vue'
import FeatureToggleStatsWidget from './FeatureToggleStatsWidget.vue'
import FeatureToggleEvaluator from './FeatureToggleEvaluator.vue'

export default {
  install(app: App) {
    app.component('FeatureToggleList', FeatureToggleList)
    app.component('FeatureToggleDetail', FeatureToggleDetail)
    app.component('FeatureToggleForm', FeatureToggleForm)
    app.component('FeatureToggleStatusBadge', FeatureToggleStatusBadge)
    app.component('FeatureToggleOverrideList', FeatureToggleOverrideList)
    app.component('FeatureToggleAuditLog', FeatureToggleAuditLog)
    app.component('FeatureToggleStatsWidget', FeatureToggleStatsWidget)
    app.component('FeatureToggleEvaluator', FeatureToggleEvaluator)
  },
} as Plugin