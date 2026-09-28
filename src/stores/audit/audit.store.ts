import { defineStore } from 'pinia'
import { computed } from 'vue'
import type {
    AuditLog,
    AuditRetentionPolicy,
    ActivityHistory,
    Attachment,
    Comment,
} from '../../models/audit/audit.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { auditService } from '../../services/api/audit/AuditService'

// ============================================
// Audit Logs Store
// ============================================
export const useAuditLogStore = createOfflineCrudStore<AuditLog>({
    storeId: 'audit-logs',
    tableName: 'auditLogs',
})

// ============================================
// Audit Retention Policies Store
// ============================================
export const useAuditRetentionPolicyStore = createOfflineCrudStore<AuditRetentionPolicy>({
    storeId: 'audit-retention-policies',
    tableName: 'auditRetentionPolicies',
})

// ============================================
// Activity History Store
// ============================================
export const useActivityHistoryStore = createOfflineCrudStore<ActivityHistory>({
    storeId: 'activity-history',
    tableName: 'activityHistory',
})

// ============================================
// Attachments Store
// ============================================
export const useAttachmentStore = createOfflineCrudStore<Attachment>({
    storeId: 'attachments',
    tableName: 'attachments',
})

// ============================================
// Comments Store
// ============================================
export const useCommentStore = createOfflineCrudStore<Comment>({
    storeId: 'comments',
    tableName: 'comments',
})

// ============================================
// Main Audit Store (facade with advanced features)
// ============================================
export const useAuditStore = defineStore('audit', () => {
    const logStore = useAuditLogStore()
    const retentionStore = useAuditRetentionPolicyStore()
    const activityStore = useActivityHistoryStore()

    const {
        items: logs,
        loading: isLoading,
        error,
        page: currentPage,
        totalPages,
        total: totalItems,
        loadAll: loadLogs,
        loadById: loadLog,
    } = logStore

    // ============================================
    // Getters
    // ============================================
    const errorLogs = computed(() =>
        logs?.filter((l) => l.severity === 'Error' || l.severity === 'Critical')
    )

    const securityLogs = computed(() =>
        logs?.filter((l) => l.auditCategory === 'Security')
    )

    const dataChangeLogs = computed(() =>
        logs?.filter((l) => l.auditCategory === 'DataChange')
    )

    // ============================================
    // Actions
    // ============================================
    async function exportLogs(data: {
        auditCategory?: string
        startDate?: Date
        endDate?: Date
        format?: string
    }): Promise<void> {
        try {
            await auditService.exportLogs(data)
        } catch (err: any) {
            console.error('Failed to export logs:', err)
            throw err
        }
    }

    return {
        // Refs
        logs,
        isLoading,
        error,
        currentPage,
        totalPages,
        totalItems,

        // Getters
        errorLogs,
        securityLogs,
        dataChangeLogs,

        // Actions
        loadLogs,
        loadLog,
        exportLogs,

        // Sub-store access
        logStore,
        retentionStore,
        activityStore,
    }
})