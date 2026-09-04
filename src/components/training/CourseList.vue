<template>
    <div class="course-list">
        <!-- Header -->
        <div class="row items-center justify-between q-mb-md">
            <div>
                <div class="text-h6">Training Courses</div>
                <div class="text-caption text-grey-7">
                    {{ total }} courses found
                </div>
            </div>
            <q-btn color="primary" icon="add" label="New Course" unelevated @click="$emit('create')" />
        </div>

        <!-- Filters -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
                <q-input v-model="filters.search" outlined dense placeholder="Search courses..." clearable
                    @update:model-value="applyFilters">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-6 col-md-3">
                <q-select v-model="filters.level" :options="levelOptions" outlined dense placeholder="Level" clearable
                    emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-6 col-md-3">
                <q-select v-model="filters.status" :options="statusOptions" outlined dense placeholder="Status"
                    clearable emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-btn flat color="grey" label="Clear" class="full-width" @click="clearFilters" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="courses.length === 0" class="text-center q-py-lg">
            <q-icon name="school" size="48px" color="grey-4" class="q-mb-sm" />
            <div class="text-h6 text-grey-7">No courses found</div>
            <div class="text-caption text-grey-6">Create your first training course</div>
        </div>

        <!-- Course Cards -->
        <div class="row q-col-gutter-md">
            <div v-for="course in courses" :key="course.uuid" class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="course-card" clickable @click="$emit('select', course)">
                    <q-card-section>
                        <div class="row items-center q-gutter-sm">
                            <q-badge :color="getLevelColor(course.level)" :label="getLevelLabel(course.level)" />
                            <q-badge v-if="course.isFeatured" color="gold" label="Featured" />
                            <q-badge v-if="course.isMandatory" color="red" label="Mandatory" />
                        </div>
                        <div class="text-h6 q-mt-sm">{{ course.name }}</div>
                        <div class="text-caption text-grey-7 ellipsis-2-lines">
                            {{ course.description || 'No description' }}
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <div class="row q-col-gutter-sm text-caption text-grey-7">
                            <div class="col-6">
                                <q-icon name="schedule" size="14px" />
                                {{ course.durationHours }}h {{ course.durationMinutes }}m
                            </div>
                            <div class="col-6">
                                <q-icon name="people" size="14px" />
                                {{ course.enrollmentCount || 0 }} enrolled
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat dense color="primary" :label="course.isPublished ? 'View' : 'Draft'"
                            @click.stop="$emit('select', course)" />
                        <q-btn flat round dense icon="more_vert" @click.stop>
                            <q-menu>
                                <q-list dense>
                                    <q-item clickable v-close-popup @click="$emit('edit', course)">
                                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                        <q-item-section>Edit</q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click="$emit('delete', course)">
                                        <q-item-section avatar><q-icon name="delete"
                                                color="negative" /></q-item-section>
                                        <q-item-section class="text-negative">Delete</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-card-actions>
                </q-card>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="total! > limit!" class="row justify-center q-mt-md">
            <q-pagination v-model="filters.page" :max="totalPages" color="primary" @update:model-value="applyFilters" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { TrainingCourse, CourseLevel, CourseStatus } from 'src/models/entities/training/training.entity'
import {
    getCourseLevelLabel,
    getCourseLevelColor,
    getCourseStatusLabel,
} from 'src/models/entities/training/training.entity'

// ============================================
// Props
// ============================================
const props = defineProps<{
    courses: TrainingCourse[]
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
    'select': [course: TrainingCourse]
    'edit': [course: TrainingCourse]
    'delete': [course: TrainingCourse]
    'filter': [filters: any]
}>()

// ============================================
// State
// ============================================
const filters = reactive({
    search: '',
    level: null as CourseLevel | null,
    status: null as CourseStatus | null,
    page: props.page || 1,
})

// ============================================
// Computed
// ============================================
const levelOptions = [
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Expert', value: 'EXPERT' },
].map(opt => ({
    ...opt,
    label: getCourseLevelLabel(opt.value as CourseLevel),
}))

const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Archived', value: 'ARCHIVED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Suspended', value: 'SUSPENDED' },
].map(opt => ({
    ...opt,
    label: getCourseStatusLabel(opt.value as CourseStatus),
}))

const totalPages = computed(() => {
    const total = props.total || 0
    const limit = props.limit || 10
    return Math.ceil(total / limit)
})

// ============================================
// Methods
// ============================================
function getLevelLabel(level: CourseLevel): string {
    return getCourseLevelLabel(level)
}

function getLevelColor(level: CourseLevel): string {
    return getCourseLevelColor(level)
}

function applyFilters(): void {
    emit('filter', { ...filters })
}

function clearFilters(): void {
    filters.search = ''
    filters.level = null
    filters.status = null
    filters.page = 1
    applyFilters()
}
</script>

<style lang="scss" scoped>
.course-card {
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
}

.ellipsis-2-lines {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.text-h6 {
    font-size: 1.125rem;

    @media (max-width: 400px) {
        font-size: 1rem;
    }
}
</style>