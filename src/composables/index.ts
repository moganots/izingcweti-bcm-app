/**
 * Composables Barrel
 * ---------------------------------------------------------------------
 * Re-exports every public composable in `src/composables`.
 *
 * Conventions
 * -----------
 * - Only the **named** export of each composable is re-exported here.
 *   Files also ship a `export default useX` for legacy convenience,
 *   but the barrel always uses the named form.
 * - Type-only exports use `export type` (required by `isolatedModules`).
 * - Sub-composables returned *inside* a composable (e.g.
 *   `useNotifications().useNotificationCounts`) are intentionally NOT
 *   listed here — they are instance-scoped factory functions, not
 *   standalone composables.
 *
 * Groups
 * ------
 *   Core / primitives  → useApi, useDebounce, useForm,
 *                        useInfiniteScroll, usePagination
 *   Auth               → useAuth, usePermissions
 *   Cross-cutting      → useNetwork, useOffline, useSync, useUi
 *   Domain             → useBcm, useCompliance, useDashboard,
 *                        useDocument, useFeatureToggle, useGovernance,
 *                        useLesson, useNotifications, useOrganisation,
 *                        useReport, useRisk, useRule, useTraining,
 *                        useWorkflow
 *   Utility            → useCache
 */

// ============================================
// Core / Primitives
// ============================================
export { useApi } from './useApi'
export { useDebounce } from './useDebounce'
export { useForm } from './useForm'
export type { FormErrors } from './useForm'
export { useInfiniteScroll } from './useInfiniteScroll'
export { usePagination } from './usePagination'

// ============================================
// Authentication & Authorization
// ============================================
export { useAuth } from './useAuth'
export type { UseAuthOptions } from './useAuth'
export { usePermissions } from './usePermissions'

// ============================================
// Network / Offline / Sync / UI (cross-cutting)
// ============================================
export { useNetwork } from './useNetwork'
export type { UseNetworkOptions } from './useNetwork'

export { useOffline } from './useOffline'

export { useSync } from './useSync'
export type { UseSyncOptions } from './useSync'

export { useUi, getUi } from './useUi'
export type { UseUiOptions } from './useUi'

// ============================================
// Domain Composables
// ============================================
export { useBcm } from './useBcm'
export type { UseBcmOptions } from './useBcm'

export { useCompliance } from './useCompliance'
export type { UseComplianceOptions } from './useCompliance'

export { useDashboard } from './useDashboard'
export type { UseDashboardOptions } from './useDashboard'

export { useDocument } from './useDocument'
export type { UseDocumentOptions } from './useDocument'

export { useFeatureToggle } from './useFeatureToggle'
export type { UseFeatureToggleOptions } from './useFeatureToggle'

export { useGovernance } from './useGovernance'
export type { UseGovernanceOptions } from './useGovernance'

export { useLesson } from './useLesson'
export type { UseLessonOptions } from './useLesson'

export { useNotifications } from './useNotifications'

export { useOrganisation } from './useOrganisation'

export { useReport } from './useReport'
export type { UseReportOptions } from './useReport'

export { useRisk } from './useRisk'

export { useRule } from './useRule'

export { useTraining } from './useTraining'
export type { UseTrainingOptions } from './useTraining'

export { useWorkflow } from './useWorkflow'

// ============================================
// Utility
// ============================================
export { useCache } from './useCache'
export type { UseCacheOptions } from './useCache'