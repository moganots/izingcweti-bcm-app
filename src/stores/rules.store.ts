import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Rule, RuleExecutionLog, RuleStats } from '../models/entities/rules.entity'
import { rulesService } from '../services/api/RulesService'
import type { RuleQueryParams } from '../types/bcm.types'

export const useRulesStore = defineStore('rules', () => {
  // ============================================
  // State
  // ============================================
  const rules = ref<Rule[]>([])
  const selectedRule = ref<Rule | null>(null)
  const executionLogs = ref<RuleExecutionLog[]>([])
  const stats = ref<RuleStats | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isLoadingLogs = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const hasMoreLogs = ref(false)

  // ============================================
  // Getters
  // ============================================
  const activeRules = computed(() =>
    rules.value.filter((r) => r.status === 'ACTIVE' && r.is_active)
  )

  const inactiveRules = computed(() =>
    rules.value.filter((r) => r.status === 'INACTIVE' || !r.is_active)
  )

  const draftRules = computed(() => rules.value.filter((r) => r.status === 'DRAFT'))

  const testingRules = computed(() => rules.value.filter((r) => r.status === 'TESTING'))

  const deprecatedRules = computed(() => rules.value.filter((r) => r.status === 'DEPRECATED'))

  const rulesByType = computed(() => {
    const grouped: Record<string, Rule[]> = {}
    rules.value.forEach((r) => {
      const type = r.rule_type || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(r)
    })
    return grouped
  })

  const rulesByTrigger = computed(() => {
    const grouped: Record<string, Rule[]> = {}
    rules.value.forEach((r) => {
      const trigger = r.rule_trigger || 'Unknown'
      if (!grouped[trigger]) grouped[trigger] = []
      grouped[trigger].push(r)
    })
    return grouped
  })

  const rulesByEntityType = computed(() => {
    const grouped: Record<string, Rule[]> = {}
    rules.value.forEach((r) => {
      const entityType = r.entity_type || 'Unknown'
      if (!grouped[entityType]) grouped[entityType] = []
      grouped[entityType].push(r)
    })
    return grouped
  })

  const highPriorityRules = computed(() => rules.value.filter((r) => r.priority <= 2))

  const successRate = computed(() => {
    const total = rules.value.reduce((sum, r) => sum + (r.execution_count || 0), 0)
    const failures = rules.value.reduce((sum, r) => sum + (r.failure_count || 0), 0)
    if (total === 0) return 100
    return Math.round(((total - failures) / total) * 100)
  })

  const conditionCount = computed(() => selectedRule.value?.conditions?.length || 0)

  const actionCount = computed(() => selectedRule.value?.actions?.length || 0)

  // ============================================
  // Actions
  // ============================================

  /**
   * Load rules with optional filters
   */
  async function loadRules(filters?: RuleQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await rulesService.getRules({
        ...filters,
        page: currentPage.value,
      } as any)

      rules.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load rules:', err)
      error.value = err.message || 'Failed to load rules'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load a single rule by ID
   */
  async function loadRule(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedRule.value = await rulesService.getRule(id)
    } catch (err: any) {
      console.error('Failed to load rule:', err)
      error.value = err.message || 'Failed to load rule'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load rule statistics
   */
  async function loadStats(organisationId?: string): Promise<void> {
    try {
      const response = await rulesService.getStats(organisationId)
      stats.value = response
    } catch (err: any) {
      console.error('Failed to load rule stats:', err)
    }
  }

  /**
   * Create a new rule
   */
  async function createRule(data: Partial<Rule>): Promise<Rule> {
    isSaving.value = true
    error.value = null

    try {
      const created = await rulesService.createRule(data)
      rules.value.unshift(created)
      return created
    } catch (err: any) {
      console.error('Failed to create rule:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update a rule
   */
  async function updateRule(id: string, data: Partial<Rule>): Promise<Rule> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await rulesService.updateRule(id, data)
      const index = rules.value.findIndex((r) => r.uuid === id)
      if (index !== -1) {
        rules.value[index] = updated
      }
      if (selectedRule.value?.uuid === id) {
        selectedRule.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update rule:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete a rule
   */
  async function deleteRule(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await rulesService.deleteRule(id)
      rules.value = rules.value.filter((r) => r.uuid !== id)
      if (selectedRule.value?.uuid === id) {
        selectedRule.value = null
      }
    } catch (err: any) {
      console.error('Failed to delete rule:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Activate a rule
   */
  async function activateRule(id: string): Promise<Rule> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await rulesService.activateRule(id)
      updateLocalRule(id, updated)
      return updated
    } catch (err: any) {
      console.error('Failed to activate rule:', err)
      error.value = err.message || 'Failed to activate rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Deactivate a rule
   */
  async function deactivateRule(id: string): Promise<Rule> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await rulesService.deactivateRule(id)
      updateLocalRule(id, updated)
      return updated
    } catch (err: any) {
      console.error('Failed to deactivate rule:', err)
      error.value = err.message || 'Failed to deactivate rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Duplicate a rule
   */
  async function duplicateRule(id: string, newName: string): Promise<Rule> {
    isSaving.value = true
    error.value = null

    try {
      const duplicated = await rulesService.duplicateRule(id, newName)
      rules.value.unshift(duplicated)
      return duplicated
    } catch (err: any) {
      console.error('Failed to duplicate rule:', err)
      error.value = err.message || 'Failed to duplicate rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Test a rule
   */
  async function testRule(data: {
    conditions: any[]
    actions: any[]
    test_data: any
  }): Promise<any> {
    try {
      return await rulesService.testRule(data)
    } catch (err: any) {
      console.error('Failed to test rule:', err)
      error.value = err.message || 'Failed to test rule'
      throw err
    }
  }

  /**
   * Execute a rule manually
   */
  async function executeRule(
    id: string,
    data: { entity_id: string; entity_type: string; context_data?: any }
  ): Promise<RuleExecutionLog> {
    isSaving.value = true
    error.value = null

    try {
      const result = await rulesService.executeRule(id, data)
      if (selectedRule.value?.uuid === id) {
        await loadRule(id)
      }
      return result
    } catch (err: any) {
      console.error('Failed to execute rule:', err)
      error.value = err.message || 'Failed to execute rule'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Load execution logs for a rule
   */
  async function loadExecutionLogs(ruleId: string, page: number = 1): Promise<void> {
    isLoadingLogs.value = true
    error.value = null

    try {
      const response = await rulesService.getExecutionLogs(ruleId, {
        page,
        limit: 20,
      })
      executionLogs.value = response.data || []
      hasMoreLogs.value = (response.data || []).length === 20
    } catch (err: any) {
      console.error('Failed to load execution logs:', err)
      error.value = err.message || 'Failed to load execution logs'
    } finally {
      isLoadingLogs.value = false
    }
  }

  /**
   * Load more execution logs
   */
  async function loadMoreLogs(ruleId: string): Promise<void> {
    if (!hasMoreLogs.value || isLoadingLogs.value) return
    // Increment page and load
    const nextPage = Math.floor(executionLogs.value.length / 20) + 1
    await loadExecutionLogs(ruleId, nextPage)
  }

  /**
   * Get execution statistics for a rule
   */
  async function getExecutionStats(ruleId: string, days?: number): Promise<any> {
    try {
      return await rulesService.getExecutionStats(ruleId, days)
    } catch (err: any) {
      console.error('Failed to get execution stats:', err)
      return null
    }
  }

  /**
   * Set current page and reload
   */
  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadRules()
  }

  /**
   * Clear selected rule
   */
  function clearSelection(): void {
    selectedRule.value = null
    executionLogs.value = []
  }

  /**
   * Clear all rule data
   */
  function clearAll(): void {
    rules.value = []
    selectedRule.value = null
    executionLogs.value = []
    stats.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
    hasMoreLogs.value = false
  }

  // ============================================
  // Private Helpers
  // ============================================

  function updateLocalRule(id: string, updated: Rule): void {
    const index = rules.value.findIndex((r) => r.uuid === id)
    if (index !== -1) {
      rules.value[index] = updated
    }
    if (selectedRule.value?.uuid === id) {
      selectedRule.value = updated
    }
  }

  return {
    // State
    rules,
    selectedRule,
    executionLogs,
    stats,
    isLoading,
    isSaving,
    isLoadingLogs,
    error,
    currentPage,
    totalPages,
    totalItems,
    hasMoreLogs,
    // Getters
    activeRules,
    inactiveRules,
    draftRules,
    testingRules,
    deprecatedRules,
    rulesByType,
    rulesByTrigger,
    rulesByEntityType,
    highPriorityRules,
    successRate,
    conditionCount,
    actionCount,
    // Actions
    loadRules,
    loadRule,
    loadStats,
    createRule,
    updateRule,
    deleteRule,
    activateRule,
    deactivateRule,
    duplicateRule,
    testRule,
    executeRule,
    loadExecutionLogs,
    loadMoreLogs,
    getExecutionStats,
    setPage,
    clearSelection,
    clearAll,
  }
})
