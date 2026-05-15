<template>
  <q-page padding>
    <PageHeader
      title="Documents"
      subtitle="Manage BCM documents and files"
      show-refresh
      @refresh="loadDocuments"
    >
      <template #actions>
        <q-btn color="primary" icon="upload" label="Upload" unelevated @click="triggerUpload" />
        <input
          ref="fileInputRef"
          type="file"
          style="display: none"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.json"
          multiple
          @change="handleFileSelected"
        />
      </template>
    </PageHeader>

    <!-- Search & Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <SearchBar
              v-model="filters.search"
              placeholder="Search documents..."
              @search="loadDocuments"
            />
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
      <LoadingSpinner message="Loading documents..." />
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
        <DocumentCard
          :document="doc"
          @click="$router.push(`/documents/${doc.uuid}`)"
          @download="downloadDocument(doc)"
          @preview="viewDocument(doc)"
          @edit="editDocument(doc)"
          @delete="confirmDelete(doc)"
        />
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
          <DocumentUploader
            :submitting="isUploading"
            @submit="handleUploadSubmit"
            @cancel="showUploadDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreviewDialog" maximized>
      <DocumentPreview
        :document="previewDoc"
        :preview-url="previewUrl"
        @download="downloadDocument(previewDoc)"
        @close="showPreviewDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { documentService } from '../../services/api/DocumentService'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import DocumentCard from '../../components/documents/DocumentCard.vue'
import DocumentUploader from '../../components/documents/DocumentUploader.vue'
import DocumentPreview from '../../components/documents/DocumentPreview.vue'

const router = useRouter()
const $q = useQuasar()

// State
const documents = ref<any[]>([])
const isLoading = ref(false)
const isUploading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const showUploadDialog = ref(false)
const showPreviewDialog = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const previewDoc = ref<any>(null)
const previewUrl = ref('')

// Filters
const filters = reactive({
  search: '',
  document_type: null,
  status: null,
  sortBy: 'created_at',
})

// Options
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
const sortOptions = [
  { label: 'Newest', value: 'created_at' },
  { label: 'Name', value: 'title' },
  { label: 'Type', value: 'document_type' },
  { label: 'Size', value: 'file_size' },
]

// Lifecycle
onMounted(() => loadDocuments())

// Methods
async function loadDocuments(): Promise<void> {
  isLoading.value = true
  try {
    const response = await documentService.getDocuments({
      ...filters,
      page: currentPage.value,
      limit: 12,
    } as any)
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
  fileInputRef.value?.click()
}

function handleFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    showUploadDialog.value = true
    // Reset file input so the same file can be selected again
    input.value = ''
  }
}

async function handleUploadSubmit(document: any): Promise<void> {
  isUploading.value = true
  try {
    await documentService.uploadDocument(document)
    $q.notify({ type: 'positive', message: 'Document uploaded successfully' })
    showUploadDialog.value = false
    await loadDocuments()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to upload document' })
  } finally {
    isUploading.value = false
  }
}

async function downloadDocument(doc: any): Promise<void> {
  try {
    await documentService.downloadDocument(doc.uuid, doc.file_name)
    $q.notify({ type: 'info', message: 'Downloading...', timeout: 1500 })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to download document' })
  }
}

function viewDocument(doc: any): void {
  if (doc.file_type === 'application/pdf' || doc.file_type?.startsWith('image/')) {
    previewDoc.value = doc
    previewUrl.value = doc.file_path || ''
    showPreviewDialog.value = true
  } else {
    downloadDocument(doc)
  }
}

function editDocument(doc: any): void {
  // Navigate to detail page for editing
  router.push(`/documents/${doc.uuid}`)
}

function confirmDelete(doc: any): void {
  $q.dialog({
    title: 'Delete Document',
    message: `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await documentService.deleteDocument(doc.uuid)
      $q.notify({ type: 'positive', message: 'Document deleted' })
      await loadDocuments()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete document' })
    }
  })
}
</script>
