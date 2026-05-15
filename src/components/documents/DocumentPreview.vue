<template>
  <q-card flat bordered class="document-preview">
    <!-- Toolbar -->
    <q-bar class="bg-primary text-white">
      <div class="text-weight-medium ellipsis">{{ document?.title || 'Document Preview' }}</div>
      <q-space />
      <q-btn dense flat icon="download" @click="$emit('download', document)">
        <q-tooltip>Download</q-tooltip>
      </q-btn>
      <q-btn dense flat icon="fullscreen" @click="toggleFullscreen">
        <q-tooltip>Fullscreen</q-tooltip>
      </q-btn>
      <q-btn dense flat icon="close" @click="$emit('close')" />
    </q-bar>

    <!-- Content -->
    <q-card-section class="preview-content" :class="{ 'preview-fullscreen': fullscreen }">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-center" style="min-height: 300px">
        <q-spinner-dots size="40px" color="primary" />
        <p class="text-grey-7 q-mt-md">Loading preview...</p>
      </div>

      <!-- PDF Preview -->
      <iframe
        v-else-if="isPDF"
        :src="previewUrl"
        width="100%"
        :height="fullscreen ? '100vh' : '500px'"
        frameborder="0"
        class="preview-iframe"
      />

      <!-- Image Preview -->
      <div v-else-if="isImage" class="flex flex-center">
        <img
          :src="previewUrl"
          :alt="document?.file_name"
          class="preview-image"
          :class="{ 'preview-image-fullscreen': fullscreen }"
        />
      </div>

      <!-- Text Preview -->
      <pre v-else-if="isText" class="preview-text">{{ textContent }}</pre>

      <!-- Unsupported -->
      <div v-else class="flex flex-center text-center q-pa-xl" style="min-height: 300px">
        <div>
          <q-icon name="description" size="80px" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-7">Preview Not Available</div>
          <p class="text-grey-6">This file type cannot be previewed.</p>
          <q-btn
            color="primary"
            icon="download"
            label="Download to View"
            unelevated
            @click="$emit('download', document)"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Metadata -->
    <q-card-section v-if="document" class="bg-grey-1">
      <div class="row q-col-gutter-sm text-caption text-grey-7">
        <div class="col-6"><strong>File:</strong> {{ document.file_name }}</div>
        <div class="col-6"><strong>Size:</strong> {{ formatFileSize(document.file_size) }}</div>
        <div class="col-6"><strong>Type:</strong> {{ document.document_type }}</div>
        <div class="col-6"><strong>Version:</strong> {{ document.version_number }}</div>
        <div class="col-6"><strong>Status:</strong> {{ document.status }}</div>
        <div class="col-6"><strong>Downloads:</strong> {{ document.download_count || 0 }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatFileSize } from '../../utils/formatters'

const props = defineProps<{
  document?: any
  previewUrl?: string
  loading?: boolean
  textContent?: string
}>()

defineEmits<{
  download: [document: any]
  close: []
}>()

const fullscreen = ref(false)

const isPDF = computed(() => props.document?.file_type === 'application/pdf')
const isImage = computed(() => props.document?.file_type?.startsWith('image/'))
const isText = computed(
  () =>
    props.document?.file_type?.startsWith('text/') ||
    props.document?.file_type === 'application/json'
)

function toggleFullscreen(): void {
  fullscreen.value = !fullscreen.value
}
</script>

<style lang="scss" scoped>
.document-preview {
  border-radius: 12px;
  overflow: hidden;
}

.preview-content {
  padding: 0;
  min-height: 300px;
  background: #f5f5f5;
}

.preview-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
}

.preview-iframe {
  display: block;
  border: none;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.preview-image-fullscreen {
  max-height: 100vh;
  max-width: 100vw;
}

.preview-text {
  padding: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 13px;
  max-height: 500px;
  overflow-y: auto;
}
</style>
