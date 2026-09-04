<template>
    <q-page padding>
        <PageHeader title="Training Dashboard" subtitle="Manage training courses and certifications" show-refresh
            @refresh="refreshData">
            <template #actions>
                <q-btn color="primary" icon="add" label="New Course" unelevated @click="showCreateDialog = true" />
            </template>
        </PageHeader>

        <div v-if="loading" class="text-center q-py-xl">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-grey-7 q-mt-md">Loading training data...</div>
        </div>

        <template v-else>
            <!-- Stats Cards -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-primary-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-primary">{{ courseStats?.published || 0 }}</div>
                            <div class="text-caption text-grey-7">Published Courses</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-green-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-green">{{ completedCount }}</div>
                            <div class="text-caption text-grey-7">Completed</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-orange-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-orange">{{ inProgressCount }}</div>
                            <div class="text-caption text-grey-7">In Progress</div>
                        </q-card-section>
                    </q-card>
                </div>
                <div class="col-6 col-md-3">
                    <q-card flat bordered class="bg-purple-1">
                        <q-card-section class="text-center">
                            <div class="text-h4 text-purple">{{ activeCertificationsCount }}</div>
                            <div class="text-caption text-grey-7">Active Certifications</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Courses List -->
            <CourseList :courses="courses" :loading="coursesLoading" :total="coursesTotal" :page="coursesPage"
                :limit="coursesLimit" @create="showCreateDialog = true" @select="handleSelect" @edit="handleEdit"
                @delete="handleDelete" @filter="handleFilter" />
        </template>

        <!-- Create Course Dialog -->
        <q-dialog v-model="showCreateDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <CourseForm :loading="submitting" :error="error" @submit="handleCreate"
                    @cancel="showCreateDialog = false" />
            </div>
        </q-dialog>

        <!-- Edit Course Dialog -->
        <q-dialog v-model="showEditDialog" persistent>
            <div style="width: 600px; max-width: 90vw">
                <CourseForm v-if="selectedCourse" :course="selectedCourse" :loading="submitting" :error="error"
                    @submit="handleUpdate" @cancel="showEditDialog = false" />
            </div>
        </q-dialog>

        <!-- View Course Dialog -->
        <q-dialog v-model="showViewDialog" maximized>
            <q-card>
                <q-bar>
                    <div class="text-h6">Course Details</div>
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup />
                </q-bar>
                <q-card-section class="scroll" style="max-height: 80vh">
                    <CourseDetails v-if="selectedCourse" :course="selectedCourse" @edit="handleEditFromView"
                        @delete="handleDeleteFromView" />
                </q-card-section>
            </q-card>
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
import { useTraining } from 'src/composables/useTraining'
import { PageHeader } from 'src/components/.common'
import { CourseList, CourseForm, CourseDetails } from 'src/components/training'
import { ConfirmDialog } from 'src/components/.common'
import { TrainingCourse, CourseFilters, ProgressStatus } from 'src/models/entities/training/training.entity'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const {
    courses,
    selectedCourse,
    coursesLoading,
    coursesTotal,
    coursesPage,
    coursesLimit,
    progress,
    certifications,
    error,
    courseFilters,
    loadCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshData: refreshTrainingData,
} = useTraining()

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

// ============================================
// Computed
// ============================================
const completedCount = computed(() =>
    progress.value.filter(p => p.status === ProgressStatus.COMPLETED).length
)

const inProgressCount = computed(() =>
    progress.value.filter(p => p.status === ProgressStatus.IN_PROGRESS).length
)

const activeCertificationsCount = computed(() =>
    certifications.value.filter(c => c.isActive).length
)

const courseStats = computed(() => ({
    published: courses.value.filter(c => c.isPublished).length,
    total: courses.value.length,
}))

// ============================================
// Methods
// ============================================
async function loadData(): Promise<void> {
    loading.value = true
    try {
        await loadCourses()
    } catch (err) {
        console.error('Failed to load training data:', err)
    } finally {
        loading.value = false
    }
}

function handleFilter(newFilters: any): void {
    const filters: CourseFilters = {
        ...courseFilters.value,
        ...newFilters,
    }
    loadCourses(filters)
}

function handleSelect(course: TrainingCourse): void {
    selectedCourse.value = course
    showViewDialog.value = true
}

function handleEdit(course: TrainingCourse): void {
    selectedCourse.value = course
    showEditDialog.value = true
}

function handleEditFromView(): void {
    showViewDialog.value = false
    setTimeout(() => {
        if (selectedCourse.value) {
            showEditDialog.value = true
        }
    }, 300)
}

async function handleCreate(data: any): Promise<void> {
    submitting.value = true
    try {
        await createCourse(data)
        showCreateDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Course created successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to create course',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

async function handleUpdate(data: any): Promise<void> {
    if (!selectedCourse.value) return

    submitting.value = true
    try {
        await updateCourse(selectedCourse.value.uuid, data)
        showEditDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Course updated successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to update course',
            position: 'top',
        })
    } finally {
        submitting.value = false
    }
}

function handleDelete(course: TrainingCourse): void {
    confirmTitle.value = 'Delete Course'
    confirmMessage.value = `Are you sure you want to delete "${course.name}"? This action cannot be undone.`
    confirmType.value = 'delete'
    confirmLabel.value = 'Delete'
    pendingAction = async () => {
        await performDelete(course.uuid)
    }
    showConfirmDialog.value = true
}

function handleDeleteFromView(): void {
    showViewDialog.value = false
    setTimeout(() => {
        if (selectedCourse.value) {
            handleDelete(selectedCourse.value)
        }
    }, 300)
}

async function performDelete(uuid: string): Promise<void> {
    submitting.value = true
    try {
        await deleteCourse(uuid)
        showConfirmDialog.value = false
        $q.notify({
            type: 'positive',
            message: 'Course deleted successfully',
            position: 'top',
        })
        await loadData()
    } catch (err: any) {
        $q.notify({
            type: 'negative',
            message: err.message || 'Failed to delete course',
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
    await refreshTrainingData()
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
    loadData()
})
</script>

<style lang="scss" scoped>
.text-h4 {
    font-size: 1.75rem;

    @media (max-width: 400px) {
        font-size: 1.25rem;
    }
}
</style>