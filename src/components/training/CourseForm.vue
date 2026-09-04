<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ isEditing ? 'Edit Course' : 'Create Course' }}</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <!-- Basic Info -->
        <q-input
          v-model="form.name"
          label="Course Name *"
          outlined
          dense
          :rules="[requiredRule]"
          autofocus
          :disable="loading"
        />

        <q-input
          v-model="form.description"
          label="Description"
          outlined
          dense
          type="textarea"
          rows="2"
          :disable="loading"
        />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="form.durationHours"
              label="Duration (hours)"
              type="number"
              outlined
              dense
              min="0"
              step="0.5"
              :disable="loading"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.level"
              :options="levelOptions"
              label="Level *"
              outlined
              dense
              emit-value
              map-options
              :rules="[requiredRule]"
              :disable="loading"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.status"
              :options="statusOptions"
              label="Status"
              outlined
              dense
              emit-value
              map-options
              :disable="loading"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.category"
              label="Category"
              outlined
              dense
              :disable="loading"
            />
          </div>
        </div>

        <!-- URLs -->
        <q-input
          v-model="form.contentUrl"
          label="Content URL"
          outlined
          dense
          type="url"
          :disable="loading"
        />
        <q-input
          v-model="form.thumbnailUrl"
          label="Thumbnail URL"
          outlined
          dense
          type="url"
          :disable="loading"
        />

        <!-- Features -->
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-checkbox
              v-model="form.isPublished"
              label="Published"
              color="primary"
              :disable="loading"
            />
          </div>
          <div class="col-6">
            <q-checkbox
              v-model="form.isFeatured"
              label="Featured"
              color="primary"
              :disable="loading"
            />
          </div>
          <div class="col-6">
            <q-checkbox
              v-model="form.isMandatory"
              label="Mandatory"
              color="primary"
              :disable="loading"
            />
          </div>
          <div class="col-6">
            <q-checkbox
              v-model="form.allowSelfEnrollment"
              label="Self Enrollment"
              color="primary"
              :disable="loading"
            />
          </div>
        </div>

        <!-- Tags -->
        <q-select
          v-model="form.tags"
          :options="tagOptions"
          label="Tags"
          outlined
          dense
          multiple
          use-chips
          use-input
          new-value-mode="add-unique"
          :disable="loading"
        />

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
            <q-btn
              flat
              color="grey"
              label="Cancel"
              class="full-width"
              :disable="loading"
              @click="$emit('cancel')"
            />
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="primary"
              :label="isEditing ? 'Update' : 'Create'"
              :loading="loading"
              class="full-width"
              unelevated
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type {
  TrainingCourse,
  CourseLevel,
  CourseStatus,
  CreateTrainingCourseRequest,
  UpdateTrainingCourseRequest,
} from 'src/models/entities/training/training.entity'
import {
  getCourseLevelLabel,
  getCourseStatusLabel,
} from 'src/models/entities/training/training.entity'

// ============================================
// Props
// ============================================
const props = defineProps<{
  course?: TrainingCourse
  loading?: boolean
  error?: string | null
}>()

// ============================================
// Emits
// ============================================
const emit = defineEmits<{
  submit: [data: CreateTrainingCourseRequest | UpdateTrainingCourseRequest]
  cancel: []
}>()

// ============================================
// State
// ============================================
const form = reactive({
  name: '',
  description: '',
  durationHours: 0,
  level: null as CourseLevel | null,
  status: 'DRAFT' as CourseStatus,
  category: '',
  contentUrl: '',
  thumbnailUrl: '',
  isPublished: false,
  isFeatured: false,
  isMandatory: false,
  allowSelfEnrollment: true,
  tags: [] as string[],
})

// ============================================
// Computed
// ============================================
const isEditing = computed(() => !!props.course?.uuid)

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

const tagOptions = [
  'BCM', 'Risk', 'Incident', 'Exercise', 'Audit',
  'Compliance', 'Training', 'Leadership',
]

// ============================================
// Rules
// ============================================
const requiredRule = (val: any) => !!val || 'This field is required'

// ============================================
// Methods
// ============================================
function handleSubmit(): void {
  if (!form.name || !form.level) return

  const submitData = {
    name: form.name,
    description: form.description,
    durationHours: form.durationHours || 0,
    level: form.level,
    status: form.status,
    isPublished: form.isPublished,
    isFeatured: form.isFeatured,
    isMandatory: form.isMandatory,
    allowSelfEnrollment: form.allowSelfEnrollment,
    ...(form.category ? { category: form.category } : {}),
    ...(form.contentUrl ? { contentUrl: form.contentUrl } : {}),
    ...(form.thumbnailUrl ? { thumbnailUrl: form.thumbnailUrl } : {}),
    ...(form.tags.length > 0 ? { tags: form.tags } : {}),
    ...(isEditing.value ? {} : { organisationId: 'current-org' }),
  }

  emit('submit', submitData)
}

// ============================================
// Watch for course changes
// ============================================
watch(
  () => props.course,
  (course) => {
    if (course) {
      form.name = course.name || ''
      form.description = course.description || ''
      form.durationHours = course.durationHours || 0
      form.level = course.level || null
      form.status = course.status || 'DRAFT'
      form.category = course.category || ''
      form.contentUrl = course.contentUrl || ''
      form.thumbnailUrl = course.thumbnailUrl || ''
      form.isPublished = course.isPublished || false
      form.isFeatured = course.isFeatured || false
      form.isMandatory = course.isMandatory || false
      form.allowSelfEnrollment = course.allowSelfEnrollment !== undefined ? course.allowSelfEnrollment : true
      form.tags = course.tags || []
    }
  },
  { immediate: true }
)
</script>