import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Rule, RuleExecutionLog } from '../../models/rule/rule.entity'
import { RuleStatus } from '../../models/rule/rule.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { ruleService } from '../../services/api/rules/RuleService'

export const useRuleItemStore = createOfflineCrudStore<Rule>({
  storeId: 'rules',
  tableName: 'rules',
})

export const useRuleExecutionLogStore = createOfflineCrudStore<RuleExecutionLog>({
  storeId: 'rule-execution-logs',
  tableName: 'ruleExecutionLogs',
})

export const useRuleStore = defineStore('rules', () => {
  const ruleStore = useRuleItemStore()
  const logStore = useRuleExecutionLogStore()
  const isSaving = ref(false)

  const rules = ruleStore.items
  const executionLogs = logStore.items

  // ============================================
  // Getters
  // ============================================
  const activeRules = computed(() =>
    rules?.filter((r) => r.isActive && r.status === RuleStatus.ACTIVE)
  )

  const inactiveRules = computed(() =>
    rules?.filter((r) => !r.isActive || r.status === RuleStatus.INACTIVE)
  )

  const draftRules = computed(() => rules?.filter((r) => r.status === RuleStatus.DRAFT))

  const archivedRules = computed(() =>
    rules?.filter((r) => r.status === RuleStatus.ARCHIVED)
  )

  const rulesByType = computed(() => {
    const grouped: Record<string, Rule[]> = {}
    rules?.forEach((r) => {
      const type = r.ruleType || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(r)
    })
    return grouped
  })

  const rulesByStatus = computed(() => {
    const grouped: Record<string, Rule[]> = {}
    rules?.forEach((r) => {
      const status = r.status || 'Unknown'
      if (!grouped[status]) grouped[status] = []
      grouped[status].push(r)
    })
    return grouped
  })

  const successRate = computed(() => {
    const total = rules?.reduce((sum, r) => sum + (r.executionCount || 0), 0)
    const successes = rules?.reduce((sum, r) => sum + (r.successCount || 0), 0)
    if (total === 0) return 0
    return Math.round((successes / total) * 100)
  })

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await Promise.all([ruleStore.initialize(), logStore.initialize()])
  }

  async function activateRule(id: string): Promise<Rule | null> {
    return ruleStore.update(id, {
      isActive: true,
      status: RuleStatus.ACTIVE,
    } as Partial<Rule>)
  }

  async function deactivateRule(id: string): Promise<Rule | null> {
    return ruleStore.update(id, {
      isActive: false,
      status: RuleStatus.INACTIVE,
    } as Partial<Rule>)
  }

  async function archiveRule(id: string): Promise<Rule | null> {
    return ruleStore.update(id, {
      status: RuleStatus.ARCHIVED,
    } as Partial<Rule>)
  }

  async function executeRule(id: string, context?: Record<string, any>): Promise<RuleExecutionLog | null> {
    try {
      const result = await ruleService.executeRule(id, { context })
      await logStore.loadAll()
      return result
    } catch (err: any) {
      console.error('Failed to execute rule:', err)
      return null
    }
  }

  async function getExecutionLogsForRule(ruleId: string): Promise<RuleExecutionLog[]> {
    return executionLogs?.filter((l) => l.ruleId === ruleId)
  }

  return {
    // State
    rules,
    executionLogs,
    selectedRule: ruleStore.selected,
    isLoading: ruleStore.loading,
    isSaving,
    error: ruleStore.error,

    // Getters
    activeRules,
    inactiveRules,
    draftRules,
    archivedRules,
    rulesByType,
    rulesByStatus,
    successRate,

    // Actions
    initialize,
    activateRule,
    deactivateRule,
    archiveRule,
    executeRule,
    getExecutionLogsForRule,

    // Sub-stores
    ruleStore,
    logStore,
  }
})