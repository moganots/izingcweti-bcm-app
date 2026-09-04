<template>
    <q-page padding>
        <PageHeader title="Maturity Assessment" subtitle="Track your BCM maturity over time" show-refresh
            @refresh="refreshData">
            <template #actions>
                <q-btn color="primary" icon="add" label="New Assessment" unelevated @click="showCreateDialog = true" />
            </template>
        </PageHeader>

        <div v-if="loading" class="text-center q-py-xl">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-grey-7 q-mt-md">Loading maturity data...</div>
        </div>

        <template v-else>
            <!-- Stats Cards -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-primary-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-primary">{{ maturityStats?.latestScore || 0 }}</div>
                            <div class="text-caption text-grey-7">Latest Score</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-green-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-green">{{ Math.round(maturityStats?.averageScore || 0) }}</div>
                            <div class="text-caption text-grey-7">Average Score</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-orange-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-orange">{{ latestMaturityLevel }}</div>
                            <div class="text-caption text-grey-7">Current Level</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-purple-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-purple">{{ maturityStats?.total || 0 }}</div>
                            <div class="text-caption text-grey-7">Total Assessments</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Maturity Chart -->
            <MaturityChart :data="maturityTrend" :loading="loading" class="q-mb-md" />

            <!-- Assessment List -->
            <q-card flat bordered>
                <q-card-section>
                    <div class="text-h6 q-mb-md">Assessment History</div>

                    <q-list v-if="assessments.length > 0" bordered separator>
                        <q-item v-for="assessment in assessments" :key="assessment.uuid" clickable
                            @click="selectAssessment(assessment)">
                            <q-item-section>
                                <div class="row items-center q-gutter-sm">
                                    <q-item-label class="text-weight-medium">
                                        {{ formatDate(assessment.assessedDate) }}
                                    </q-item-label>
                                    <q-badge :color="getMaturityLevelColor(assessment.level)"
                                        :label="getMaturityLevelLabel(assessment.level)" />
                                </div>
                                <q-item-label caption class="q-mt-xs">
                                    Score: {{ assessment.score }}%
                                    <span class="q-mx-xs">•</span>
                                    {{ assessment.assessedBy ? `Assessed by: ${assessment.assessedBy}` :
                                        'Self-assessment' }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn flat round dense icon="more_vert">
                                    <q-menu>
                                        <q-list dense>
                                            <q-item clickable v-close-popup @click="selectAssessment(assessment)">
                                                <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                                                <q-item-section>View</q-item-section>
                                            </q-item>
                                            <q-item clickable v-close-popup @click="editAssessment(assessment)">
                                                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                                <q-item-section>Edit</q-item-section>
                                            </q-item>
                                            <q-separator />
                                            <q-item clickable v-close-popup @click="deleteAssessment(assessment)">
                                                <q-item-section avatar><q-icon name="delete"
                                                        color="negative" /></q-item-section>
                                                <q-item-section class="text-negative">Delete</q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-menu>
                                </q-btn>
                            </q-item-section>
                        </q-item>
                    </q-list>

                    <div v-else class="text-center q-py-lg text-grey-7">
                        <q-icon name="assessment" size="48px" color="grey-4" class="q-mb-sm" />
                        <div>No assessments recorded</div>
                    </div>
                </q-card-section>
            </q-card>
        </template>

        <!-- Create Assessment Dialog -->
        <q-dialog v-model="showCreateDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <MaturityAssessmentForm :loading="submitting" :error="error" @submit="handleCreate"
                    @cancel="showCreateDialog = false" />
            </div>
        </q-dialog>

        <!-- View Assessment Dialog -->
        <q-dialog v-model="showViewDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <MaturityAssessmentDetails v-if="selectedAssessment" :assessment="selectedAssessment"
                    @edit="handleEditFromView" @delete="handleDeleteFromView" @close="showViewDialog = false" />
            </div>
        </q-dialog>

        <!-- Edit Assessment Dialog -->
        <q-dialog v-model="showEditDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <MaturityAssessmentForm v-if="selectedAssessment" :assessment="selectedAssessment" :loading="submitting"
                    :error="error" @submit="handleUpdate" @cancel="showEditDialog = false" />
            </div>
        </q-dialog>

        <!-- Confirmation Dialog -->
        <q-dialog v-model="showConfirmDialog" persistent>
            <ConfirmDialog v-model="showConfirmDialog" :title="confirmTitle" :message="confirmMessage"
                :type="confirmType" :confirm-label="confirmLabel" :loading="submitting" @confirm="handleConfirm"
                @cancel="showConfirmDialog = false" />
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGovernance } from 'src/composables/useGovernance'
import { PageHeader } from 'src/components/.common'
import { MaturityChart, MaturityAssessmentForm, MaturityAssessmentDetails } from 'src/components/governance'
import { ConfirmDialog } from 'src/components/.common'
import type { MaturityAssessment, MaturityLevel } from 'src/models/entities/governance/governance.entity'
import {
    getMaturityLevelLabel,
    getMaturityLevelColor,
} from 'src/models/entities/governance/governance.entity'
import { formatDate } from 'src/utils/date.utils'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const {
    maturityAssessments: assessments,
    maturityStats,
    maturityTrend,
    error,
    createMaturityAssessment,
    updateMaturityAssessment,
    deleteMaturityAssessment,
    refreshData: refreshGovernanceData,
} = useGovernance()

