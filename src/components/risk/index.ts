// ============================================================
//  Risk Components - Barrel Export
//  All risk management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as RiskList } from './RiskList.vue'
export { default as RiskDetail } from './RiskDetail.vue'
export { default as RiskCard } from './RiskCard.vue'

// ----- Forms & Dialogs -----
export { default as RiskAssessmentForm } from './RiskAssessmentForm.vue'
export { default as RiskControlsForm } from './RiskControlsForm.vue'
export { default as RiskReassessDialog } from './RiskReassessDialog.vue'

// ----- Analytics -----
export { default as RiskStatsOverview } from './RiskStatsOverview.vue'
export { default as RiskMatrix } from './RiskMatrix.vue'
export { default as RiskScoreGauge } from './RiskScoreGauge.vue'

// ----- Mitigation -----
export { default as MitigationControlsList } from './MitigationControlsList.vue'

// ============================================================
//  Composables
//  Export shared risk composable
// ============================================================

export { useRisk } from './../../composables/useRisk'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for risk components
//  Aligned with risk.entity.ts
// ============================================================

export type {
  // Core Risk Entity
  Risk,
  RiskDto,
  CreateRiskDto,
  UpdateRiskDto,
  AssessRiskDto,
  ApproveRiskDto,
  AssignRiskDto,
  AddControlDto,
  
  // Risk Components
  RiskSummary,
  RiskMatrixData,
  RiskHeatmapCell,
  RiskHeatmapData,
  RiskTrendData,
  RiskTrendAnalysis,
  
  // DTOs
  MitigatingControlDto,
  RiskFactorDto,
  ActionHistoryDto,
  
  // Stats
  RiskStatsDto,
  RiskComprehensiveAnalytics,
  
  // Query
  RiskQueryDto,
} from './../../models/entities/risk/risk.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for risk
//  Aligned with risk.entity.ts
// ============================================================

export {
  RiskCategory,
  RiskStatus,
  RiskTreatment,
  RiskLikelihoodLevel,
  RiskImpactLevel,
  RiskScoreLevel,
  getRiskScoreLevel,
  getRiskColor,
} from './../../models/entities/risk/risk.entity'

// ============================================================
//  Helper Functions
//  Export helper functions for risk
// ============================================================

export {
  getRiskCategoryLabel,
  getRiskCategoryColor,
  getRiskStatusLabel,
  getRiskStatusColor,
  getRiskTreatmentLabel,
  getRiskTreatmentColor,
  getRiskImpactLevelLabel,
  getRiskImpactLevelColor,
  getRiskLikelihoodLevelLabel,
  getRiskLikelihoodLevelColor,
  getRiskScoreLevelLabel,
  getRiskScoreLevelColor,
} from './../../models/entities/risk/risk.entity'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import RiskList from './RiskList.vue'
import RiskDetail from './RiskDetail.vue'
import RiskCard from './RiskCard.vue'
import RiskAssessmentForm from './RiskAssessmentForm.vue'
import RiskControlsForm from './RiskControlsForm.vue'
import RiskReassessDialog from './RiskReassessDialog.vue'
import RiskStatsOverview from './RiskStatsOverview.vue'
import RiskMatrix from './RiskMatrix.vue'
import RiskScoreGauge from './RiskScoreGauge.vue'
import MitigationControlsList from './MitigationControlsList.vue'

export default {
  install(app: App) {
    app.component('RiskList', RiskList)
    app.component('RiskDetail', RiskDetail)
    app.component('RiskCard', RiskCard)
    app.component('RiskAssessmentForm', RiskAssessmentForm)
    app.component('RiskControlsForm', RiskControlsForm)
    app.component('RiskReassessDialog', RiskReassessDialog)
    app.component('RiskStatsOverview', RiskStatsOverview)
    app.component('RiskMatrix', RiskMatrix)
    app.component('RiskScoreGauge', RiskScoreGauge)
    app.component('MitigationControlsList', MitigationControlsList)
  },
} as Plugin