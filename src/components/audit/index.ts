// ============================================================
//  Audit Components - Barrel Export
//  All audit-related components should be exported from here
// ============================================================

// ----- Core Display Components -----
export { default as AuditLogCard } from './AuditLogCard.vue'
export { default as AuditTimeline } from './AuditTimeline.vue'

// ----- Filtering & Search -----
export { default as AuditFilterBar } from './AuditFilterBar.vue'
export { default as AuditSearchBar } from './AuditSearchBar.vue'

// ----- Analytics & Statistics -----
export { default as AuditStatsOverview } from './AuditStatsOverview.vue'

// ----- Dialogs & Modals -----
export { default as AuditExportDialog } from './AuditExportDialog.vue'

// ----- Settings & Configuration -----
export { default as AuditRetentionSettings } from './AuditRetentionSettings.vue'

// ============================================================
//  Type Exports
//  Export shared types/interfaces for audit components
// ============================================================

// export type { AuditLog, AuditFilter, AuditStats } from './types'

// ============================================================
//  Utility Exports (Optional)
//  Export any shared constants or utilities
// ============================================================

// export { AUDIT_CATEGORIES, AUDIT_SEVERITIES } from './constants'