// ============================================
// State
// ============================================
const loading = ref(true)
const submitting = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedAssessment = ref<MaturityAssessment | null>(null)

const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

// ============================================
// Computed
// ============================================
const latestMaturityLevel = computed(() => {
    if (!maturityStats.value?.latestLevel) return 'N/A'
    return getMaturityLevelLabel(maturityStats.value.latestLevel as MaturityLevel)
})

// ============================================
// Methods
// ============================================
async function loadData(): Promise<void> {
    loading.value = true
    try {
        await refreshGovernanceData()
    } catch (err) {
        console.error('Failed to load maturity data:', err)
    } finally {
        loading.value = false
    }
}

function selectAssessment(assessment: MaturityAssessment): void {
    selectedAssessment.value = assessment
    showViewDialog.value = true
}

function editAssessment(assessment: MaturityAssessment): void {
    selectedAssessment.value = assessment
    showEditDialog.value = true
}

function handleEditFromView(): void {
    showViewDialog.value = false
    setTimeout(() => {
        if (selectedAssessment.value) {
            showEditDialog.value = true
        }
    }, 300)
}

async function handleCreate(data: any): Promise<void> {
    submitting.value = true
    try {
        await createMaturityAssessment(data)
        showCreateDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Maturity assessment created successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to create assessment',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

async function handleUpdate(data: any): Promise<void> {
    if (!selectedAssessment.value) return

    submitting.value = true
    try {
        await updateMaturityAssessment(selectedAssessment.value.uuid, data)
        showEditDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Maturity assessment updated successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to update assessment',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

function deleteAssessment(assessment: MaturityAssessment): void {
    confirmTitle.value = 'Delete Assessment'
    confirmMessage.value = `Are you sure you want to delete the assessment from ${formatDate(assessment.assessedDate)}?`
    confirmType.value = 'delete'
    confirmLabel.value = 'Delete'
    pendingAction = async () => {
        await performDelete(assessment.uuid)
    }
    showConfirmDialog.value = true
}

function handleDeleteFromView(): void {
    showViewDialog.value = false
    setTimeout(() => {
        if (selectedAssessment.value) {
            deleteAssessment(selectedAssessment.value)
        }
    }, 300)
}

async function performDelete(uuid: string): Promise<void> {
    submitting.value = true
    try {
        await deleteMaturityAssessment(uuid)
        showConfirmDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Maturity assessment deleted successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to delete assessment',
            position: 'top',
        })
    } finally {
        submitting.value = false
        pendingAction = null
    }
}

async function handleConfirm(): Promise<void> {
    if (pendingAction) {
        await pendingAction()
    }
}

async function refreshData(): Promise<void> {
    await loadData()
    await refreshGovernanceData()
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
    loadData()
})
</script>