export { useAuditStore } from './audit/audit.store'
export { useAuthStore } from './auth/auth.store'
export { useBcmStore } from './bcm/bcm.store'
export { useCacheStore } from './cache/cache.store'
export { useComplianceStore } from './compliance/compliance.store'
export { useDashboardStore } from './dashboard/dashboard.store'
export { useDocumentStore } from './documents/document.store'
export { useIncidentStore } from './incident/incident.store'
export { useBusinessUnitStore } from './organisation/business-unit.store'
export { useDepartmentStore } from './organisation/department.store'
export { useOrganisationStore } from './organisation/organisation.store'
export { useRiskStore } from './risk/risk.store'
export { useRulesStore } from './rules/rules.store'
export { useSettingsStore } from './settings/settings.store'
export { useSyncStore } from './sync/sync.store'
export { useUiStore } from './ui/ui.store'
export { useUserStore } from './user/user.store'
export { useWorkflowStore } from './workflow/workflow.store'
export { useNotificationStore } from './notification/notification.store'

// Default export for Quasar compatibility
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
