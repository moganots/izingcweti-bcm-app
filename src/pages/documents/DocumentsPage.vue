<!-- src/pages/documents/DocumentsPage.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Documents</h4>
          <p class="text-grey-7 q-mb-none">Manage BCM documents and files</p>
        </div>
        <q-btn color="primary" icon="upload" label="Upload" unelevated @click="triggerUpload" />
        <input
          ref="fileInput"
          type="file"
          style="display: none"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.png"
          @change="handleFileSelected"
        />
      </div>
    </div>

    <!-- Search & Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filters.search"
              outlined
              dense
              placeholder="Search documents..."
              clearable
              debounce="300"
              @update:model-value="loadDocuments"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.document_type"
              outlined
              dense
              :options="documentTypeOptions"
              label="Type"
              clearable
              @update:model-value="loadDocuments"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filters.status"
              outlined
              dense
              :options="statusOptions"
              label="Status"
              clearable
              @update:model-value="loadDocuments"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filters.sortBy"
              outlined
              dense
              :options="sortOptions"
              label="Sort"
              emit-value
              map-options
              @update:model-value="loadDocuments"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
      <p class="text-grey-7 q-mt-md">Loading documents...</p>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="documents.length === 0"
      icon="folder_open"
      title="No Documents"
      description="Upload your first document to get started."
      :action="{ label: 'Upload Document', handler: triggerUpload }"
    />

    <!-- Document Grid -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="doc in documents" :key="doc.uuid" class="col-12 col-md-6 col-lg-4">
        <q-card class="document-card" flat bordered>
          <q-card-section>
            <!-- Document Type Icon -->
            <div class="row items-center q-mb-sm">
              <q-icon
                :name="getDocumentIcon(doc.file_type)"
                size="40px"
                :color="getDocumentColor(doc.document_type)"
              />
              <div class="q-ml-md col">
                <div class="text-h6 text-weight-medium ellipsis">{{ doc.title }}</div>
                <div class="text-caption text-grey-7">
                  {{ formatFileSize(doc.file_size) }} | v{{ doc.version_number }}
                </div>
              </div>
              <q-btn flat round size="sm" icon="more_vert">
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="downloadDocument(doc)">
                      <q-item-section avatar><q-icon name="download" /></q-item-section>
                      <q-item-section>Download</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="viewDocument(doc)">
                      <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                      <q-item-section>View</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="editDocument(doc)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item
                      v-if="doc.status === 'UNDER_REVIEW'"
                      clickable
                      v-close-popup
                      @click="approveDocument(doc)"
                    >
                      <q-item-section avatar><q-icon name="check" color="green" /></q-item-section>
                      <q-item-section>Approve</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="deleteDocument(doc)">
                      <q-item-section avatar
                        ><q-icon name="delete" color="negative"
                      /></q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <p v-if="doc.description" class="text-grey-7 text-body2 q-mb-sm ellipsis-2-lines">
              {{ doc.description }}
            </p>

            <q-separator class="q-mb-sm" />

            <!-- Meta Information -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-badge :color="getStatusColor(doc.status)" :label="doc.status" class="q-px-sm" />
              </div>
              <div class="col-6 text-right">
                <span class="text-caption text-grey-7">
                  <q-icon name="download" size="14px" />
                  {{ doc.download_count }}
                </span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="doc.tags?.length" class="q-mt-sm">
              <q-badge
                v-for="tag in doc.tags.slice(0, 3)"
                :key="tag"
                outline
                color="primary"
                :label="tag"
                class="q-mr-xs"
              />
            </div>

            <!-- Upload Info -->
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ formatDate(doc.created_at) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        direction-links
        color="primary"
        @update:model-value="loadDocuments"
      />
    </div>

    <!-- Upload Dialog -->
    <q-dialog v-model="showUploadDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Upload Document</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="uploadDocument" class="q-gutter-md">
            <div
              class="upload-area q-pa-lg text-center rounded-borders cursor-pointer"
              @click="triggerUpload"
            >
              <q-icon name="cloud_upload" size="50px" color="primary" />
              <p class="q-mt-sm q-mb-none">{{ selectedFile?.name || 'Click to select file' }}</p>
              <p class="text-caption text-grey-7">PDF, DOC, XLS, PPT, TXT, Images (Max 50MB)</p>
            </div>

            <q-input
              v-model="uploadForm.title"
              label="Document Title"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="uploadForm.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="2"
            />
            <q-select
              v-model="uploadForm.document_type"
              :options="documentTypeOptions"
              label="Document Type"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-select
              v-model="uploadForm.access_level"
              :options="accessLevelOptions"
              label="Access Level"
              outlined
              dense
            />
            <q-select
              v-model="uploadForm.tags"
              :options="tagOptions"
              label="Tags"
              outlined
              dense
              multiple
              use-chips
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="primary" label="Upload" :loading="isUploading" @click="uploadDocument" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { DocumentService } from '../../services/api/DocumentService'
import { Filesystem, Directory } from '@capacitor/filesystem'
import EmptyState from '../../components/common/EmptyState.vue'
import { formatDate } from '../../utils/formatters'

