import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Rule,
  RuleExecutionLog,
  CreateRuleDto,
  UpdateRuleDto,
  ExecuteRuleDto,
  RuleTestDto,
  RuleQueryDto,
  RuleStatsDto,
  RuleExecutionStatsDto,
  RuleExecutionSummaryDto,
  ExecutionLogQueryDto,
} from './../../models/entities/rules/rule.entity';
import { RuleStatus, RulePriority } from './../../models/entities/rules/rule.entity';
import { ruleService } from './../../services/api/rules/RuleService';
import { useAuthStore } from './../../stores/auth/auth.store';

export const useRuleStore = defineStore('rules', () => {
  // ============================================
  // Dependencies - Auth Integration
  // ============================================
  const auth = useAuthStore();
  const { isAuthenticated, isAdmin, isSuperAdmin, userOrganisationId } = auth;

  // ============================================
  // State - Rules
  // ============================================
  const rules = ref<Rule[]>([]);
  const selectedRule = ref<Rule | null>(null);
  const stats = ref<RuleStatsDto | null>(null);
  const executionStats = ref<RuleExecutionStatsDto | null>(null);
  const executionSummary = ref<RuleExecutionSummaryDto | null>(null);

  // ============================================
  // State - Execution Logs
  // ============================================
  const executionLogs = ref<RuleExecutionLog[]>([]);
  const selectedLog = ref<RuleExecutionLog | null>(null);

  // ============================================
  // State - UI
  // ============================================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isLoadingLogs = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const logsPagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const filters = ref<RuleQueryDto>({});

  // ============================================
  // Getters - Rule Groupings
  // ============================================

  const activeRules = computed(() =>
    rules.value.filter((r) => r.isActive && r.status === RuleStatus.ACTIVE)
  );

  const inactiveRules = computed(() =>
    rules.value.filter((r) => !r.isActive || r.status === RuleStatus.INACTIVE)
  );

  const draftRules = computed(() =>
    rules.value.filter((r) => r.status === RuleStatus.DRAFT)
  );

  const archivedRules = computed(() =>
    rules.value.filter((r) => r.status === RuleStatus.ARCHIVED)
  );

  const testingRules = computed(() =>
    rules.value.filter((r) => r.status === RuleStatus.TESTING)
  );

  // ============================================
  // Getters - Groupings
  // ============================================

  const rulesByType = computed(() => {
    const grouped: Record<string, Rule[]> = {};
    rules.value.forEach((r) => {
      const type = r.ruleType || 'Unknown';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(r);
    });
    return grouped;
  });

  const rulesByStatus = computed(() => {
    const grouped: Record<string, Rule[]> = {};
    rules.value.forEach((r) => {
      const status = r.status || 'Unknown';
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(r);
    });
    return grouped;
  });

  const rulesByPriority = computed(() => {
    const grouped: Record<string, Rule[]> = {};
    rules.value.forEach((r) => {
      const priority = r.priority || 'MEDIUM';
      if (!grouped[priority]) grouped[priority] = [];
      grouped[priority].push(r);
    });
    return grouped;
  });

  // ============================================
  // Getters - Aggregates
  // ============================================

  const totalRules = computed(() => rules.value.length);
  const totalActiveRules = computed(() => activeRules.value.length);
  const totalDraftRules = computed(() => draftRules.value.length);

  const successRate = computed(() => {
    if (!stats.value) return 0;
    return stats.value.successRate || 0;
  });

  const averageExecutionTime = computed(() => {
    if (!stats.value) return 0;
    return stats.value.averageExecutionTimeMs || 0;
  });

  const highPriorityRules = computed(() =>
    rules.value.filter((r) => r.priority === RulePriority.HIGH || r.priority === RulePriority.CRITICAL)
  );

  // ============================================
  // Auth Check Helpers
  // ============================================
  
  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      error.value = 'User not authenticated';
      return false;
    }
    return true;
  };

  const requireAdmin = (): boolean => {
    if (!requireAuth()) return false;
    if (!isAdmin && !isSuperAdmin) {
      error.value = 'Insufficient permissions: Administrator access required';
      return false;
    }
    return true;
  };

  // ============================================
  // Actions - CRUD
  // ============================================

  async function fetchRules(params?: RuleQueryDto) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        organisationId: params?.organisationId || userOrganisationId,
      };
      const response = await ruleService.getRules(queryParams);
      rules.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      if (params) filters.value = { ...filters.value, ...params };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch rules';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRuleById(uuid: string) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const rule = await ruleService.getRule(uuid);
      selectedRule.value = rule;
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch rule';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createRule(data: CreateRuleDto) {
    if (!requireAdmin()) return null;

    if (!data.organisationId) {
      data.organisationId = userOrganisationId || '';
    }

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.createRule(data);
      rules.value.unshift(rule);
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to create rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateRule(uuid: string, data: UpdateRuleDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.updateRule(uuid, data);
      const index = rules.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        rules.value[index] = rule;
      }
      if (selectedRule.value?.uuid === uuid) {
        selectedRule.value = rule;
      }
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to update rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteRule(uuid: string) {
    if (!requireAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await ruleService.deleteRule(uuid);
      rules.value = rules.value.filter((r) => r.uuid !== uuid);
      if (selectedRule.value?.uuid === uuid) {
        selectedRule.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Rule Lifecycle
  // ============================================

  async function activateRule(uuid: string) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.activateRule(uuid);
      updateLocalRule(uuid, rule);
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to activate rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deactivateRule(uuid: string) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.deactivateRule(uuid);
      updateLocalRule(uuid, rule);
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to deactivate rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function archiveRule(uuid: string) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.archiveRule(uuid);
      updateLocalRule(uuid, rule);
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to archive rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function duplicateRule(uuid: string) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.duplicateRule(uuid);
      rules.value.unshift(rule);
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to duplicate rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function restoreRuleVersion(uuid: string, versionNumber: number) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const rule = await ruleService.restoreRuleVersion(uuid, versionNumber);
      updateLocalRule(uuid, rule);
      return rule;
    } catch (err: any) {
      error.value = err.message || 'Failed to restore rule version';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Execution & Testing
  // ============================================

  async function executeRule(uuid: string, data: ExecuteRuleDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const result = await ruleService.executeRule(uuid, data);
      if (selectedRule.value?.uuid === uuid) {
        await fetchRuleById(uuid);
      }
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to execute rule';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function testRule(uuid: string, data: RuleTestDto) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      return await ruleService.testRule(uuid, data);
    } catch (err: any) {
      error.value = err.message || 'Failed to test rule';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function testRuleDefinition(data: {
    conditions: any[];
    actions: any[];
    testData: any;
  }) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      return await ruleService.testRuleDefinition(data);
    } catch (err: any) {
      error.value = err.message || 'Failed to test rule definition';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function validateRule(data: CreateRuleDto) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      return await ruleService.validateRule({ rule: data });
    } catch (err: any) {
      error.value = err.message || 'Failed to validate rule';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Actions - Statistics
  // ============================================

  async function fetchStats(organisationId?: string) {
    if (!requireAdmin()) return null;

    try {
      const statsData = await ruleService.getStats(organisationId || userOrganisationId);
      stats.value = statsData;
      return statsData;
    } catch (err: any) {
      console.error('Failed to fetch rule stats:', err);
      throw err;
    }
  }

  async function fetchExecutionStats(ruleId: string, days?: number) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const statsData = await ruleService.getExecutionStats(ruleId, days);
      executionStats.value = statsData;
      return statsData;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch execution stats';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchExecutionSummary(ruleId: string, days: number = 30) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const summary = await ruleService.getExecutionSummary(ruleId, days);
      executionSummary.value = summary;
      return summary;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch execution summary';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Actions - Execution Logs
  // ============================================

  async function fetchExecutionLogs(ruleId: string, params?: ExecutionLogQueryDto) {
    if (!requireAdmin()) return null;

    isLoadingLogs.value = true;
    error.value = null;
    try {
      const queryParams = {
        ...params,
        page: logsPagination.value.currentPage,
        limit: logsPagination.value.itemsPerPage,
      };
      const response = await ruleService.getExecutionLogs(ruleId, queryParams);
      executionLogs.value = response.data || [];
      logsPagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch execution logs';
      throw err;
    } finally {
      isLoadingLogs.value = false;
    }
  }

  async function fetchExecutionLogById(uuid: string) {
    if (!requireAdmin()) return null;

    isLoadingLogs.value = true;
    error.value = null;
    try {
      const log = await ruleService.getExecutionLog(uuid);
      selectedLog.value = log;
      return log;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch execution log';
      throw err;
    } finally {
      isLoadingLogs.value = false;
    }
  }

  async function cleanupExecutionLogs(days: number = 90) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const result = await ruleService.cleanupExecutionLogs(days);
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to cleanup execution logs';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteExecutionLog(uuid: string) {
    if (!requireAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await ruleService.deleteExecutionLog(uuid);
      executionLogs.value = executionLogs.value.filter((l) => l.uuid !== uuid);
      if (selectedLog.value?.uuid === uuid) {
        selectedLog.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete execution log';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Query Helpers
  // ============================================

  async function fetchActiveRules(organisationId?: string) {
    if (!requireAdmin()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const active = await ruleService.getActiveRules(organisationId || userOrganisationId);
      return active;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch active rules';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Utility Actions
  // ============================================

  function updateLocalRule(uuid: string, updated: Rule): void {
    const index = rules.value.findIndex((r) => r.uuid === uuid);
    if (index !== -1) {
      rules.value[index] = updated;
    }
    if (selectedRule.value?.uuid === uuid) {
      selectedRule.value = updated;
    }
  }

  function clearError() {
    error.value = null;
  }

  function clearSelection() {
    selectedRule.value = null;
    selectedLog.value = null;
  }

  function resetState() {
    rules.value = [];
    selectedRule.value = null;
    stats.value = null;
    executionStats.value = null;
    executionSummary.value = null;
    executionLogs.value = [];
    selectedLog.value = null;
    isLoading.value = false;
    isSaving.value = false;
    isLoadingLogs.value = false;
    error.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
    };
    logsPagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
    };
    filters.value = {};
  }

  return {
    // State
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
    filters,

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

    // Auth Helpers
    requireAuth,
    requireAdmin,

    // CRUD Actions
    fetchRules,
    fetchRuleById,
    createRule,
    updateRule,
    deleteRule,

    // Lifecycle Actions
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
    fetchStats,
    fetchExecutionStats,
    fetchExecutionSummary,

    // Execution Logs
    fetchExecutionLogs,
    fetchExecutionLogById,
    cleanupExecutionLogs,
    deleteExecutionLog,

    // Query Helpers
    fetchActiveRules,

    // Utility
    clearError,
    clearSelection,
    resetState,
  };
});