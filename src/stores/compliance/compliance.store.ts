import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ComplianceRecord,
  ComplianceStats,
} from '../../models/compliance/compliance.entity'
import {
  ComplianceStatus,
  isAuditOverdue,
  isAuditDueSoon,
} from '../../models/compliance/compliance.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { complianceService } from '../../services/api/compliance/ComplianceService'

export const useComplianceRecordStore = createOfflineCrudStore<ComplianceRecord>({
  storeId: 'compliance-records',
  tableName: 'complianceRecords',
})

export const useComplianceStore = defineStore('compliance', () => {
  const recordStore = useComplianceRecordStore()

  const stats = ref<ComplianceStats | null>(null)
  const isSaving = ref(false)

  const records = recordStore.items

  // ============================================
  // Getters
  // ============================================
  const compliantRecords = computed(() =>
    records?.filter((r) => r.complianceStatus === ComplianceStatus.COMPLIANT)
  )

  const partiallyCompliantRecords = computed(() =>
    records?.filter(
      (r) => r.complianceStatus === ComplianceStatus.PARTIALLY_COMPLIANT
    )
  )

  const nonCompliantRecords = computed(() =>
    records?.filter((r) => r.complianceStatus === ComplianceStatus.NON_COMPLIANT)
  )

  const notAssessedRecords = computed(() =>
    records?.filter((r) => r.complianceStatus === ComplianceStatus.NOT_ASSESSED)
  )

  const overdueAudits = computed(() =>
    records?.filter((r) => r.nextAuditDate && isAuditOverdue(new Date(r.nextAuditDate)))
  )

  const upcomingAudits = computed(() =>
    records?.filter(
      (r) => r.nextAuditDate && isAuditDueSoon(new Date(r.nextAuditDate), 30)
    )
  )

  const complianceRate = computed(() => {
    if (records?.length === 0) return 0
    return Math.round((compliantRecords?.value?.length / records?.length) * 100)
  })

  const recordsByStandard = computed(() => {
    const grouped: Record<string, ComplianceRecord[]> = {}
    records?.forEach((record) => {
      const standard = record.complianceStandard || 'Unknown'
      if (!grouped[standard]) grouped[standard] = []
      grouped[standard].push(record)
    })
    return grouped
  })

  const recordsByStatus = computed(() => {
    const grouped: Record<string, ComplianceRecord[]> = {}
    records?.forEach((record) => {
      const status = record.complianceStatus || 'Unknown'
      if (!grouped[status]) grouped[status] = []
      grouped[status].push(record)
    })
    return grouped
  })

  const needsAttention = computed(
    () => nonCompliantRecords?.value?.length > 0 || overdueAudits?.value?.length > 0
  )

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await recordStore.initialize()
    await refreshStats()
  }

  async function refreshStats(): Promise<void> {
    try {
      stats.value = await complianceService.getStats()
    } catch (err: any) {
      console.error('Failed to load compliance stats:', err)
    }
  }

  async function updateStatus(id: string, status: ComplianceStatus): Promise<ComplianceRecord | null> {
    return recordStore.update(id, { complianceStatus: status } as Partial<ComplianceRecord>)
  }

  async function bulkUpdateStatus(ids: string[], status: ComplianceStatus): Promise<void> {
    await recordStore.bulkUpdate(
      ids.map((id) => ({ id, data: { complianceStatus: status } as Partial<ComplianceRecord> }))
    )
  }

  async function scheduleAudit(id: string, nextAuditDate: Date): Promise<ComplianceRecord | null> {
    return recordStore.update(id, { nextAuditDate } as Partial<ComplianceRecord>)
  }

  async function addEvidence(id: string, links: string[]): Promise<ComplianceRecord | null> {
    const record = records?.find((r) => r.uuid === id)
    if (!record) return null

    const currentLinks = record.evidenceLinks || []
    return recordStore.update(id, {
      evidenceLinks: [...currentLinks, ...links],
    } as Partial<ComplianceRecord>)
  }

  return {
    // State
    records,
    stats,
    isLoading: recordStore.loading,
    isSaving,
    error: recordStore.error,

    // Getters
    compliantRecords,
    partiallyCompliantRecords,
    nonCompliantRecords,
    notAssessedRecords,
    overdueAudits,
    upcomingAudits,
    complianceRate,
    recordsByStandard,
    recordsByStatus,
    needsAttention,

    // Actions
    initialize,
    refreshStats,
    updateStatus,
    bulkUpdateStatus,
    scheduleAudit,
    addEvidence,

    // Sub-store
    recordStore,
  }
})