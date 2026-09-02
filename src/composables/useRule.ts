import { computed } from 'vue';
import { useAuth } from './useAuth';
import { useRuleStore } from './../stores/rules/rule.store';
import type {
  CreateRuleDto,
  UpdateRuleDto,
  RuleQueryDto,
  RuleTestDto,
  ExecuteRuleDto,
  ExecutionLogQueryDto,
} from './../models/entities/rules/rule.entity';

export function useRule() {
  const auth = useAuth();
  const store = useRuleStore();

  // ============================================
  // Auth State
  // ============================================
  const canManageRules = computed(() => 
    auth.isAdmin.value || auth.isSuperAdmin.value
  );

  // ============================================
  // Computed Properties (Delegated to Store)
  // ============================================
  const rules = computed(() => store.rules);
  const selectedRule = computed(() => store.selectedRule);
  const stats = computed(() => store.stats);
  const executionStats = computed(() => store.executionStats);
  const executionSummary = computed(() => store.executionSummary);
  const executionLogs = computed(() => store.executionLogs);
  const selectedLog = computed(() => store.selectedLog);
  const isLoading = computed(() => store.isLoading);
  const isSaving = computed(() => store.isSaving);
  const isLoadingLogs = computed(() => store.isLoadingLogs);
  const error = computed(() => store.error);
  const pagination = computed(() => store.pagination);
  const logsPagination = computed(() => store.logsPagination);

  // Getters
  const activeRules = computed(() => store.activeRules);
  const inactiveRules = computed(() => store.inactiveRules);
  const draftRules = computed(() => store.draftRules);
  const archivedRules = computed(() => store.archivedRules);
  const testingRules = computed(() => store.testingRules);
  const rulesByType = computed(() => store.rulesByType);
  const rulesByStatus = computed(() => store.rulesByStatus);
  const rulesByPriority = computed(() => store.rulesByPriority);
  const totalRules = computed(() => store.totalRules);
  const totalActiveRules = computed(() => store.totalActiveRules);
  const totalDraftRules = computed(() => store.totalDraftRules);
  const successRate = computed(() => store.successRate);
  const averageExecutionTime = computed(() => store.averageExecutionTime);
  const highPriorityRules = computed(() => store.highPriorityRules);

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Fetch all rules with pagination
   */
  async function getRules(params?: RuleQueryDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchRules(params);
  }

  /**
   * Get rule by ID
   */
  async function getRuleById(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchRuleById(uuid);
  }

  /**
   * Create a new rule
   */
  async function createRule(data: CreateRuleDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.createRule(data);
  }

  /**
   * Update an existing rule
   */
  async function updateRule(uuid: string, data: UpdateRuleDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.updateRule(uuid, data);
  }

  /**
   * Delete a rule
   */
  async function deleteRule(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return false;
    }
    await store.deleteRule(uuid);
    return true;
  }

  // ============================================
  // Workflow Operations
  // ============================================

  /**
   * Activate a rule
   */
  async function activateRule(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.activateRule(uuid);
  }

  /**
   * Deactivate a rule
   */
  async function deactivateRule(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.deactivateRule(uuid);
  }

  /**
   * Archive a rule
   */
  async function archiveRule(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.archiveRule(uuid);
  }

  /**
   * Duplicate a rule
   */
  async function duplicateRule(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.duplicateRule(uuid);
  }

  /**
   * Restore a rule version
   */
  async function restoreRuleVersion(uuid: string, versionNumber: number) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.restoreRuleVersion(uuid, versionNumber);
  }

  // ============================================
  // Execution & Testing
  // ============================================

  /**
   * Execute a rule
   */
  async function executeRule(uuid: string, data: ExecuteRuleDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.executeRule(uuid, data);
  }

  /**
   * Test a rule
   */
  async function testRule(uuid: string, data: RuleTestDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.testRule(uuid, data);
  }

  /**
   * Test a rule definition with sample data
   */
  async function testRuleDefinition(data: {
    conditions: any[];
    actions: any[];
    testData: any;
  }) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.testRuleDefinition(data);
  }

  /**
   * Validate a rule before saving
   */
  async function validateRule(data: CreateRuleDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.validateRule(data);
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get rule statistics
   */
  async function getStats(organisationId?: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchStats(organisationId);
  }

  /**
   * Get rule execution statistics
   */
  async function getExecutionStats(uuid: string, days?: number) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchExecutionStats(uuid, days);
  }

  /**
   * Get rule execution summary
   */
  async function getExecutionSummary(uuid: string, days: number = 30) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchExecutionSummary(uuid, days);
  }

  // ============================================
  // Execution Logs
  // ============================================

  /**
   * Get execution logs for a rule
   */
  async function getExecutionLogs(ruleId: string, params?: ExecutionLogQueryDto) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchExecutionLogs(ruleId, params);
  }

  /**
   * Get execution log by ID
   */
  async function getExecutionLogById(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.fetchExecutionLogById(uuid);
  }

  /**
   * Delete execution log
   */
  async function deleteExecutionLog(uuid: string) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return;
    }
    await store.deleteExecutionLog(uuid);
  }

  /**
   * Cleanup old execution logs
   */
  async function cleanupLogs(days: number = 90) {
    if (!canManageRules.value) {
      store.error = 'Insufficient permissions';
      return null;
    }
    return store.cleanupExecutionLogs(days);
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Clear error message
   */
  function clearError() {
    store.clearError();
  }

  /**
   * Clear selection
   */
  function clearSelection() {
    store.clearSelection();
  }

  /**
   * Reset state
   */
  function resetState() {
    store.resetState();
  }

  return {
    // Auth
    canManageRules,

    // State (readonly)
    rules,
    selectedRule,
    stats,
    executionStats,
    executionSummary,
    executionLogs,
    selectedLog,
    isLoading,
    isSaving,
    isLoadingLogs,
    error,
    pagination,
    logsPagination,

    // Getters
    activeRules,
    inactiveRules,
    draftRules,
    archivedRules,
    testingRules,
    rulesByType,
    rulesByStatus,
    rulesByPriority,
    totalRules,
    totalActiveRules,
    totalDraftRules,
    successRate,
    averageExecutionTime,
    highPriorityRules,

    // CRUD Operations
    getRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule,

    // Workflow Operations
    activateRule,
    deactivateRule,
    archiveRule,
    duplicateRule,
    restoreRuleVersion,

    // Execution & Testing
    executeRule,
    testRule,
    testRuleDefinition,
    validateRule,

    // Statistics
    getStats,
    getExecutionStats,
    getExecutionSummary,

    // Execution Logs
    getExecutionLogs,
    getExecutionLogById,
    deleteExecutionLog,
    cleanupLogs,

    // Utility
    clearError,
    clearSelection,
    resetState,
  };
}