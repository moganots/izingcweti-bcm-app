// ============================================================
//  Compliance Components - Barrel Export
//  All compliance management components should be exported from here
// ============================================================

// ----- Core Components -----
export { default as ComplianceDashboard } from './ComplianceDashboard.vue'
export { default as ComplianceRecordList } from './ComplianceRecordList.vue'
export { default as ComplianceRecordForm } from './ComplianceRecordForm.vue'
export { default as ComplianceCard } from './ComplianceCard.vue'

// ----- Status & Badges -----
export { default as ComplianceStatusBadge } from './ComplianceStatusBadge.vue'
export { default as ComplianceStandardSelector } from './ComplianceStandardSelector.vue'

// ----- Analytics & Statistics -----
export { default as ComplianceStatsWidget } from './ComplianceStatsWidget.vue'
export { default as ComplianceStatsOverview } from './ComplianceStatsOverview.vue'
export { default as ComplianceStatusChart } from './ComplianceStatusChart.vue'
export { default as ComplianceStandardChart } from './ComplianceStandardChart.vue'

// ----- Audit & Evidence -----
export { default as ComplianceAuditHistory } from './ComplianceAuditHistory.vue'
export { default as ComplianceAuditTimeline } from './ComplianceAuditTimeline.vue'
export { default as ComplianceEvidenceList } from './ComplianceEvidenceList.vue'

// ----- Analysis -----
export { default as ComplianceGapAnalysis } from './ComplianceGapAnalysis.vue'

// ============================================================
//  Composables
//  Export shared compliance composable
// ============================================================

export { useCompliance } from './../../composables/useCompliance'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for compliance components
// ============================================================

export type {
    ComplianceRecord,
    CreateComplianceRecordRequest,
    UpdateComplianceRecordRequest,
    UpdateComplianceStatusRequest,
    AddEvidenceRequest,
    RemoveEvidenceRequest,
    ScheduleAuditRequest,
    BulkUpdateStatusRequest,
    ComplianceQueryParams,
    ComplianceStats,
    ComplianceSummary,
    ComplianceGap,
    ComplianceAuditEntry,
    ComplianceExportRequest,
    ComplianceVerificationResult,
    ComplianceReport,
} from './../../models/entities/compliance/compliance.entity'

// ============================================================
//  Constants Exports
//  Export shared constants for compliance
// ============================================================

export {
    ComplianceStandard,
    ComplianceStatus,
    COMPLIANCE_STANDARD_LABELS,
    COMPLIANCE_STANDARD_COLORS,
    COMPLIANCE_STATUS_LABELS,
    COMPLIANCE_STATUS_COLORS,
    COMPLIANCE_STATUS_PROGRESS,
    GAP_PRIORITY_LABELS,
    GAP_PRIORITY_COLORS,
    getComplianceStandardLabel,
    getComplianceStandardColor,
    getComplianceStatusLabel,
    getComplianceStatusColor,
    getComplianceStatusProgress,
    isAuditOverdue,
    isAuditDueSoon,
    calculateComplianceRate,
    formatComplianceStandard,
    getDaysUntilAudit,
} from './../../models/entities/compliance/compliance.entity'

// ============================================================
//  Default Export (for Vue Plugin)
// ============================================================

import type { App, Plugin } from 'vue'
import ComplianceDashboard from './ComplianceDashboard.vue'
import ComplianceRecordList from './ComplianceRecordList.vue'
import ComplianceRecordForm from './ComplianceRecordForm.vue'
import ComplianceCard from './ComplianceCard.vue'
import ComplianceStatusBadge from './ComplianceStatusBadge.vue'
import ComplianceStandardSelector from './ComplianceStandardSelector.vue'
import ComplianceStatsWidget from './ComplianceStatsWidget.vue'
import ComplianceStatsOverview from './ComplianceStatsOverview.vue'
import ComplianceStatusChart from './ComplianceStatusChart.vue'
import ComplianceStandardChart from './ComplianceStandardChart.vue'
import ComplianceAuditHistory from './ComplianceAuditHistory.vue'
import ComplianceAuditTimeline from './ComplianceAuditTimeline.vue'
import ComplianceEvidenceList from './ComplianceEvidenceList.vue'
import ComplianceGapAnalysis from './ComplianceGapAnalysis.vue'

export default {
    install(app: App) {
        app.component('ComplianceDashboard', ComplianceDashboard)
        app.component('ComplianceRecordList', ComplianceRecordList)
        app.component('ComplianceRecordForm', ComplianceRecordForm)
        app.component('ComplianceCard', ComplianceCard)
        app.component('ComplianceStatusBadge', ComplianceStatusBadge)
        app.component('ComplianceStandardSelector', ComplianceStandardSelector)
        app.component('ComplianceStatsWidget', ComplianceStatsWidget)
        app.component('ComplianceStatsOverview', ComplianceStatsOverview)
        app.component('ComplianceStatusChart', ComplianceStatusChart)
        app.component('ComplianceStandardChart', ComplianceStandardChart)
        app.component('ComplianceAuditHistory', ComplianceAuditHistory)
        app.component('ComplianceAuditTimeline', ComplianceAuditTimeline)
        app.component('ComplianceEvidenceList', ComplianceEvidenceList)
        app.component('ComplianceGapAnalysis', ComplianceGapAnalysis)
    },
} as Plugin