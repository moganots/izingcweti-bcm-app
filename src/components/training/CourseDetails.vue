<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div>
                    <div class="text-h5">{{ course?.name }}</div>
                    <div class="text-subtitle2 text-grey-7">
                        {{ getLevelLabel(course?.level || CourseLevel.BEGINNER) }}
                        <span class="q-mx-xs">•</span>
                        {{ getStatusLabel(course?.status || CourseStatus.DRAFT) }}
                    </div>
                </div>
                <div class="row q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit')" />
                    <q-btn flat color="negative" icon="delete" label="Delete" @click="$emit('delete')" />
                </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Stats -->
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6 col-md-3">
                    <div class="stat-card text-center">
                        <div class="stat-value">{{ course?.durationHours || 0 }}h</div>
                        <div class="stat-label">Duration</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-card text-center">
                        <div class="stat-value">{{ course?.enrollmentCount || 0 }}</div>
                        <div class="stat-label">Enrolled</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-card text-center">
                        <div class="stat-value">{{ course?.completionCount || 0 }}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-card text-center">
                        <div class="stat-value">{{ course?.averageRating || 0 }}</div>
                        <div class="stat-label">Rating</div>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div v-if="course?.description" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Description</div>
                <div class="text-body2">{{ course.description }}</div>
            </div>

            <!-- Modules -->
            <div v-if="course?.modules?.length" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Modules ({{ course.modules.length }})</div>
                <q-list bordered dense>
                    <q-item v-for="(module, index) in course.modules" :key="module.id">
                        <q-item-section avatar>
                            <q-badge color="primary" :label="index + 1" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ module.title }}</q-item-label>
                            <q-item-label caption>
                                {{ module.durationMinutes }} min
                                <span v-if="module.description" class="q-ml-sm">• {{ module.description }}</span>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>

            <!-- Tags -->
            <div v-if="course?.tags?.length" class="q-mt-md">
                <div class="text-caption text-grey-7 q-mb-sm">Tags</div>
                <div class="q-gutter-xs">
                    <q-badge v-for="tag in course.tags" :key="tag" color="grey-5" text-color="dark" :label="tag" />
                </div>
            </div>

            <!-- Features -->
            <div class="row q-gutter-sm q-mt-md">
                <q-chip v-if="course?.isFeatured" color="gold" text-color="dark" icon="star" size="sm">
                    Featured
                </q-chip>
                <q-chip v-if="course?.isMandatory" color="red" text-color="white" icon="warning" size="sm">
                    Mandatory
                </q-chip>
                <q-chip v-if="course?.isPublished" color="green" text-color="white" icon="check" size="sm">
                    Published
                </q-chip>
                <q-chip v-if="course?.allowSelfEnrollment" color="blue" text-color="white" icon="person_add" size="sm">
                    Self Enrollment
                </q-chip>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import type { TrainingCourse } from 'src/models/entities/training/training.entity'
import {
    getCourseLevelLabel,
    getCourseStatusLabel,
    CourseLevel,
    CourseStatus
} from 'src/models/entities/training/training.entity'

// ============================================
// Props
// ============================================
defineProps<{
    course: TrainingCourse | null
}>()

// ============================================
// Emits
// ============================================
defineEmits<{
    edit: []
    delete: []
}>()

// ============================================
// Methods
// ============================================
function getLevelLabel(level: CourseLevel): string {
    return getCourseLevelLabel(level)
}

function getStatusLabel(status: CourseStatus): string {
    return getCourseStatusLabel(status)
}
</script>

<style lang="scss" scoped>
.stat-card {
    padding: 12px;
    background: var(--bg-page);
    border-radius: 8px;

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 2px;
    }

    @media (max-width: 400px) {
        padding: 8px;

        .stat-value {
            font-size: 1.25rem;
        }

        .stat-label {
            font-size: 0.65rem;
        }
    }
}
</style>