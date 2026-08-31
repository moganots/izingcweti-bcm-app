// ============================================
// BCM Component Exports
// ============================================

// Existing components
export { default as CriticalFunctionsList } from './CriticalFunctionsList.vue'
export { default as CriticalFunctionForm } from './CriticalFunctionForm.vue'
export { default as BIAForm } from './BIAForm.vue'
export { default as BCPForm } from './BCPForm.vue'
export { default as RecoveryStrategyList } from './RecoveryStrategyList.vue'
export { default as ExerciseTestList } from './ExerciseTestList.vue'
export { default as ExerciseTestForm } from './ExerciseTestForm.vue'
export { default as BCPTemplateList } from './BCPTemplateList.vue'
export { default as BCMDashboard } from './BCMDashboard.vue'
export { default as BCPProgressChart } from './BCPProgressChart.vue'
export { default as MaturityGauge } from './MaturityGauge.vue'

// New composable
export { useBcm } from './../../composables/useBcm'