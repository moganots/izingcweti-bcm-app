import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRuleStore } from '../stores/rule/rule.store'
import { useAuth } from './useAuth'

/**
 * Rule composable
 * Aligned with useRuleStore
 */
export function useRule() {
  const auth = useAuth()
  const store = useRuleStore()

  const canManageRules = computed(
    () => auth.isAdmin.value || auth.isSuperAdmin.value
  )

  const {
    rules,
    executionLogs,
    selectedRule,
    isLoading,
    isSaving,
    error,
    activeRules,
    inactiveRules,
    draftRules,
    archivedRules,
    rulesByType,
    rulesByStatus,
    successRate,
  } = storeToRefs(store)

  return {
    // Auth
    canManageRules,

    // State
    rules,
    executionLogs,
    selectedRule,
    isLoading,
    isSaving,
    error,

    // Getters
    activeRules,
    inactiveRules,
    draftRules,
    archivedRules,
    rulesByType,
    rulesByStatus,
    successRate,

    // Actions
    initialize: store.initialize,
    activateRule: store.activateRule,
    deactivateRule: store.deactivateRule,
    archiveRule: store.archiveRule,
    executeRule: store.executeRule,
    getExecutionLogsForRule: store.getExecutionLogsForRule,

    // Sub-stores
    ruleStore: store.ruleStore,
    logStore: store.logStore,
  }
}

export default useRule