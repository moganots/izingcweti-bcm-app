<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading document..." />
    </div>

    <!-- Content -->
    <div v-else-if="document">
      <!-- Back Button -->
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to Documents"
        class="q-mb-md"
        @click="$router.push('/documents')"
      />

      <!-- Header -->
      <q-card class="q-mb-md" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="row items-center q-mb-sm">
                <q-icon
                  :name="getFileIcon(document.file_type)"
                  size="48px"
                  :color="getFileColor(document.document_type)"
                  class="q-mr-md"
                />
                <div>
                  <h5 class="text-h5 q-mb-xs">{{ document.title }}</h5>
                  <div class="row q-gutter-sm">
                    <StatusBadge :status="document.status" type="document" />
                    <q-badge outline color="primary" :label="'v' + document.version_number" />
                    <q-badge outline color="grey" :label="document.access_level" />
                  </div>
                </div>
              </div>
            </div>
            <div class="q-gutter-sm">
              <q-btn
                color="primary"
                icon="download"
                label="Download"
                unelevated
                @click="downloadDocument"
              />
              <q-btn
                outline
                color="primary"
                icon="edit"
                label="Edit"
                @click="showEditDialog = true"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Preview & Details Row -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Preview -->
        <div class="col-12 col-md-7">
          <DocumentPreview
            :document="document"
            :preview-url="previewUrl"
            :loading="previewLoading"
            @download="downloadDocument"
            @close="previewUrl = ''"
          />
        </div>

        <!-- Details -->
        <div class="col-12 col-md-5">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Document Details</div>
              <q-list separator>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Title</q-item-label
                    ><q-item-label>{{ document.title }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item v-if="document.description">
                  <q-item-section
                    ><q-item-label caption>Description</q-item-label
                    ><q-item-label>{{ document.description }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Type</q-item-label
                    ><q-item-label>{{ document.document_type }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Status</q-item-label
                    ><q-item-label
                      ><StatusBadge :status="document.status" type="document" /></q-item-label
                  ></q-item-section>
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Access Level</q-item-label
                    ><q-badge
                      :color="getAccessColor(document.access_level)"
                      :label="document.access_level"
                  /></q-item-section>
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>File Name</q-item-label
                    ><q-item-label class="text-caption">{{
                      document.file_name
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>File Type</q-item-label
                    ><q-item-label>{{ document.file_type }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>File Size</q-item-label
                    ><q-item-label>{{
                      formatFileSize(document.file_size)
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Version</q-item-label
                    ><q-item-label>{{ document.version_number }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Downloads</q-item-label
                    ><q-item-label>{{ document.download_count || 0 }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item v-if="document.checksum">
                  <q-item-section
                    ><q-item-label caption>Checksum (SHA-256)</q-item-label
                    ><q-item-label class="text-caption">{{
                      document.checksum
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item v-if="document.uploader">
                  <q-item-section
                    ><q-item-label caption>Uploaded By</q-item-label
                    ><q-item-label>{{
                      document.uploader?.email || 'Unknown'
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item>
                  <q-item-section
                    ><q-item-label caption>Uploaded At</q-item-label
                    ><q-item-label>{{
                      formatDateTime(document.created_at)
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item v-if="document.updated_at !== document.created_at">
                  <q-item-section
                    ><q-item-label caption>Last Updated</q-item-label
                    ><q-item-label>{{
                      formatDateTime(document.updated_at)
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item v-if="document.approved_at">
                  <q-item-section
                    ><q-item-label caption>Approved At</q-item-label
                    ><q-item-label>{{
                      formatDateTime(document.approved_at)
                    }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item v-if="document.expires_at">
                  <q-item-section
                    ><q-item-label caption>Expires At</q-item-label
                    ><q-item-label :class="isExpired ? 'text-negative' : ''">{{
                      formatDate(document.expires_at)
                    }}</q-item-label></q-item-section
                  >
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Tags -->
          <q-card v-if="document.tags?.length" flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Tags</div>
              <div class="q-gutter-sm">
                <q-badge
                  v-for="tag in document.tags"
                  :key="tag"
                  outline
                  color="primary"
                  :label="tag"
                  class="q-px-sm q-py-xs"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Approval Actions -->
      <div v-if="showApprovalActions" class="q-mb-md">
        <DocumentApprovalActions
          :document="document"
          @submit-review="submitForReview"
          @approve="approveDocument"
          @reject="rejectDocument"
          @publish="publishDocument"
          @archive="archiveDocument"
          @edit="showEditDialog = true"
        />
      </div>

      <!-- Version History -->
      <DocumentVersionHistory
        :versions="document.previous_versions"
        :current-version="document.version_number"
        @restore="restoreVersion"
        @download-version="downloadVersion"
      />
    </div>

    <!-- Not Found -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Document Not Found</h5>
      <q-btn color="primary" label="Back to Documents" @click="$router.push('/documents')" />
    </div>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Edit Document</div>
        </q-card-section>
        <q-card-section>
          <DocumentUploader
            :editing="true"
            :document="document"
            :submitting="saving"
            @submit="handleUpdate"
            @cancel="showEditDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { formatDate, formatDateTime } from '../../utils/date.utils'
import { formatFileSize } from '../../utils/formatters'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import StatusBadge from '../../components/.common/StatusBadge.vue'
import DocumentPreview from '../../components/documents/DocumentPreview.vue'
import DocumentApprovalActions from '../../components/documents/DocumentApprovalActions.vue'
import DocumentVersionHistory from '../../components/documents/DocumentVersionHistory.vue'
import DocumentUploader from '../../components/documents/DocumentUploader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// State
const document = ref<any>(null)
const isLoading = ref(true)
const previewLoading = ref(false)
const previewUrl = ref('')
const saving = ref(false)
const showEditDialog = ref(false)

// Computed
const isExpired = computed(() => {
  if (!document.value?.expires_at) return false
  return new Date(document.value.expires_at) < new Date()
})

const showApprovalActions = computed(() => {
  if (!document.value) return false
  return ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED'].includes(document.value.status)
})

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await loadDocument(id)
  }
})

// Methods
async function loadDocument(id: string): Promise<void> {
  isLoading.value = true
  try {
    // Simulate loading - replace with API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    document.value = {
      uuid: id,
      title: 'Sample Document',
      description: 'This is a sample document description.',
      document_type: 'BCP_DOCUMENT',
      status: 'PUBLISHED',
      access_level: 'INTERNAL',
      file_name: 'bcp-document.pdf',
      file_type: 'application/pdf',
      file_size: 2048576,
      file_path: '/uploads/sample.pdf',
      version_number: 3,
      download_count: 42,
      checksum: 'a1b2c3d4e5f6...',
      tags: ['BCP', 'Plan', '2025'],
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-05-01T14:20:00Z',
      approved_at: '2025-04-15T09:00:00Z',
      expires_at: '2026-01-15T00:00:00Z',
      uploader: { email: 'user@example.com' },
      previous_versions: [
        {
          version_number: 2,
          file_name: 'bcp-document-v2.pdf',
          file_size: 1900000,
          archived_at: '2025-04-01T00:00:00Z',
          checksum: 'b2c3d4...',
        },
        {
          version_number: 1,
          file_name: 'bcp-document-v1.pdf',
          file_size: 1500000,
          archived_at: '2025-02-01T00:00:00Z',
          checksum: 'c3d4e5...',
        },
      ],
    }
    isLoading.value = false
  } catch (error) {
    console.error('Failed to load document:', error)
    isLoading.value = false
  }
}

function downloadDocument(): void {
  if (document.value?.file_path) {
    $q.notify({ type: 'info', message: 'Downloading...' })
    window.open(document.value.file_path, '_blank')
  }
}

async function submitForReview(): Promise<void> {
  try {
    $q.notify({ type: 'positive', message: 'Submitted for review' })
    await loadDocument(document.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to submit' })
  }
}

async function approveDocument(comments: string): Promise<void> {
  try {
    $q.notify({ type: 'positive', message: 'Document approved' })
    await loadDocument(document.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to approve' })
  }
}

async function rejectDocument(reason: string): Promise<void> {
  try {
    $q.notify({ type: 'positive', message: 'Document rejected' })
    await loadDocument(document.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to reject' })
  }
}

async function publishDocument(): Promise<void> {
  try {
    $q.notify({ type: 'positive', message: 'Document published' })
    await loadDocument(document.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to publish' })
  }
}

async function archiveDocument(): Promise<void> {
  try {
    $q.notify({ type: 'positive', message: 'Document archived' })
    await loadDocument(document.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to archive' })
  }
}

async function handleUpdate(data: any): Promise<void> {
  saving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    $q.notify({ type: 'positive', message: 'Document updated' })
    showEditDialog.value = false
    await loadDocument(document.value.uuid)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to update' })
  } finally {
    saving.value = false
  }
}

async function restoreVersion(version: any): Promise<void> {
  $q.dialog({
    title: 'Restore Version',
    message: `Restore version ${version.version_number}? This will create a new version.`,
    cancel: true,
  }).onOk(async () => {
    try {
      $q.notify({ type: 'positive', message: `Version ${version.version_number} restored` })
      await loadDocument(document.value.uuid)
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to restore' })
    }
  })
}

function downloadVersion(version: any): void {
  $q.notify({ type: 'info', message: `Downloading version ${version.version_number}...` })
}

function getFileIcon(fileType: string): string {
  if (!fileType) return 'insert_drive_file'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('word')) return 'description'
  if (fileType.includes('excel')) return 'table_chart'
  if (fileType.includes('image')) return 'image'
  return 'insert_drive_file'
}

function getFileColor(docType: string): string {
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
  return colors[docType] || 'grey'
}

function getAccessColor(level: string): string {
  const colors: Record<string, string> = {
    PUBLIC: 'green',
    INTERNAL: 'blue',
    CONFIDENTIAL: 'orange',
    RESTRICTED: 'red',
  }
  return colors[level] || 'grey'
}
</script>
