<template>
  <q-card class="document-card cursor-pointer" flat bordered @click="$emit('click', document)">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center q-mb-sm">
        <q-icon :name="getFileIcon(document.file_type)" size="40px" :color="getFileColor(document.document_type)" />
        <div class="q-ml-md col">
          <div class="text-h6 text-weight-medium ellipsis">{{ document.title }}</div>
          <div class="text-caption text-grey-7">
            {{ formatFileSize(document.file_size) }} | v{{ document.version_number }}
          </div>
        </div>
        <q-btn flat round size="sm" icon="more_vert" @click.stop>
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click="$emit('download', document)">
                <q-item-section avatar><q-icon name="download" /></q-item-section>
                <q-item-section>Download</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('preview', document)">
                <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                <q-item-section>Preview</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('edit', document)">
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', document)">
                <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Delete</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- Description -->
      <p v-if="document.description" class="text-grey-7 text-body2 q-mb-sm ellipsis-2-lines">
        {{ document.description }}
      </p>

      <q-separator class="q-mb-sm" />

      <!-- Meta -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <StatusBadge :status="document.status" type="document" />
        </div>
        <div class="col-6 text-right">
          <span class="text-caption text-grey-7">
            <q-icon name="download" size="14px" />
            {{ document.download_count || 0 }}
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="document.tags?.length" class="q-mt-sm">
        <q-badge v-for="tag in document.tags.slice(0, 3)" :key="tag" outline color="primary" :label="tag"
          class="q-mr-xs" />
        <q-badge v-if="document.tags.length > 3" outline color="grey" :label="'+' + (document.tags.length - 3)" />
      </div>

      <!-- Upload Info -->
      <div class="text-caption text-grey-6 q-mt-sm">
        {{ formatDate(document.created_at) }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatDate } from '../../utils/date.utils'
import { formatFileSize } from '../../utils/formatters'
import StatusBadge from '../.common/StatusBadge.vue'

defineProps<{ document: any }>()
defineEmits<{
  click: [document: any]
  download: [document: any]
  preview: [document: any]
  edit: [document: any]
  delete: [document: any]
}>()

function getFileIcon(fileType: string): string {
  if (!fileType) return 'insert_drive_file'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('word') || fileType.includes('document')) return 'description'
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'table_chart'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'slideshow'
  if (fileType.includes('image')) return 'image'
  if (fileType.includes('zip')) return 'folder_zip'
  if (fileType.includes('json')) return 'code'
  if (fileType.includes('text')) return 'text_snippet'
  return 'insert_drive_file'
}

function getFileColor(docType: string): string {
  const colors: Record<string, string> = {
    BCM_POLICY: 'red',
    RISK_ASSESSMENT: 'orange',
    BIA_REPORT: 'blue',
    BCP_DOCUMENT: 'green',
    RECOVERY_STRATEGY: 'purple',
    TEST_RESULTS: 'teal',
    INCIDENT_REPORT: 'deep-orange',
    COMPLIANCE_EVIDENCE: 'indigo',
    TRAINING_MATERIAL: 'cyan',
    AUDIT_REPORT: 'brown',
  }
  return colors[docType] || 'grey'
}
</script>

<style lang="scss" scoped>
.document-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