const $q = useQuasar()

const documents = ref<any[]>([])
const isLoading = ref(false)
const isUploading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const showUploadDialog = ref(false)
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

const filters = reactive({
  search: '',
  document_type: null,
  status: null,
  sortBy: 'created_at',
})

const uploadForm = reactive({
  title: '',
  description: '',
  document_type: '',
  access_level: 'INTERNAL',
  tags: [] as string[],
})

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

const statusOptions = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
]
const accessLevelOptions = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']
const tagOptions = ['BCM', 'Policy', 'BIA', 'BCP', 'Risk', 'Compliance', 'Training', 'Audit']
const sortOptions = [
  { label: 'Newest', value: 'created_at' },
  { label: 'Name', value: 'title' },
  { label: 'Type', value: 'document_type' },
  { label: 'Size', value: 'file_size' },
]

const requiredRule = (val: any) => !!val || 'Required'

onMounted(() => loadDocuments())

async function loadDocuments(): Promise<void> {
  isLoading.value = true
  try {
    const response = await DocumentService.getDocuments({
      ...filters,
      page: currentPage.value,
      limit: 12,
    })
    documents.value = response.data || []
    totalPages.value = response.totalPages || 1
  } catch (error) {
    console.error('Failed to load documents:', error)
    $q.notify({ type: 'negative', message: 'Failed to load documents' })
  } finally {
    isLoading.value = false
  }
}

function triggerUpload(): void {
  fileInput.value?.click()
}

function handleFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    selectedFile.value = input.files[0]
    uploadForm.title = input.files[0].name.replace(/\.[^/.]+$/, '')
    showUploadDialog.value = true
  }
}

async function uploadDocument(): Promise<void> {
  if (!selectedFile.value || !uploadForm.title || !uploadForm.document_type) {
    $q.notify({ type: 'negative', message: 'Please fill all required fields' })
    return
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description)
    formData.append('document_type', uploadForm.document_type)
    formData.append('access_level', uploadForm.access_level)
    uploadForm.tags.forEach((tag) => formData.append('tags[]', tag))

    await DocumentService.uploadDocument(formData)
    $q.notify({ type: 'positive', message: 'Document uploaded successfully' })
    showUploadDialog.value = false
    selectedFile.value = null
    await loadDocuments()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to upload document' })
  } finally {
    isUploading.value = false
  }
}

async function downloadDocument(doc: any): Promise<void> {
  try {
    const response = await DocumentService.downloadDocument(doc.uuid)
    const blob = new Blob([response.data], { type: doc.file_type })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    URL.revokeObjectURL(url)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to download document' })
  }
}

function viewDocument(doc: any): void {
  if (doc.file_type === 'application/pdf' || doc.file_type.startsWith('image/')) {
    window.open(doc.file_path, '_blank')
  } else {
    downloadDocument(doc)
  }
}

function editDocument(doc: any): void {
  uploadForm.title = doc.title
  uploadForm.description = doc.description
  uploadForm.document_type = doc.document_type
  uploadForm.access_level = doc.access_level
  uploadForm.tags = doc.tags || []
  showUploadDialog.value = true
}

async function approveDocument(doc: any): Promise<void> {
  try {
    await DocumentService.approveDocument(doc.uuid)
    $q.notify({ type: 'positive', message: 'Document approved' })
    await loadDocuments()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to approve document' })
  }
}

function deleteDocument(doc: any): void {
  $q.dialog({
    title: 'Delete Document',
    message: `Are you sure you want to delete "${doc.title}"?`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await DocumentService.deleteDocument(doc.uuid)
      $q.notify({ type: 'positive', message: 'Document deleted' })
      await loadDocuments()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete document' })
    }
  })
}

function getDocumentIcon(fileType: string): string {
  if (fileType?.includes('pdf')) return 'picture_as_pdf'
  if (fileType?.includes('word') || fileType?.includes('doc')) return 'description'
  if (fileType?.includes('excel') || fileType?.includes('sheet')) return 'table_chart'
  if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'slideshow'
  if (fileType?.includes('image')) return 'image'
  return 'insert_drive_file'
}

function getDocumentColor(type: string): string {
  const colors: Record<string, string> = {
    BCM_POLICY: 'red',
    RISK_ASSESSMENT: 'orange',
    BIA_REPORT: 'blue',
    BCP_DOCUMENT: 'green',
    COMPLIANCE_EVIDENCE: 'purple',
    TRAINING_MATERIAL: 'teal',
    AUDIT_REPORT: 'brown',
    INCIDENT_REPORT: 'deep-orange',
  }
  return colors[type] || 'grey'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'grey',
    PUBLISHED: 'green',
    ARCHIVED: 'orange',
    UNDER_REVIEW: 'blue',
    APPROVED: 'green',
    REJECTED: 'red',
    EXPIRED: 'brown',
  }
  return colors[status] || 'grey'
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
</script>

<style lang="scss" scoped>
.document-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}

.upload-area {
  border: 2px dashed var(--q-primary);
  background: var(--q-primary-light, #e3f2fd);
  &:hover {
    background: var(--q-primary-light-2, #bbdefb);
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
