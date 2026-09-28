import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tenant, TenantAuditLog } from '../../models/tenant/tenant.entity'
import { TenantStatus, TenantTier } from '../../models/tenant/tenant.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'

export const useTenantItemStore = createOfflineCrudStore<Tenant>({
    storeId: 'tenants',
    tableName: 'tenants',
})

export const useTenantAuditLogStore = createOfflineCrudStore<TenantAuditLog>({
    storeId: 'tenant-audit-logs',
    tableName: 'tenantAuditLogs',
})

export const useTenantStore = defineStore('tenant', () => {
    const tenantStore = useTenantItemStore()
    const auditLogStore = useTenantAuditLogStore()
    const isSaving = ref(false)

    const tenants = tenantStore.items
    const auditLogs = auditLogStore.items

    // ============================================
    // Getters
    // ============================================
    const activeTenants = computed(() =>
        tenants?.filter((t) => t.status === TenantStatus.ACTIVE)
    )

    const trialTenants = computed(() =>
        tenants?.filter((t) => t.status === TenantStatus.TRIAL)
    )

    const suspendedTenants = computed(() =>
        tenants?.filter((t) => t.status === TenantStatus.SUSPENDED)
    )

    const expiredTenants = computed(() =>
        tenants?.filter((t) => t.status === TenantStatus.EXPIRED)
    )

    const enterpriseTenants = computed(() =>
        tenants?.filter(
            (t) =>
                t.tier === TenantTier.ENTERPRISE || t.tier === TenantTier.PREMIUM
        )
    )

    const tenantsByStatus = computed(() => {
        const grouped: Record<string, Tenant[]> = {}
        tenants?.forEach((t) => {
            const status = t.status || 'Unknown'
            if (!grouped[status]) grouped[status] = []
            grouped[status].push(t)
        })
        return grouped
    })

    const tenantsByTier = computed(() => {
        const grouped: Record<string, Tenant[]> = {}
        tenants?.forEach((t) => {
            const tier = t.tier || 'Unknown'
            if (!grouped[tier]) grouped[tier] = []
            grouped[tier].push(t)
        })
        return grouped
    })

    const healthyTenants = computed(() =>
        tenants?.filter(
            (t) =>
                (t.status === TenantStatus.ACTIVE || t.status === TenantStatus.TRIAL) &&
                (!t.subscriptionEndDate || new Date(t.subscriptionEndDate) > new Date())
        )
    )

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        await Promise.all([tenantStore.initialize(), auditLogStore.initialize()])
    }

    async function activateTenant(id: string): Promise<Tenant | null> {
        return tenantStore.update(id, { status: TenantStatus.ACTIVE } as Partial<Tenant>)
    }

    async function suspendTenant(id: string): Promise<Tenant | null> {
        return tenantStore.update(id, { status: TenantStatus.SUSPENDED } as Partial<Tenant>)
    }

    async function updateTier(id: string, tier: TenantTier): Promise<Tenant | null> {
        return tenantStore.update(id, { tier } as Partial<Tenant>)
    }

    async function addFeature(id: string, feature: string): Promise<Tenant | null> {
        const tenant = tenants?.find((t) => t.uuid === id)
        if (!tenant) return null

        const features = tenant.features || []
        if (features.includes(feature as any)) return tenant

        return tenantStore.update(id, {
            features: [...features, feature as any],
        } as Partial<Tenant>)
    }

    async function removeFeature(id: string, feature: string): Promise<Tenant | null> {
        const tenant = tenants?.find((t) => t.uuid === id)
        if (!tenant) return null

        const features = tenant.features || []
        return tenantStore.update(id, {
            features: features.filter((f) => f !== feature),
        } as Partial<Tenant>)
    }

    return {
        // State
        tenants,
        auditLogs,
        selectedTenant: tenantStore.selected,
        isLoading: tenantStore.loading,
        isSaving,
        error: tenantStore.error,

        // Getters
        activeTenants,
        trialTenants,
        suspendedTenants,
        expiredTenants,
        enterpriseTenants,
        tenantsByStatus,
        tenantsByTier,
        healthyTenants,

        // Actions
        initialize,
        activateTenant,
        suspendTenant,
        updateTier,
        addFeature,
        removeFeature,

        // Sub-stores
        tenantStore,
        auditLogStore,
    }
})