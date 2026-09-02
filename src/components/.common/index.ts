// ============================================================
//  UI Components - Barrel Export
//  All reusable UI components should be exported from here
// ============================================================

// ----- Feedback Components -----
export { default as ConfirmDialog } from './ConfirmDialog.vue'
export { default as LoadingSpinner } from './LoadingSpinner.vue'
export { default as SkeletonLoader } from './SkeletonLoader.vue'
export { default as EmptyState } from './EmptyState.vue'

// ----- Status & Connection -----
export { default as StatusBadge } from './StatusBadge.vue'
export { default as ConnectionStatus } from './ConnectionStatus.vue'
export { default as OfflineBanner } from './OfflineBanner.vue'

// ----- Form & Input -----
export { default as SearchBar } from './SearchBar.vue'
export { default as FileUploader } from './FileUploader.vue'

// ----- Navigation & Layout -----
export { default as PageHeader } from './PageHeader.vue'
export { default as LanguageSwitcher } from './LanguageSwitcher.vue'

// ============================================================
//  Type Exports (if needed)
//  Export any shared types/interfaces used by these components
// ============================================================

// export type { UploadFile } from './FileUploader.vue'
// export type { StatusBadgeType } from './StatusBadge.vue'