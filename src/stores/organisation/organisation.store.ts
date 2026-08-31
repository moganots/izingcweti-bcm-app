import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { organisationService, businessUnitService, departmentService } from '@/services/organisation';
import { useAuth } from '@/composables/auth/useAuth';
import type {
  Organisation,
  BusinessUnit,
  Department,
  CreateOrganisationDto,
  UpdateOrganisationDto,
  CreateBusinessUnitDto,
  UpdateBusinessUnitDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  OrganisationQueryParams,
  OrganisationStatsDto,
  OrganisationHierarchy,
  BusinessUnitStatsDto,
  DepartmentStatsDto,
} from '@/types/organisation';

export const useOrganisationStore = defineStore('organisation', () => {
  // ============================================
  // Dependencies - Auth Integration
  // ============================================
  const auth = useAuth();
  const { isAuthenticated, isAdmin, isGlobalAdmin, userId, organisationId: userOrgId } = auth;

  // ============================================
  // State - Organisations
  // ============================================
  const organisations = ref<Organisation[]>([]);
  const selectedOrganisation = ref<Organisation | null>(null);
  const organisationStats = ref<OrganisationStatsDto | null>(null);
  const organisationHierarchy = ref<OrganisationHierarchy | null>(null);

  // ============================================
  // State - Business Units (Cached)
  // ============================================
  const businessUnitsCache = ref<Map<string, BusinessUnit[]>>(new Map());
  const selectedBusinessUnit = ref<BusinessUnit | null>(null);
  const businessUnitStats = ref<BusinessUnitStatsDto | null>(null);

  // ============================================
  // State - Departments (Cached)
  // ============================================
  const departmentsCache = ref<Map<string, Department[]>>(new Map());
  const selectedDepartment = ref<Department | null>(null);
  const departmentStats = ref<DepartmentStatsDto | null>(null);

  // ============================================
  // State - UI & Pagination
  // ============================================
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const filters = ref<OrganisationQueryParams>({});

  // ============================================
  // Getters - Organisations
  // ============================================
  const hasOrganisations = computed(() => organisations.value.length > 0);

  const organisationsByIndustry = computed(() => {
    const grouped: Record<string, Organisation[]> = {};
    organisations.value.forEach((org) => {
      const industry = org.industryType || 'Unknown';
      if (!grouped[industry]) grouped[industry] = [];
      grouped[industry].push(org);
    });
    return grouped;
  });

  const organisationsByMaturity = computed(() => {
    const grouped: Record<string, Organisation[]> = {};
    organisations.value.forEach((org) => {
      const maturity = org.maturityScore || 'Unknown';
      if (!grouped[maturity]) grouped[maturity] = [];
      grouped[maturity].push(org);
    });
    return grouped;
  });

  const highMaturityOrganisations = computed(() =>
    organisations.value.filter((org) =>
      org.maturityScore === 'OPTIMIZING' || org.maturityScore === 'QUANTITATIVELY_MANAGED'
    )
  );

  // ============================================
  // Getters - Business Units
  // ============================================
  const getBusinessUnitsForOrganisation = (organisationId: string) => {
    return businessUnitsCache.value.get(organisationId) || [];
  };

  const hasBusinessUnits = (organisationId: string) => {
    return (businessUnitsCache.value.get(organisationId)?.length || 0) > 0;
  };

  const businessUnitsByCriticality = computed(() => {
    const grouped: Record<string, BusinessUnit[]> = {};
    const allBus = Array.from(businessUnitsCache.value.values()).flat();
    allBus.forEach((bu) => {
      const score = bu.criticalityScore || 'Unknown';
      if (!grouped[score]) grouped[score] = [];
      grouped[score].push(bu);
    });
    return grouped;
  });

  // ============================================
  // Getters - Departments
  // ============================================
  const getDepartmentsForBusinessUnit = (businessUnitId: string) => {
    return departmentsCache.value.get(businessUnitId) || [];
  };

  const hasDepartments = (businessUnitId: string) => {
    return (departmentsCache.value.get(businessUnitId)?.length || 0) > 0;
  };

  const departmentsWithRTO = computed(() => {
    const allDepts = Array.from(departmentsCache.value.values()).flat();
    return allDepts.filter((dept) => dept.recoveryTimeObjectiveHours);
  });

  const departmentsWithRPO = computed(() => {
    const allDepts = Array.from(departmentsCache.value.values()).flat();
    return allDepts.filter((dept) => dept.recoveryPointObjectiveHours);
  });

  // ============================================
  // Actions - Authentication Check Helpers
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

  const requireGlobalAdmin = (): boolean => {
    if (!requireAuth()) return false;
    if (!isGlobalAdmin.value) {
      error.value = 'Insufficient permissions: System administrator access required';
      return false;
    }
    return true;
  };

  // ============================================
  // Actions - Organisations
  // ============================================

  async function fetchOrganisations(params?: OrganisationQueryParams) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
      };
      const response = await organisationService.getOrganisations(queryParams);
      organisations.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      if (params) filters.value = { ...filters.value, ...params };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch organisations';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOrganisationById(uuid: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const organisation = await organisationService.getOrganisation(uuid);
      selectedOrganisation.value = organisation;
      return organisation;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch organisation';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOrganisationStats(organisationId?: string) {
    if (!requireAuth()) return null;

    try {
      const stats = await organisationService.getStats(organisationId);
      organisationStats.value = stats;
      return stats;
    } catch (err: any) {
      console.error('Failed to fetch organisation stats:', err);
      throw err;
    }
  }

  async function fetchOrganisationHierarchy(organisationId: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const hierarchy = await organisationService.getOrganisationHierarchy(organisationId);
      organisationHierarchy.value = hierarchy;

      // Cache business units
      if (hierarchy) {
        const bus = hierarchy.businessUnits.map((bu) => bu.businessUnit);
        businessUnitsCache.value.set(organisationId, bus);

        // Cache departments
        for (const bu of hierarchy.businessUnits) {
          departmentsCache.value.set(bu.businessUnit.uuid, bu.departments);
        }
      }
      return hierarchy;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch organisation hierarchy';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createOrganisation(data: CreateOrganisationDto) {
    if (!requireGlobalAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const organisation = await organisationService.createOrganisation(data);
      organisations.value.unshift(organisation);
      return organisation;
    } catch (err: any) {
      error.value = err.message || 'Failed to create organisation';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateOrganisation(uuid: string, data: UpdateOrganisationDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const organisation = await organisationService.updateOrganisation(uuid, data);
      const index = organisations.value.findIndex((org) => org.uuid === uuid);
      if (index !== -1) {
        organisations.value[index] = organisation;
      }
      if (selectedOrganisation.value?.uuid === uuid) {
        selectedOrganisation.value = organisation;
      }
      return organisation;
    } catch (err: any) {
      error.value = err.message || 'Failed to update organisation';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteOrganisation(uuid: string) {
    if (!requireGlobalAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await organisationService.deleteOrganisation(uuid);
      organisations.value = organisations.value.filter((org) => org.uuid !== uuid);
      if (selectedOrganisation.value?.uuid === uuid) {
        selectedOrganisation.value = null;
      }
      businessUnitsCache.value.delete(uuid);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete organisation';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function searchOrganisations(query: string) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const response = await organisationService.searchOrganisations(query);
      organisations.value = response.data || [];
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to search organisations';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Actions - Business Units
  // ============================================

  async function fetchBusinessUnitsForOrganisation(organisationId: string, params?: any) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const response = await businessUnitService.getBusinessUnitsByOrganisation(organisationId, params);
      businessUnitsCache.value.set(organisationId, response.data || []);
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch business units';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createBusinessUnit(data: CreateBusinessUnitDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const businessUnit = await businessUnitService.createBusinessUnit(data);
      const cached = businessUnitsCache.value.get(data.organisationId) || [];
      businessUnitsCache.value.set(data.organisationId, [businessUnit, ...cached]);
      return businessUnit;
    } catch (err: any) {
      error.value = err.message || 'Failed to create business unit';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateBusinessUnit(uuid: string, data: UpdateBusinessUnitDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const businessUnit = await businessUnitService.updateBusinessUnit(uuid, data);

      // Update cache
      for (const [orgId, bus] of businessUnitsCache.value.entries()) {
        const index = bus.findIndex((bu) => bu.uuid === uuid);
        if (index !== -1) {
          bus[index] = businessUnit;
          businessUnitsCache.value.set(orgId, bus);
          break;
        }
      }

      if (selectedBusinessUnit.value?.uuid === uuid) {
        selectedBusinessUnit.value = businessUnit;
      }
      return businessUnit;
    } catch (err: any) {
      error.value = err.message || 'Failed to update business unit';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteBusinessUnit(uuid: string) {
    if (!requireAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await businessUnitService.deleteBusinessUnit(uuid);

      // Remove from cache
      for (const [orgId, bus] of businessUnitsCache.value.entries()) {
        const filtered = bus.filter((bu) => bu.uuid !== uuid);
        if (filtered.length !== bus.length) {
          businessUnitsCache.value.set(orgId, filtered);
          break;
        }
      }

      if (selectedBusinessUnit.value?.uuid === uuid) {
        selectedBusinessUnit.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete business unit';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function fetchBusinessUnitStats(organisationId?: string) {
    if (!requireAuth()) return null;

    try {
      const stats = await businessUnitService.getStats(organisationId);
      businessUnitStats.value = stats;
      return stats;
    } catch (err: any) {
      console.error('Failed to fetch business unit stats:', err);
      throw err;
    }
  }

  // ============================================
  // Actions - Departments
  // ============================================

  async function fetchDepartmentsForBusinessUnit(businessUnitId: string, params?: any) {
    if (!requireAuth()) return null;

    isLoading.value = true;
    error.value = null;
    try {
      const response = await departmentService.getDepartmentsByBusinessUnit(businessUnitId, params);
      departmentsCache.value.set(businessUnitId, response.data || []);
      pagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 0,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20,
      };
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch departments';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createDepartment(data: CreateDepartmentDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const department = await departmentService.createDepartment(data);
      const cached = departmentsCache.value.get(data.businessUnitId) || [];
      departmentsCache.value.set(data.businessUnitId, [department, ...cached]);
      return department;
    } catch (err: any) {
      error.value = err.message || 'Failed to create department';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateDepartment(uuid: string, data: UpdateDepartmentDto) {
    if (!requireAdmin()) return null;

    isSaving.value = true;
    error.value = null;
    try {
      const department = await departmentService.updateDepartment(uuid, data);

      // Update cache
      for (const [buId, depts] of departmentsCache.value.entries()) {
        const index = depts.findIndex((d) => d.uuid === uuid);
        if (index !== -1) {
          depts[index] = department;
          departmentsCache.value.set(buId, depts);
          break;
        }
      }

      if (selectedDepartment.value?.uuid === uuid) {
        selectedDepartment.value = department;
      }
      return department;
    } catch (err: any) {
      error.value = err.message || 'Failed to update department';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteDepartment(uuid: string) {
    if (!requireAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await departmentService.deleteDepartment(uuid);

      // Remove from cache
      for (const [buId, depts] of departmentsCache.value.entries()) {
        const filtered = depts.filter((d) => d.uuid !== uuid);
        if (filtered.length !== depts.length) {
          departmentsCache.value.set(buId, filtered);
          break;
        }
      }

      if (selectedDepartment.value?.uuid === uuid) {
        selectedDepartment.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete department';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function reorderDepartments(departmentIds: string[]) {
    if (!requireAdmin()) return;

    isSaving.value = true;
    error.value = null;
    try {
      await departmentService.reorderDepartments(departmentIds);
    } catch (err: any) {
      error.value = err.message || 'Failed to reorder departments';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function fetchDepartmentStats(businessUnitId?: string) {
    if (!requireAuth()) return null;

    try {
      const stats = await departmentService.getStats(businessUnitId);
      departmentStats.value = stats;
      return stats;
    } catch (err: any) {
      console.error('Failed to fetch department stats:', err);
      throw err;
    }
  }

  // ============================================
  // Utility Actions
  // ============================================

  function clearError() {
    error.value = null;
  }

  function resetState() {
    organisations.value = [];
    selectedOrganisation.value = null;
    organisationStats.value = null;
    organisationHierarchy.value = null;
    businessUnitsCache.value.clear();
    selectedBusinessUnit.value = null;
    businessUnitStats.value = null;
    departmentsCache.value.clear();
    selectedDepartment.value = null;
    departmentStats.value = null;
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
    organisations,
    selectedOrganisation,
    organisationStats,
    organisationHierarchy,
    businessUnitsCache,
    selectedBusinessUnit,
    businessUnitStats,
    departmentsCache,
    selectedDepartment,
    departmentStats,
    isLoading,
    isSaving,
    error,
    pagination,
    filters,

    // Getters - Organisations
    hasOrganisations,
    organisationsByIndustry,
    organisationsByMaturity,
    highMaturityOrganisations,

    // Getters - Business Units
    getBusinessUnitsForOrganisation,
    hasBusinessUnits,
    businessUnitsByCriticality,

    // Getters - Departments
    getDepartmentsForBusinessUnit,
    hasDepartments,
    departmentsWithRTO,
    departmentsWithRPO,

    // Auth Helpers
    requireAuth,
    requireAdmin,
    requireGlobalAdmin,

    // Actions - Organisations
    fetchOrganisations,
    fetchOrganisationById,
    fetchOrganisationStats,
    fetchOrganisationHierarchy,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
    searchOrganisations,

    // Actions - Business Units
    fetchBusinessUnitsForOrganisation,
    createBusinessUnit,
    updateBusinessUnit,
    deleteBusinessUnit,
    fetchBusinessUnitStats,

    // Actions - Departments
    fetchDepartmentsForBusinessUnit,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    reorderDepartments,
    fetchDepartmentStats,

    // Utility
    clearError,
    resetState,
  };
});