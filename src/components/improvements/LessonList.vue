<template>
    <div class="lesson-list">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
            <div>
                <div class="text-h6">Lessons Learned</div>
                <div class="text-caption text-grey-7">
                    {{ total }} lessons found
                </div>
            </div>
            <q-btn color="primary" icon="add" label="New Lesson" unelevated @click="$emit('create')" />
        </div>

        <!-- Filters -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
                <q-input v-model="filters.search" outlined dense placeholder="Search lessons..." clearable
                    @update:model-value="applyFilters">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-6 col-md-2">
                <q-select v-model="filters.status" :options="statusOptions" outlined dense placeholder="Status"
                    clearable multiple emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-6 col-md-2">
                <q-select v-model="filters.priority" :options="priorityOptions" outlined dense placeholder="Priority"
                    clearable multiple emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-6 col-md-2">
                <q-select v-model="filters.category" :options="categoryOptions" outlined dense placeholder="Category"
                    clearable multiple emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-6 col-md-2">
                <q-btn flat color="grey" label="Clear" class="full-width" @click="clearFilters" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="lessons.length === 0" class="text-center q-py-lg">
            <q-icon name="lightbulb" size="48px" color="grey-4" class="q-mb-sm" />
            <div class="text-h6 text-grey-7">No lessons found</div>
            <div class="text-caption text-grey-6">Capture your first lesson learned</div>
        </div>

        <!-- Lesson List -->
        <q-list v-else bordered separator>
            <q-item v-for="lesson in lessons" :key="lesson.uuid" clickable @click="$emit('select', lesson)"
                class="q-pa-md">
                <q-item-section>
                    <div class="row items-center q-gutter-sm">
                        <q-item-label class="text-weight-medium">
                            {{ lesson.title }}
                        </q-item-label>
                        <q-badge :color="getStatusColor(lesson.status)" :label="getStatusLabel(lesson.status)" />
                    </div>
                    <q-item-label caption class="q-mt-xs">
                        {{ getCategoryLabel(lesson.category) }}
                        <span class="q-mx-xs">•</span>
                        {{ getPriorityLabel(lesson.priority) }} Priority
                        <span class="q-mx-xs">•</span>
                        {{ getSourceLabel(lesson.source) }}
                        <span class="q-mx-xs">•</span>
                        {{ formatTimeAgo(lesson.identifiedAt) }}
                    </q-item-label>
                    <div v-if="lesson.tags?.length" class="q-mt-xs q-gutter-xs">
                        <q-badge v-for="tag in lesson.tags" :key="tag" color="grey-5" text-color="dark" :label="tag" />
                    </div>
                </q-item-section>
                <q-item-section side>
                    <div class="text-center">
                        <q-icon :name="getPriorityIcon(lesson.priority)" :color="getPriorityColor(lesson.priority)"
                            size="20px" />
                        <div class="text-caption text-grey-7">
                            {{ lesson.relatedActions?.length || 0 }} actions
                        </div>
                    </div>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat round dense icon="more_vert" @click.stop>
                        <q-menu>
                            <q-list dense>
                                <q-item clickable v-close-popup @click="$emit('view', lesson)">
                                    <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                                    <q-item-section>View</q-item-section>
                                </q-item>
                                <q-item clickable v-close-popup @click="$emit('edit', lesson)">
                                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                    <q-item-section>Edit</q-item-section>
                                </q-item>
                                <q-separator />
                                <q-item clickable v-close-popup @click="$emit('delete', lesson)">
                                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                                    <q-item-section class="text-negative">Delete</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </q-item-section>
            </q-item>
        </q-list>

        <!-- Pagination -->
        <div v-if="total! > limit!" class="row justify-center q-mt-md">
            <q-pagination v-model="filters.page" :max="totalPages" color="primary" @update:model-value="applyFilters" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Lesson, LessonStatus, LessonPriority, LessonCategory } from 'src/models/entities/improvements/lesson.entity'
import {
    getLessonStatusLabel,
    getLessonStatusColor,
    getLessonPriorityLabel,
    getLessonPriorityColor,
    getLessonPriorityIcon,
    getLessonCategoryLabel,
    getLessonSourceLabel,
} from 'src/models/entities/improvements/lesson.entity'
import { formatTimeAgo } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
const props = defineProps<{
    lessons: Lesson[]
    loading?: boolean
    total?: number
    page?: number
    limit?: number
}>()

// ============================================
// Emits
// ============================================
const emit = defineEmits<{
    'create': []
    'select': [lesson: Lesson]
    'view': [lesson: Lesson]
    'edit': [lesson: Lesson]
    'delete': [lesson: Lesson]
    'filter': [filters: any]
}>()

// ============================================
// State
// ============================================
const filters = reactive({
    search: '',
    status: [] as LessonStatus[],
    priority: [] as LessonPriority[],
    category: [] as LessonCategory[],
    page: props.page || 1,
})

// ============================================
// Computed
// ============================================
const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Action Planned', value: 'ACTION_PLANNED' },
    { label: 'Implemented', value: 'IMPLEMENTED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Rejected', value: 'REJECTED' },
]

const priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
]

const categoryOptions = [
    { label: 'Process', value: 'PROCESS' },
    { label: 'Technology', value: 'TECHNOLOGY' },
    { label: 'People', value: 'PEOPLE' },
    { label: 'Communication', value: 'COMMUNICATION' },
    { label: 'Leadership', value: 'LEADERSHIP' },
    { label: 'Training', value: 'TRAINING' },
    { label: 'Culture', value: 'CULTURE' },
    { label: 'Resources', value: 'RESOURCES' },
    { label: 'Compliance', value: 'COMPLIANCE' },
    { label: 'Other', value: 'OTHER' },
]

const totalPages = computed(() => {
    const total = props.total || 0
    const limit = props.limit || 10
    return Math.ceil(total / limit)
})

// ============================================
// Methods
// ============================================
function getStatusLabel(status: LessonStatus): string {
    return getLessonStatusLabel(status)
}

function getStatusColor(status: LessonStatus): string {
    return getLessonStatusColor(status)
}

function getPriorityLabel(priority: LessonPriority): string {
    return getLessonPriorityLabel(priority)
}

function getPriorityColor(priority: LessonPriority): string {
    return getLessonPriorityColor(priority)
}

function getPriorityIcon(priority: LessonPriority): string {
    return getLessonPriorityIcon(priority)
}

function getCategoryLabel(category: LessonCategory): string {
    return getLessonCategoryLabel(category)
}

function getSourceLabel(source: string): string {
    return getLessonSourceLabel(source as any)
}

function applyFilters(): void {
    emit('filter', { ...filters })
}

function clearFilters(): void {
    filters.search = ''
    filters.status = []
    filters.priority = []
    filters.category = []
    filters.page = 1
    applyFilters()
}
</script>

<style lang="scss" scoped>
.lesson-list {
    width: 100%;
}

.text-h6 {
    font-size: 1.125rem;

    @media (max-width: 400px) {
        font-size: 1rem;
    }
}
</style>