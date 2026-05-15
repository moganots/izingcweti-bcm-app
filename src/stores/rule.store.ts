import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { rulesService } from '../services/api/RulesService'
import type { Rule } from '../models/entities/rules.entity'

export const useRulesStore = defineStore('rules', () => {
  // State
  const rules = ref<Rule[]>([])
  const selectedRule = ref<Rule | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // Getters
  const activeRules = computed(() => rules.value.filter((r) => r.status === 'ACTIVE'))
  const draftRules = computed(() => rules.value.filter((r) => r.status === 'DRAFT'))
  const inactiveRules = computed(() => rules.value.filter((r) => r.status === 'INACTIVE'))

  // Actions
  async function loadRules(filters?: any): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await rulesService.getRules({ ...filters, page: currentPage.value })
      rules.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      error.value = err.message || 'Failed to load rules'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRule(id: string): Promise<void> {
    isLoading.value = true
    try {
      selectedRule.value = await rulesService.getRule(id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createRule(data: any): Promise<Rule> {
    isSaving.value = true
    try {
      const created = await rulesService.createRule(data)
      rules.value.unshift(created)
      return created
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateRule(id: string, data: any): Promise<Rule> {
    isSaving.value = true
    try {
      const updated = await rulesService.updateRule(id, data)
      const index = rules.value.findIndex((r) => r.uuid === id)
      if (index !== -1) rules.value[index] = updated
      if (selectedRule.value?.uuid === id) selectedRule.value = updated
      return updated
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteRule(id: string): Promise<void> {
    isSaving.value = true
    try {
      await rulesService.deleteRule(id)
      rules.value = rules.value.filter((r) => r.uuid !== id)
      if (selectedRule.value?.uuid === id) selectedRule.value = null
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function activateRule(id: string): Promise<Rule> {
    isSaving.value = true
    try {
      const updated = await rulesService.activateRule(id)
      return updateLocalRule(id, updated)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deactivateRule(id: string): Promise<Rule> {
    isSaving.value = true
    try {
      const updated = await rulesService.deactivateRule(id)
      return updateLocalRule(id, updated)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function duplicateRule(id: string, newName: string): Promise<Rule> {
    isSaving.value = true
    try {
      const duplicated = await rulesService.duplicateRule(id, newName)
      rules.value.unshift(duplicated)
      return duplicated
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function testRule(data: any): Promise<any> {
    try {
      return await rulesService.testRule(data)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  function updateLocalRule(id: string, updated: Rule): Rule {
    const index = rules.value.findIndex((r) => r.uuid === id)
    if (index !== -1) rules.value[index] = updated
    if (selectedRule.value?.uuid === id) selectedRule.value = updated
    return updated
  }

  return {
    rules,
    selectedRule,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    activeRules,
    draftRules,
    inactiveRules,
    loadRules,
    loadRule,
    createRule,
    updateRule,
    deleteRule,
    activateRule,
    deactivateRule,
    duplicateRule,
    testRule,
  }
})
