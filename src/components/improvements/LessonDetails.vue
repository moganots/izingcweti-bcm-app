<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div>
                    <div class="text-h5">{{ lesson?.title }}</div>
                    <div class="text-subtitle2 text-grey-7">
                        Identified {{ formatTimeAgo(lesson?.identifiedAt) }}
                    </div>
                </div>
                <div class="row q-gutter-sm">
                    <q-btn flat color="primary" icon="edit" label="Edit" @click="$emit('edit')" />
                    <q-btn flat color="negative" icon="delete" label="Delete" @click="$emit('delete')" />
                </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Status Badges -->
            <div class="row q-gutter-sm q-mb-md">
                <q-badge :color="getStatusColor(lesson?.status || LessonStatus.DRAFT)"
                    :label="getStatusLabel(lesson?.status || LessonStatus.DRAFT)" size="lg" class="q-px-md q-py-sm" />
                <q-badge :color="getPriorityColor(lesson?.priority || LessonPriority.MEDIUM)"
                    :label="getPriorityLabel(lesson?.priority || LessonPriority.MEDIUM) + ' Priority'" size="lg"
                    class="q-px-md q-py-sm" />
                <q-badge color="grey-5" text-color="dark"
                    :label="getCategoryLabel(lesson?.category || LessonCategory.OTHER)" size="lg"
                    class="q-px-md q-py-sm" />
                <q-badge color="grey-5" text-color="dark" :label="getSourceLabel(lesson?.source || LessonSource.OTHER)"
                    size="lg" class="q-px-md q-py-sm" />
            </div>

            <!-- Content -->
            <q-list separator class="q-mb-md">
                <q-item>
                    <q-item-section avatar>
                        <q-icon name="description" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption>Description</q-item-label>
                        <q-item-label>{{ lesson?.description || 'No description provided' }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="warning" color="orange" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption class="text-orange">What Happened</q-item-label>
                        <q-item-label class="text-body1">{{ lesson?.whatHappened }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="lightbulb" color="yellow" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption class="text-yellow">Lesson Learned</q-item-label>
                        <q-item-label class="text-body1">{{ lesson?.lesson }}</q-item-label>
                    </q-item-section>
                </q-item>

                <q-item>
                    <q-item-section avatar>
                        <q-icon name="playlist_add_check" color="green" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label caption class="text-green">Recommended Actions</q-item-label>
                        <q-item-label class="text-body1">{{ lesson?.recommendedActions }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>

            <!-- Metadata -->
            <div class="row q-col-gutter-md q-mt-md">
                <div class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Identified By</div>
                    <div class="text-body2">{{ lesson?.identifiedByUser?.email || lesson?.identifiedBy || 'Unknown' }}
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Identified At</div>
                    <div class="text-body2">{{ formatDate(lesson?.identifiedAt) }}</div>
                </div>
                <div v-if="lesson?.implementedAt" class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Implemented At</div>
                    <div class="text-body2">{{ formatDate(lesson.implementedAt) }}</div>
                </div>
                <div v-if="lesson?.closedAt" class="col-6 col-md-3">
                    <div class="text-caption text-grey-7">Closed At</div>
                    <div class="text-body2">{{ formatDate(lesson.closedAt) }}</div>
                </div>
            </div>

            <div v-if="lesson?.effectivenessRating" class="q-mt-md">
                <div class="text-caption text-grey-7">Effectiveness Rating</div>
                <div class="row items-center q-gutter-sm">
                    <q-rating v-model="lesson.effectivenessRating" :max="5" readonly color="primary" />
                    <span class="text-body2">{{ lesson.effectivenessRating }} / 5</span>
                </div>
            </div>

            <!-- Related Actions -->
            <div v-if="lesson?.relatedActions?.length" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Related Actions</div>
                <q-list bordered dense>
                    <q-item v-for="actionId in lesson.relatedActions" :key="actionId">
                        <q-item-section avatar>
                            <q-icon name="check_circle" color="primary" size="16px" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-caption">Action: {{ actionId.substring(0, 8) }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>

            <!-- Tags -->
            <div v-if="lesson?.tags?.length" class="q-mt-md">
                <div class="text-caption text-grey-7 q-mb-sm">Tags</div>
                <div class="q-gutter-xs">
                    <q-badge v-for="tag in lesson.tags" :key="tag" color="grey-5" text-color="dark" :label="tag" />
                </div>
            </div>

            <!-- Review Notes -->
            <div v-if="lesson?.reviewNotes" class="q-mt-md">
                <div class="text-caption text-grey-7">Review Notes</div>
                <div class="text-body2 bg-grey-1 q-pa-md rounded-borders">
                    {{ lesson.reviewNotes }}
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import type { Lesson } from 'src/models/entities/improvements/lesson.entity'
import {
    getLessonStatusLabel,
    getLessonStatusColor,
    getLessonPriorityLabel,
    getLessonPriorityColor,
    getLessonCategoryLabel,
    getLessonSourceLabel,
    LessonStatus,
    LessonPriority,
    LessonCategory,
    LessonSource,
} from 'src/models/entities/improvements/lesson.entity'
import { formatDate, formatTimeAgo } from 'src/utils/date.utils'

// ============================================
// Props
// ============================================
defineProps<{
    lesson: Lesson | null
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

function getCategoryLabel(category: LessonCategory): string {
    return getLessonCategoryLabel(category)
}

function getSourceLabel(source: string): string {
    return getLessonSourceLabel(source as any)
}
</script>