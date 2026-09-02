import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { riskService } from './../../services/api/risk/RiskService';
import { useAuth } from './../../composables/useAuth';
import type {
  Risk,
  CreateRiskDto,
  UpdateRiskDto,
  AssessRiskDto,
  ApproveRiskDto,
  AssignRiskDto,
  AddControlDto,
  RiskQueryDto,
  RiskStatsDto,
  RiskComprehensiveAnalytics,
} from './../../models/entities/risk/risk.entity';
import { RiskStatus } from './../../models/entities/risk/risk.entity';

export const useRiskStore = defineStore('risk', () => {
  // ============================================
  // Dependencies - Auth Integration
  // ============================================
  const auth = useAuth();
  const { isAuthenticated, isAdmin, isGlobalAdmin, userId, userOrganisationId } = auth;

  // ============================================
  // State
  // ============================================
  const risks = ref<Risk[]>([]);
  const selectedRisk = ref<Risk | null>(null);
  const stats = ref<RiskStatsDto | null>(null);
  const comprehensiveAnalytics = ref<RiskComprehensiveAnalytics | null>(null);
  const riskMatrix = ref<number[][] | null>(null);
  const riskTrends = ref<any[]>([]);

  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const filters = ref<RiskQueryDto>({});

  // ============================================
  // Getters
  // ============================================

  // Risk Level Groupings
  const criticalRisks = computed(() =>
    risks.value.filter((r) => (r.inherentRiskScore || 0) >= 20)
  );

  const highRisks = computed(() =>
    risks.value.filter((r) => (r.inherentRiskScore || 0) >= 15 && (r.inherentRiskScore || 0) < 20)
  );

  const mediumRisks = computed(() =>
    risks.value.filter((r) => (r.inherentRiskScore || 0) >= 8 && (r.inherentRiskScore || 0) < 15)
  );

  const lowRisks = computed(() =>
    risks.value.filter((r) => (r.inherentRiskScore || 0) < 8)
  );

  // Status Groupings
  const openRisks = computed(() =>
    risks.value.filter((r) => r.status !== RiskStatus.CLOSED)
  );

  const closedRisks = computed(() =>
    risks.value.filter((r) => r.status === RiskStatus.CLOSED)
  );

  const pendingApprovalRisks = computed(() =>
    risks.value.filter((r) => r.requiresApproval && !r.approvedBy)
  );

  const overdueReviewRisks = computed(() => {
    const now = new Date();
    return risks.value.filter(
      (r) =>
        r.reviewDate &&
        new Date(r.reviewDate) < now &&
        r.status !== RiskStatus.CLOSED
    );
  });

  const myAssignedRisks = computed(() =>
    risks.value.filter((r) => r.assignedTo === userId.value)
  );

  // Groupings
  const risksByCategory = computed(() => {
    const grouped: Record<string, Risk[]> = {};
    risks.value.forEach((r) => {
      const category = r.riskCategory || 'Unknown';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(r);
    });
    return grouped;
  });

  const risksByStatus = computed(() => {
    const grouped: Record<string, Risk[]> = {};
    risks.value.forEach((r) => {
      const status = r.status || 'Unknown';
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(r);
    });
    return grouped;
  });

  // Score Aggregates
  const averageInherentScore = computed(() => {
    if (risks.value.length === 0) return 0;
    const total = risks.value.reduce((sum, r) => sum + (r.inherentRiskScore || 0), 0);
    return Math.round((total / risks.value.length) * 100) / 100;
  });

  const averageResidualScore = computed(() => {
    const withResidual = risks.value.filter((r) => r.residualRiskScore !== undefined);
    if (withResidual.length === 0) return 0;
    const total = withResidual.reduce((sum, r) => sum + (r.residualRiskScore || 0), 0);
    return Math.round((total / withResidual.length) * 100) / 100;
  });

  const riskReduction = computed(() => {
    return Math.round((averageInherentScore.value - averageResidualScore.value) * 100) / 100;
  });

  const riskReductionPercentage = computed(() => {
    if (averageInherentScore.value === 0) return 0;
    return Math.round((riskReduction.value / averageInherentScore.value) * 100 * 100) / 100;
  });

  const hasCriticalRisks = computed(() => criticalRisks.value.length > 0);
  const hasHighRisks = computed(() => highRisks.value.length > 0);

  // ============================================
  // Auth Check Helpers
  // ============================================
  const requireAuth = (): boolean => {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated';
      return false;
    }
    return true;
  };

  const requireAdmin = (): boolean => {
    if (!requireAuth()) return false;
    if (!isAdmin.value && !isGlobalAdmin.value) {
      error.value = 'Insufficient permissions: Administrator access required';
      return false;
    }
    return true;
  };

  // ============================================
  // Actions - CRUD
  // ============================================

  async function fetchRisks(params?: RiskQueryDto) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        organisationId: params?.organisationId || userOrganisationId.value,
      };
      const response = await riskService.getRisks(queryParams);
      risks.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      if (params) filters.value = { ...filters.value, ...params };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch risks';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRiskById(uuid: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const risk = await riskService.getRisk(uuid);
      selectedRisk.value = risk;
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch risk';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createRisk(data: CreateRiskDto) {
    if (!requireAuth()) return null;

    // Ensure organisationId is set
    if (!data.organisationId) {
      data.organisationId = userOrganisationId.value || '';
    }

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.createRisk(data);
      risks.value.unshift(risk);
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to create risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateRisk(uuid: string, data: UpdateRiskDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.updateRisk(uuid, data);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to update risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteRisk(uuid: string) {
    if (!requireAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await riskService.deleteRisk(uuid);
      risks.value = risks.value.filter((r) => r.uuid !== uuid);
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Risk Operations
  // ============================================

  async function assessRisk(uuid: string, data: AssessRiskDto) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.assessRisk(uuid, data);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to assess risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function approveRisk(uuid: string, data: ApproveRiskDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.approveRisk(uuid, data);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to approve risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function assignRisk(uuid: string, data: AssignRiskDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.assignRisk(uuid, data);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to assign risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function closeRisk(uuid: string) {
    if (!requireAuth()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.closeRisk(uuid);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to close risk';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Control Operations
  // ============================================

  async function addControl(uuid: string, data: AddControlDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.addControl(uuid, data);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to add control';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function removeControl(uuid: string, controlId: string) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const risk = await riskService.removeControl(uuid, controlId);
      const index = risks.value.findIndex((r) => r.uuid === uuid);
      if (index !== -1) {
        risks.value[index] = risk;
      }
      if (selectedRisk.value?.uuid === uuid) {
        selectedRisk.value = risk;
      }
      return risk;
    } catch (err: any) {
      error.value = err.message || 'Failed to remove control';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  // ============================================
  // Actions - Statistics
  // ============================================

  async function fetchStats(organisationId?: string) {
    if (!requireAuth()) return null;

    try {
      const statsData = await riskService.getStats(organisationId || userOrganisationId.value);
      stats.value = statsData;
      return statsData;
    } catch (err: any) {
      console.error('Failed to fetch risk stats:', err);
      throw err;
    }
  }

  async function fetchComprehensiveAnalytics(organisationId?: string) {
    if (!requireAuth()) return null;

    try {
      const analytics = await riskService.getComprehensiveAnalytics(organisationId || userOrganisationId.value);
      comprehensiveAnalytics.value = analytics;
      return analytics;
    } catch (err: any) {
      console.error('Failed to fetch comprehensive analytics:', err);
      throw err;
    }
  }

  // ============================================
  // Actions - Matrix & Trends
  // ============================================

  async function fetchRiskMatrix(organisationId?: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const matrix = await riskService.getRiskMatrix(organisationId || userOrganisationId.value);
      riskMatrix.value = matrix;
      return matrix;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch risk matrix';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRiskTrends(organisationId?: string, from?: Date, to?: Date) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const trends = await riskService.getRiskTrends(organisationId || userOrganisationId.value, from, to);
      riskTrends.value = trends;
      return trends;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch risk trends';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Actions - Query Helpers
  // ============================================

  async function fetchHighRisks(organisationId?: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const highRisks = await riskService.getHighRisks(organisationId || userOrganisationId.value);
      return highRisks;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch high risks';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyAssignedRisks() {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const assigned = await riskService.getMyAssignedRisks();
      return assigned;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch assigned risks';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOverdueReviews(organisationId?: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const overdue = await riskService.getOverdueReviews(organisationId || userOrganisationId.value);
      return overdue;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch overdue reviews';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Utility Actions
  // ============================================

  function clearError() {
    error.value = null;
  }

  function clearSelection() {
    selectedRisk.value = null;
  }

  function resetState() {
    risks.value = [];
    selectedRisk.value = null;
    stats.value = null;
    comprehensiveAnalytics.value = null;
    riskMatrix.value = null;
    riskTrends.value = [];
    isLoading.value = false;
    isSaving.value = false;
    error.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
    };
    filters.value = {};
  }

  return {
    // State
    risks,
    selectedRisk,
    stats,
    comprehensiveAnalytics,
    riskMatrix,
    riskTrends,
    isLoading,
    isSaving,
    error,
    pagination,
    filters,

    // Getters
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    openRisks,
    closedRisks,
    pendingApprovalRisks,
    overdueReviewRisks,
    myAssignedRisks,
    risksByCategory,
    risksByStatus,
    averageInherentScore,
    averageResidualScore,
    riskReduction,
    riskReductionPercentage,
    hasCriticalRisks,
    hasHighRisks,

    // Auth Helpers
    requireAuth,
    requireAdmin,

    // CRUD Actions
    fetchRisks,
    fetchRiskById,
    createRisk,
    updateRisk,
    deleteRisk,

    // Risk Operations
    assessRisk,
    approveRisk,
    assignRisk,
    closeRisk,

    // Control Operations
    addControl,
    removeControl,

    // Statistics
    fetchStats,
    fetchComprehensiveAnalytics,

    // Matrix & Trends
    fetchRiskMatrix,
    fetchRiskTrends,

    // Query Helpers
    fetchHighRisks,
    fetchMyAssignedRisks,
    fetchOverdueReviews,

    // Utility
    clearError,
    clearSelection,
    resetState,
  };
});