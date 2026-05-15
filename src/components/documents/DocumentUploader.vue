<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ editing ? 'Update Document' : 'Upload Document' }}</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <!-- File Selection -->
        <FileUploader
          v-if="!editing"
          v-model="files"
          :accept="allowedTypes"
          :max-size="maxFileSize"
          :max-files="5"
          upload-text="Click or drag files to upload"
          @upload="onFilesSelected"
        />

        <!-- Current File Info (editing) -->
        <q-banner v-if="editing && document" class="bg-grey-1 rounded-borders">
          <template v-slot:avatar>
            <q-icon :name="getFileIcon(document.file_type)" size="24px" />
          </template>
          <div>
            <strong>{{ document.file_name }}</strong>
            <div class="text-caption">{{ formatFileSize(document.file_size) }}</div>
          </div>
        </q-banner>

        <q-input
          v-model="form.title"
          label="Document Title *"
          outlined
          dense
          :rules="[requiredRule]"
          autocomplete="off"
        />

        <q-input
          v-model="form.description"
          label="Description"
          outlined
          dense
          type="textarea"
          rows="2"
        />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select
              v-model="form.document_type"
              :options="documentTypeOptions"
              label="Document Type *"
              outlined
              dense
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="form.access_level"
              :options="accessLevelOptions"
              label="Access Level"
              outlined
              dense
            />
          </div>
        </div>

        <q-select
          v-model="form.tags"
          :options="tagOptions"
          label="Tags"
          outlined
          dense
          multiple
          use-chips
        />

        <q-input
          v-model="form.expires_at"
          label="Expiry Date"
          type="date"
          outlined
          dense
          clearable
        />

        <q-input
          v-model="form.metadata"
          label="Custom Metadata (JSON)"
          outlined
          dense
          type="textarea"
          rows="2"
          placeholder='{"key": "value"}'
        />

        <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
          {{ errorMessage }}
        </q-banner>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="primary"
              :label="editing ? 'Update' : 'Upload'"
              :loading="submitting"
              class="full-width"
              unelevated
              :disable="!editing && files.length === 0"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { formatFileSize } from '../../utils/formatters'
import FileUploader from '../.common/FileUploader.vue'

interface Props {
  editing?: boolean
  document?: any
  submitting?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  editing: false,
  document: null,
  submitting: false,
  errorMessage: '',
})

const emit = defineEmits<{
  submit: [data: FormData | Record<string, any>]
  cancel: []
}>()

const files = ref<File[]>([])
const form = reactive({
  title: '',
  description: '',
  document_type: '',
  access_level: 'INTERNAL',
  tags: [] as string[],
  expires_at: '',
  metadata: '',
})

const allowedTypes =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.json'
const maxFileSize = 50 * 1024 * 1024

const documentTypeOptions = [
  'BCM_POLICY',
  'RISK_ASSESSMENT',
  'BIA_REPORT',
  'BCP_DOCUMENT',
  'RECOVERY_STRATEGY',
  'TEST_RESULTS',
  'INCIDENT_REPORT',
  'COMPLIANCE_EVIDENCE',
  'TRAINING_MATERIAL',
  'AUDIT_REPORT',
  'EXERCISE_REPORT',
  'MEETING_MINUTES',
  'OTHER',
]

const accessLevelOptions = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']
const tagOptions = [
  'BCM',
  'Policy',
  'BIA',
  'BCP',
  'Risk',
  'Compliance',
  'Training',
  'Audit',
  'Incident',
]
const requiredRule = (val: any) => !!val || 'Required'

watch(
  () => props.document,
  (doc) => {
    if (doc && props.editing) {
      form.title = doc.title || ''
      form.description = doc.description || ''
      form.document_type = doc.document_type || ''
      form.access_level = doc.access_level || 'INTERNAL'
      form.tags = doc.tags || []
      form.expires_at = doc.expires_at || ''
    }
  },
  { immediate: true }
)

watch(
  () => files.value,
  (newFiles) => {
    if (newFiles.length > 0 && !form.title) {
      form.title = newFiles[0]!?.name!?.replace(/\.[^/.]+$/, '')
    }
  }
)

function onFilesSelected(selectedFiles: File[]): void {
  files.value = selectedFiles
}

function handleSubmit(): void {
  if (!form.title || !form.document_type) return

  if (!props.editing && files.value.length === 0) return

  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('document_type', form.document_type)
  formData.append('access_level', form.access_level)
  form.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag))
  if (form.expires_at) formData.append('expires_at', form.expires_at)
  if (form.metadata) formData.append('metadata', form.metadata)

  files.value.forEach((file) => {
    formData.append('files', file)
  })

  emit('submit', formData)
}

function getFileIcon(fileType: string): string {
  if (!fileType) return 'insert_drive_file'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('word')) return 'description'
  if (fileType.includes('excel')) return 'table_chart'
  if (fileType.includes('image')) return 'image'
  return 'insert_drive_file'
}
</script>
