// ============================================================
//  BCM Components - Barrel Export
//  All Business Continuity Management components
// ============================================================

// ----- Core Display Components (Cards) -----
export { default as BcpCard } from './BcpCard.vue'
export { default as CriticalFunctionCard } from './CriticalFunctionCard.vue'
export { default as RecoveryStrategyCard } from './RecoveryStrategyCard.vue'
export { default as ExerciseTestCard } from './ExerciseTestCard.vue'

// ----- Forms -----
export { default as CriticalFunctionForm } from './CriticalFunctionForm.vue'
export { default as BIAForm } from './BIAForm.vue'
export { default as BCPForm } from './BCPForm.vue'
export { default as ExerciseTestForm } from './ExerciseTestForm.vue'

// ----- Lists & Collections -----
export { default as CriticalFunctionsList } from './CriticalFunctionsList.vue'
export { default as RecoveryStrategyList } from './RecoveryStrategyList.vue'
export { default as ExerciseTestList } from './ExerciseTestList.vue'
export { default as BCPTemplateList } from './BCPTemplateList.vue'

// ----- Dashboard & Analytics -----
export { default as BCMDashboard } from './BCMDashboard.vue'
export { default as BcmProgressTracker } from './BcmProgressTracker.vue'
export { default as BCPProgressChart } from './BCPProgressChart.vue'
export { default as MaturityGauge } from './MaturityGauge.vue'

// ----- Summaries & Visualizations -----
export { default as BiaSummary } from './BiaSummary.vue'
export { default as RiskMatrix } from './RiskMatrix.vue'
export { default as ComplianceStatusChart } from './ComplianceStatusChart.vue'

// ============================================================
//  Composables
//  Export shared BCM composables
// ============================================================

export { useBcm } from './../../composables/useBcm'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for BCM components
// ============================================================

export type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  BCPTemplate,
  RecoveryStrategy,
  BCMLifecycleStatus,
  ExerciseTest,
} from './../../models/entities/bcm/bcm.entity.ts'