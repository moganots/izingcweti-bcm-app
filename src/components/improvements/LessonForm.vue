<template>
    <q-card>
        <q-card-section>
            <div class="text-h6">{{ isEditing ? 'Edit Lesson' : 'Create Lesson' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                <!-- Title -->
                <q-input v-model="form.title" label="Title *" outlined dense :rules="[requiredRule]" autofocus
                    :disable="loading" />

                <!-- Description -->
                <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2"
                    :disable="loading" />

                <!-- What Happened -->
                <q-input v-model="form.whatHappened" label="What Happened *" outlined dense type="textarea" rows="3"
                    :rules="[requiredRule, minLengthRule(10)]" :disable="loading" />

                <!-- Lesson -->
                <q-input v-model="form.lesson" label="Lesson *" outlined dense type="textarea" rows="3"
                    :rules="[requiredRule, minLengthRule(10)]" :disable="loading" />

                <!-- Recommended Actions -->
                <q-input v-model="form.recommendedActions" label="Recommended Actions *" outlined dense type="textarea"
                    rows="3" :rules="[requiredRule, minLengthRule(10)]" :disable="loading" />

                <div class="row q-col-gutter-md">
                    <!-- Source -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.source" :options="sourceOptions" label="Source *" outlined dense
                            emit-value map-options :rules="[requiredRule]" :disable="loading" />
                    </div>

                    <!-- Priority -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.priority" :options="priorityOptions" label="Priority *" outlined dense
                            emit-value map-options :rules="[requiredRule]" :disable="loading" />
                    </div>
                </div>

                <div class="row q-col-gutter-md">
                    <!-- Category -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.category" :options="categoryOptions" label="Category *" outlined dense
                            emit-value map-options :rules="[requiredRule]" :disable="loading" />
                    </div>

                    <!-- Status -->
                    <div class="col-12 col-md-6">
                        <q-select v-model="form.status" :options="statusOptions" label="Status" outlined dense
                            emit-value map-options :disable="loading" />
                    </div>
                </div>

                <!-- Tags -->
                <q-select v-model="form.tags" :options="tagOptions" label="Tags" outlined dense multiple use-chips
                    use-input new-value-mode="add-unique" :disable="loading" />

                <!-- Error Display -->
                <q-banner v-if="error" class="bg-red-1 text-red-8 rounded-borders" rounded>
                    <template v-slot:avatar>
                        <q-icon name="error" color="red-8" />
                    </template>
                    {{ error }}
                </q-banner>

                <!-- Actions -->
                <div class="row q-col-gutter-md">
                    <div class="col-6">
                        <q-btn flat color="grey" :label="$t('common.cancel')" class="full-width" :disable="loading"
                            @click="$emit('cancel')" />
                    </div>
                    <div class="col-6">
                        <q-btn type="submit" color="primary"
                            :label="isEditing ? $t('common.update') : $t('common.create')" :loading="loading"
                            class="full-width" unelevated />
                    </div>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type {
    Lesson,
    LessonStatus,
    LessonSource,
    LessonPriority,
    LessonCategory,
    CreateLessonRequest,
    UpdateLessonRequest,
} from 'src/models/entities/improvements/lesson.entity'
import {
    getLessonStatusLabel,
    getLessonSourceLabel,
    getLessonPriorityLabel,
    getLessonCategoryLabel,
} from 'src/models/entities/improvements/lesson.entity'

// ============================================
// Props
// ============================================
const props = defineProps<{
    lesson?: Lesson
    loading?: boolean
    error?: string | null
}>()

// ============================================
// Emits
// ============================================
const emit = defineEmits<{
    submit: [data: CreateLessonRequest | UpdateLessonRequest]
    cancel: []
}>()

// ============================================
// State
// ============================================
const form = reactive({
    title: '',
    description: '',
    whatHappened: '',
    lesson: '',
    recommendedActions: '',
    source: null as LessonSource | null,
    priority: 'MEDIUM' as LessonPriority,
    category: 'OTHER' as LessonCategory,
    status: 'DRAFT' as LessonStatus,
    tags: [] as string[],
})

// ============================================
// Computed
// ============================================
const isEditing = computed(() => !!props.lesson?.uuid)

const sourceOptions = [
    { label: 'Incident', value: 'INCIDENT' },
    { label: 'Exercise', value: 'EXERCISE' },
    { label: 'Audit', value: 'AUDIT' },
    { label: 'External Benchmark', value: 'EXTERNAL_BENCHMARK' },
    { label: 'After Action Review', value: 'AFTER_ACTION_REVIEW' },
    { label: 'Stakeholder Feedback', value: 'STAKEHOLDER_FEEDBACK' },
    { label: 'Other', value: 'OTHER' },
].map(opt => ({
    ...opt,
    label: getLessonSourceLabel(opt.value as LessonSource),
}))

const priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
].map(opt => ({
    ...opt,
    label: getLessonPriorityLabel(opt.value as LessonPriority),
}))

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
].map(opt => ({
    ...opt,
    label: getLessonCategoryLabel(opt.value as LessonCategory),
}))

const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Action Planned', value: 'ACTION_PLANNED' },
    { label: 'Implemented', value: 'IMPLEMENTED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Rejected', value: 'REJECTED' },
].map(opt => ({
    ...opt,
    label: getLessonStatusLabel(opt.value as LessonStatus),
}))

const tagOptions = [
    'BCM', 'Risk', 'Incident', 'Exercise', 'Audit',
    'Training', 'Communication', 'Process', 'Technology',
    'Leadership', 'Culture', 'Resources',
]

// ============================================
// Rules
// ============================================
const requiredRule = (val: any) => !!val || 'This field is required'

const minLengthRule = (min: number) => (val: string) =>
    !val || val.length >= min || `Must be at least ${min} characters`

// ============================================
// Methods
// ============================================
function handleSubmit(): void {
    if (!form.title || !form.whatHappened || !form.lesson || !form.recommendedActions || !form.source) {
        return
    }

    const submitData = {
        title: form.title,
        description: form.description,
        whatHappened: form.whatHappened,
        lesson: form.lesson,
        recommendedActions: form.recommendedActions,
        source: form.source,
        priority: form.priority,
        category: form.category,
        status: form.status,
        ...(form.tags.length > 0 ? { tags: form.tags } : {}),
    }

    emit('submit', submitData)
}

// ============================================
// Watch for lesson changes
// ============================================
watch(
    () => props.lesson,
    (lesson) => {
        if (lesson) {
            form.title = lesson.title || ''
            form.description = lesson.description || ''
            form.whatHappened = lesson.whatHappened || ''
            form.lesson = lesson.lesson || ''
            form.recommendedActions = lesson.recommendedActions || ''
            form.source = lesson.source || null
            form.priority = lesson.priority || 'MEDIUM'
            form.category = lesson.category || 'OTHER'
            form.status = lesson.status || 'DRAFT'
            form.tags = lesson.tags || []
        }
    },
    { immediate: true }
)
</script>