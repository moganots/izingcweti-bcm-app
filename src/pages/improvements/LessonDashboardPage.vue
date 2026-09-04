<template>
    <q-page padding>
        <PageHeader title="Lessons Learned Dashboard"
            subtitle="Track and manage lessons learned from incidents, exercises, and audits" show-refresh
            @refresh="refreshData">
            <template #actions>
                <q-btn color="primary" icon="add" label="New Lesson" unelevated @click="showCreateDialog = true" />
            </template>
        </PageHeader>

        <div v-if="loading" class="text-center q-py-xl">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-grey-7 q-mt-md">Loading lessons...</div>
        </div>

        <template v-else>
            <!-- Stats Cards -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-primary-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-primary">{{ stats?.total || 0 }}</div>
                            <div class="text-caption text-grey-7">Total Lessons</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-green-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-green">{{ stats?.implemented || 0 }}</div>
                            <div class="text-caption text-grey-7">Implemented</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-orange-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-orange">{{ stats?.pending || 0 }}</div>
                            <div class="text-caption text-grey-7">Pending</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-purple-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-purple">{{ implementationRate }}%</div>
                            <div class="text-caption text-grey-7">Implementation Rate</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Effectiveness Rating -->
            <q-card flat bordered class="q-mb-md">
                <q-card-section>
                    <div class="row items-center justify-between">
                        <div>
                            <div class="text-h6">Average Effectiveness</div>
                            <div class="text-caption text-grey-7">Based on implemented lessons</div>
                        </div>
                        <div class="row items-center q-gutter-sm">
                            <q-rating v-model="averageEffectiveness" :max="5" readonly color="primary" size="2rem" />
                            <span class="text-h6 q-ml-sm">{{ averageEffectiveness }} / 5</span>
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Status Distribution -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6">
                    <q-card flat bordered>
                        <q-card-section>
                            <div class="text-h6 q-mb-sm">Status Distribution</div>
                            <div class="row q-col-gutter-sm">
                                <div v-for="(count, status) in stats?.byStatus" :key="status" class="col-6 col-md-4">
                                    <div class="status-item"
                                        :class="'bg-' + getLessonStatusColor(status as LessonStatus) + '-1'">
                                        <div class="text-h6">{{ count }}</div>
                                        <div class="text-caption">{{ getLessonStatusLabel(status as LessonStatus) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-12 col-md-6">
                    <q-card flat bordered>
                        <q-card-section>
                            <div class="text-h6 q-mb-sm">Priority Breakdown</div>
                            <div class="row q-col-gutter-sm">
                                <div v-for="(count, priority) in stats?.byPriority" :key="priority"
                                    class="col-6 col-md-4">
                                    <div class="priority-item"
                                        :class="'bg-' + getLessonPriorityColor(priority as LessonPriority) + '-1'">
                                        <div class="text-h6">{{ count }}</div>
                                        <div class="text-caption">{{ getLessonPriorityLabel(priority as LessonPriority)
                                        }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Recent Lessons -->
            <q-card flat bordered>
                <q-card-section>
                    <div class="text-h6 q-mb-md">Recent Lessons</div>
                    <LessonList :lessons="recentLessons" :loading="loading" :total="total" :page="page" :limit="limit"
                        @select="handleSelect" @edit="handleEdit" @delete="handleDelete"
                        @create="showCreateDialog = true" @filter="handleFilter" />
                </q-card-section>
            </q-card>
        </template>

        <!-- Create Lesson Dialog -->
        <q-dialog v-model="showCreateDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <LessonForm :loading="submitting" :error="error" @submit="handleCreate"
                    @cancel="showCreateDialog = false" />
            </div>
        </q-dialog>

        <!-- View Lesson Dialog -->
        <q-dialog v-model="showViewDialog" maximized>
            <q-card>
                <q-bar>
                    <div class="text-h6">Lesson Details</div>
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup />
                </q-bar>
                <q-card-section class="scroll" style="max-height: 80vh">
                    <LessonDetails v-if="selectedLesson" :lesson="selectedLesson" @edit="handleEditFromView"
                        @delete="handleDeleteFromView" />
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- Edit Lesson Dialog -->
        <q-dialog v-model="showEditDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <LessonForm v-if="selectedLesson" :lesson="selectedLesson" :loading="submitting" :error="error"
                    @submit="handleUpdate" @cancel="showEditDialog = false" />
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
import { useLesson } from 'src/composables/useLesson'
import { PageHeader } from 'src/components/.common'
import { LessonList, LessonForm, LessonDetails } from 'src/components/improvements'
import { ConfirmDialog } from 'src/components/.common'
import type { Lesson, LessonFilters, LessonPriority, LessonStatus } from 'src/models/entities/improvements/lesson.entity'
import {
    getLessonStatusLabel,
    getLessonStatusColor,
    getLessonPriorityLabel,
    getLessonPriorityColor,
} from 'src/models/entities/improvements/lesson.entity'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const {
    lessons,
    selectedLesson,
    lessonStats: stats,
    lessonsTotal: total,
    lessonsPage: page,
    lessonsLimit: limit,
    error,
    implementationRate,
    averageEffectiveness,
    loadLessons,
    loadStats,
    createLesson,
    updateLesson,
    deleteLesson,
    refreshData: refreshLessonData,
} = useLesson()

// ============================================
// State
// ============================================
const loading = ref(true)
const submitting = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showConfirmDialog = ref(false)

const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'info' | 'success' | 'warning' | 'error' | 'delete'>('warning')
const confirmLabel = ref('Confirm')
let pendingAction: (() => Promise<void>) | null = null

const filters = ref<LessonFilters>({
    page: 1,
    limit: 10,
})

const recentLessons = computed(() => lessons.value.slice(0, 10))

// ============================================
// Methods
// ============================================
async function loadData(): Promise<void> {
    loading.value = true
    try {
        await Promise.all([
            loadLessons(filters.value),
            loadStats(),
        ])
    } catch (err) {
        console.error('Failed to load lesson data:', err)
    } finally {
        loading.value = false
    }
}

function handleFilter(newFilters: any): void {
    filters.value = { ...filters.value, ...newFilters }
    loadData()
}

function handleSelect(lesson: Lesson): void {
    selectedLesson.value = lesson
    showViewDialog.value = true
}

function handleEdit(lesson: Lesson): void {
    selectedLesson.value = lesson
    showEditDialog.value = true
}

function handleEditFromView(): void {
    showViewDialog.value = false
    setTimeout(() => {
        if (selectedLesson.value) {
            showEditDialog.value = true
        }
    }, 300)
}

async function handleCreate(data: any): Promise<void> {
    submitting.value = true
    try {
        await createLesson(data)
        showCreateDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Lesson created successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to create lesson',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

async function handleUpdate(data: any): Promise<void> {
    if (!selectedLesson.value) return

    submitting.value = true
    try {
        await updateLesson(selectedLesson.value.uuid, data)
        showEditDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Lesson updated successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to update lesson',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

function handleDelete(lesson: Lesson): void {
    confirmTitle.value = 'Delete Lesson'
    confirmMessage.value = `Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`
    confirmType.value = 'delete'
    confirmLabel.value = 'Delete'
    pendingAction = async () => {
        await performDelete(lesson.uuid)
    }
    showConfirmDialog.value = true
}

function handleDeleteFromView(): void {
    showViewDialog.value = false
    setTimeout(() => {
        if (selectedLesson.value) {
            handleDelete(selectedLesson.value)
        }
    }, 300)
}

async function performDelete(uuid: string): Promise<void> {
    submitting.value = true
    try {
        await deleteLesson(uuid)
        showConfirmDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Lesson deleted successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to delete lesson',
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
    await refreshLessonData()
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
    loadData()
})
</script>

<style lang="scss" scoped>
.status-item,
.priority-item {
    text-align: center;
    padding: 12px 8px;
    border-radius: 8px;

    .text-h6 {
        font-size: 1.25rem;
        font-weight: 700;
    }

    .text-caption {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}

.text-h4 {
    font-size: 1.75rem;

    @media (max-width: 400px) {
        font-size: 1.25rem;
    }
}

.text-h6 {
    font-size: 1.125rem;

    @media (max-width: 400px) {
        font-size: 1rem;
    }
}
</style>