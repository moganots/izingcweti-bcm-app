<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="Back to Documents"
      class="q-mb-md"
      @click="$router.push('/documents')"
    />

    <div class="upload-container">
      <div class="row q-col-gutter-md">
        <!-- Upload Form -->
        <div class="col-12 col-md-8">
          <DocumentUploader
            :submitting="uploading"
            :error-message="errorMessage"
            @submit="handleUpload"
            @cancel="$router.push('/documents')"
          />
        </div>

        <!-- Upload Guidelines -->
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Upload Guidelines</div>
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" size="sm" />
                  </q-item-section>
                  <q-item-section>Maximum file size: 50 MB</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, GIF,
                    ZIP, JSON
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="green" size="sm" />
                  </q-item-section>
                  <q-item-section>Multiple files can be uploaded at once</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" color="blue" size="sm" />
                  </q-item-section>
                  <q-item-section>Documents are automatically versioned</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" color="blue" size="sm" />
                  </q-item-section>
                  <q-item-section
                    >Confidential documents should be marked accordingly</q-item-section
                  >
                </q-item>
              </q-list>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Document Types</div>
              <q-list dense>
                <q-item v-for="type in documentTypeDescriptions" :key="type.value">
                  <q-item-section>
                    <q-item-label class="text-caption">{{ type.label }}</q-item-label>
                    <q-item-label caption>{{ type.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Recent Uploads -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Recent Uploads</div>
              <q-list dense separator>
                <q-item
                  v-for="doc in recentUploads"
                  :key="doc.uuid"
                  clickable
                  @click="$router.push(`/documents/${doc.uuid}`)"
                >
                  <q-item-section avatar>
                    <q-icon :name="getFileIcon(doc.file_type)" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption ellipsis">{{ doc.title }}</q-item-label>
                    <q-item-label caption>{{ formatTimeAgo(doc.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <div
                v-if="recentUploads.length === 0"
                class="text-center q-py-sm text-grey-7 text-caption"
              >
                No recent uploads
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { formatTimeAgo } from '../../utils/date.utils'
import DocumentUploader from '../../components/documents/DocumentUploader.vue'
import { documentService } from 'src/services/api/DocumentService'

const router = useRouter()
const $q = useQuasar()

// State
const uploading = ref(false)
const errorMessage = ref('')
const recentUploads = ref<any[]>([])

// Document type descriptions
const documentTypeDescriptions = [
  { value: 'BCM_POLICY', label: 'BCM Policy', description: 'Official BCM policy documents' },
  {
    value: 'RISK_ASSESSMENT',
    label: 'Risk Assessment',
    description: 'Risk analysis and evaluation reports',
  },
  { value: 'BIA_REPORT', label: 'BIA Report', description: 'Business Impact Analysis reports' },
  { value: 'BCP_DOCUMENT', label: 'BCP Document', description: 'Business Continuity Plans' },
  {
    value: 'RECOVERY_STRATEGY',
    label: 'Recovery Strategy',
    description: 'Recovery strategy documentation',
  },
  {
    value: 'TEST_RESULTS',
    label: 'Test Results',
    description: 'Exercise test results and findings',
  },
  {
    value: 'INCIDENT_REPORT',
    label: 'Incident Report',
    description: 'Incident documentation and reports',
  },
  {
    value: 'COMPLIANCE_EVIDENCE',
    label: 'Compliance Evidence',
    description: 'Evidence for compliance audits',
  },
  { value: 'TRAINING_MATERIAL', label: 'Training Material', description: 'BCM training resources' },
  {
    value: 'AUDIT_REPORT',
    label: 'Audit Report',
    description: 'Internal and external audit reports',
  },
  {
    value: 'EXERCISE_REPORT',
    label: 'Exercise Report',
    description: 'Exercise test documentation',
  },
  { value: 'MEETING_MINUTES', label: 'Meeting Minutes', description: 'BCM meeting minutes' },
  { value: 'OTHER', label: 'Other', description: 'Other BCM-related documents' },
]

/**
 * Handle document upload submission
 */
async function handleUpload(document: any): Promise<void> {
  uploading.value = true
  errorMessage.value = ''

  try {
    await documentService.uploadDocument(document, (progress) => {
      console.log(`Upload progress: ${progress}%`)
    })

    $q.notify({
      type: 'positive',
      message: 'Document uploaded successfully!',
      timeout: 3000,
    })

    // Navigate back to documents list
    router.push('/documents')
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Upload failed'
    errorMessage.value = message
    $q.notify({
      type: 'negative',
      message: 'Failed to upload document',
      caption: message,
      timeout: 5000,
    })
  } finally {
    uploading.value = false
  }
}

/**
 * Get icon for file type
 */
function getFileIcon(fileType: string): string {
  if (!fileType) return 'insert_drive_file'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('word') || fileType.includes('document')) return 'description'
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'table_chart'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'slideshow'
  if (fileType.includes('image')) return 'image'
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'folder_zip'
  if (fileType.includes('json')) return 'code'
  if (fileType.includes('text')) return 'text_snippet'
  if (fileType.includes('csv')) return 'table_chart'
  return 'insert_drive_file'
}
</script>

<style lang="scss" scoped>
.upload-container {
  max-width: 1200px;
  margin: 0 auto;
}

.q-item__section--avatar {
  min-width: 36px;
}
</style>
