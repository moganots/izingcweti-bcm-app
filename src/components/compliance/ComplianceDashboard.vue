<template>
    <div class="compliance-dashboard">
        <!-- Stats Overview -->
        <div class="q-mb-lg">
            <ComplianceStatsWidget :stats="statsData" :last-updated="lastUpdated" @refresh="handleRefresh" />
        </div>

        <!-- Charts Row -->
        <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-6">
                <ComplianceStatusChart :data="statusChartData" />
            </div>
            <div class="col-12 col-md-6">
                <ComplianceStandardChart :data="standardChartData" />
            </div>
        </div>

        <!-- Records and Audit History -->
        <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-7">
                <ComplianceRecordList :records="recentRecords" :loading="recordsLoading" @create="handleCreateRecord"
                    @select="handleSelectRecord" @edit="handleEditRecord" @update-status="handleUpdateStatus"
                    @add-evidence="handleAddEvidence" @delete="handleDeleteRecord" />
            </div>
            <div class="col-12 col-lg-5">
                <ComplianceAuditHistory :audits="auditHistory" :loading="auditLoading" @schedule="handleScheduleAudit"
                    @view="handleViewAudit" @edit="handleEditAudit" @delete="handleDeleteAudit" />
            </div>
        </div>

        <!-- Gap Analysis -->
        <div class="q-mt-lg">
            <ComplianceGapAnalysis :gaps="gaps" />
        </div>

        <!-- Dialogs -->
        <ComplianceRecordForm v-model="dialogVisible.record" :editing="editingRecord" :initial-data="selectedRecord"
            :submitting="submitting" :error-message="errorMessage" :organisation-options="organisationOptions"
            @submit="handleSubmitRecord" @cancel="closeRecordDialog" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import ComplianceStatsWidget from './ComplianceStatsWidget.vue'
import ComplianceStatusChart from './ComplianceStatusChart.vue'
import ComplianceStandardChart from './ComplianceStandardChart.vue'
import ComplianceRecordList from './ComplianceRecordList.vue'
import ComplianceAuditHistory from './ComplianceAuditHistory.vue'
import ComplianceGapAnalysis from './ComplianceGapAnalysis.vue'
import ComplianceRecordForm from './ComplianceRecordForm.vue'
import { useCompliance } from './../../composables/useCompliance'

const compliance = useCompliance()

// State
const loading = ref(false)
const recordsLoading = ref(false)
const auditLoading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const lastUpdated = ref<string | null>(null)

// Data
const records = ref<any[]>([])
const recentRecords = computed(() => records.value.slice(0, 6))
const auditHistory = ref<any[]>([])
const gaps = ref<any[]>([])
const statsData = ref<any>(null)

// Dialog state
const dialogVisible = reactive({
    record: false,
})
const editingRecord = ref(false)
const selectedRecord = ref<any>(null)

// Options
const organisationOptions = ref<Array<{ label: string; value: string }>>([])

// Chart data
const statusChartData = computed(() => {
    const byStatus = statsData.value?.byStatus || {}
    return Object.keys(byStatus).map((status) => ({
        status,
        count: byStatus[status] || 0,
    }))
})

const standardChartData = computed(() => {
    const byStandard = statsData.value?.byStandard || {}
    return Object.keys(byStandard).map((standard) => ({
        standard,
        compliant: byStandard[standard]?.compliant || 0,
        total: byStandard[standard]?.total || 0,
    }))
})

// Methods
function handleRefresh(): void {
    fetchDashboardData()
}

async function fetchDashboardData(): Promise<void> {
    loading.value = true
    recordsLoading.value = true
    auditLoading.value = true

    try {
        // Load stats
        await compliance.loadStats()
        statsData.value = compliance.stats.value

        // Load records
        await compliance.loadBy({ limit: 20 })
        records.value = compliance.records.value || []

        // Load gaps
        await compliance.loadGaps()
        gaps.value = compliance.gaps.value || []

        // Load audit history (using loadRecords as a proxy for now)
        // In a real implementation, you'd have a dedicated method
        auditHistory.value = compliance.records.value?.slice(0, 10) || []

        // Load organisations - this would need a separate service
        // For now, we'll use a placeholder
        organisationOptions.value = []

        lastUpdated.value = new Date().toISOString()
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
    } finally {
        loading.value = false
        recordsLoading.value = false
        auditLoading.value = false
    }
}

function handleCreateRecord(): void {
    editingRecord.value = false
    selectedRecord.value = null
    dialogVisible.record = true
}

function handleSelectRecord(record: any): void {
    // Navigate to detail view or open dialog
    console.log('Selected record:', record)
}

function handleEditRecord(record: any): void {
    editingRecord.value = true
    selectedRecord.value = record
    dialogVisible.record = true
}

function handleUpdateStatus(record: any): void {
    // Open status update dialog
    console.log('Update status for:', record)
}

function handleAddEvidence(record: any): void {
    // Open evidence dialog
    console.log('Add evidence for:', record)
}

async function handleDeleteRecord(record: any): Promise<void> {
    if (confirm('Are you sure you want to delete this compliance record?')) {
        try {
            await compliance.deleteRecord(record.uuid || record.id)
            await fetchDashboardData()
        } catch (error) {
            console.error('Failed to delete record:', error)
        }
    }
}

function handleScheduleAudit(): void {
    // Open schedule audit dialog
    console.log('Schedule audit')
}

function handleViewAudit(audit: any): void {
    // View audit details
    console.log('View audit:', audit)
}

function handleEditAudit(audit: any): void {
    // Edit audit
    console.log('Edit audit:', audit)
}

async function handleDeleteAudit(_audit: any): Promise<void> {
    if (confirm('Are you sure you want to delete this audit record?')) {
        try {
            // In a real implementation, you'd call a deleteAudit method
            // For now, we'll just refresh the data
            await fetchDashboardData()
        } catch (error) {
            console.error('Failed to delete audit:', error)
        }
    }
}

async function handleSubmitRecord(data: any): Promise<void> {
    submitting.value = true
    errorMessage.value = ''

    try {
        if (editingRecord.value) {
            await compliance.updateRecord(selectedRecord.value.uuid || selectedRecord.value.id, data)
        } else {
            await compliance.createRecord(data)
        }
        closeRecordDialog()
        await fetchDashboardData()
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to save record'
    } finally {
        submitting.value = false
    }
}

function closeRecordDialog(): void {
    dialogVisible.record = false
    editingRecord.value = false
    selectedRecord.value = null
    errorMessage.value = ''
}

// Initialize
onMounted(() => {
    fetchDashboardData()
})
</script>