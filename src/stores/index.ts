export { useAuthStore } from './auth.store'
export { useUiStore } from './ui.store'
export { useSyncStore } from './sync.store'
export { useNotificationStore } from './notification.store'
export { useBcmStore } from './bcm.store'
export { useRiskStore } from './risk.store'
export { useIncidentStore } from './incident.store'
export { useWorkflowStore } from './workflow.store'
export { useDashboardStore } from './dashboard.store'
export { useComplianceStore } from './compliance.store'
export { useAuditStore } from './audit.store'
export { useRulesStore } from './rules.store'
export { useUserStore } from './user.store'
export { useCacheStore } from './cache.store'
export { useDocumentStore } from './document.store'
export { useSettingsStore } from './settings.store'

// Default export for Quasar compatibility
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
