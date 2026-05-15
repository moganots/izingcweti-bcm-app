<template>
  <div class="file-uploader">
    <div
      class="upload-area q-pa-lg rounded-borders text-center cursor-pointer"
      :class="{ 'upload-area-active': isDragging, 'bg-negative-1 border-negative': hasError }"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        style="display: none"
        @change="onFileSelected"
      />
      <q-icon
        :name="isDragging ? 'cloud_done' : 'cloud_upload'"
        :size="iconSize"
        :color="isDragging ? 'primary' : 'grey-6'"
        class="q-mb-sm"
      />
      <p class="text-body1 q-mb-xs" :class="hasError ? 'text-negative' : 'text-grey-8'">
        {{ isDragging ? 'Drop files here' : uploadText }}
      </p>
      <p class="text-caption text-grey-6">{{ acceptText }}</p>
      <p v-if="maxSize" class="text-caption text-grey-6">Max size: {{ formatFileSize(maxSize) }}</p>
      <q-banner v-if="errorMessage" class="bg-negative-1 text-negative q-mt-sm" rounded dense>{{
        errorMessage
      }}</q-banner>
    </div>

    <div v-if="files.length > 0" class="file-list q-mt-md">
      <q-list bordered separator rounded>
        <q-item v-for="(file, index) in files" :key="index" class="q-pa-sm">
          <q-item-section avatar>
            <q-icon :name="getFileIcon(file.name)" :color="getFileColor(file.name)" size="24px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="ellipsis">{{ file.name }}</q-item-label>
            <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
            <q-linear-progress
              v-if="file.progress !== undefined && file.progress < 100"
              :value="file.progress / 100"
              color="primary"
              class="q-mt-xs"
            />
          </q-item-section>
          <q-item-section side>
            <q-icon v-if="file.status === 'uploading'" name="hourglass_top" color="orange" />
            <q-icon v-else-if="file.status === 'success'" name="check_circle" color="green" />
            <q-icon v-else-if="file.status === 'error'" name="error" color="negative"
              ><q-tooltip>{{ file.error }}</q-tooltip></q-icon
            >
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="close"
              color="grey"
              class="q-ml-sm"
              @click.stop="removeFile(index)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface UploadFile extends File {
  progress?: number
  status?: 'uploading' | 'success' | 'error'
  error?: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: UploadFile[]
    accept?: string
    maxSize?: number
    maxFiles?: number
    multiple?: boolean
    disabled?: boolean
    uploadText?: string
    iconSize?: string
  }>(),
  {
    modelValue: () => [],
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png',
    maxSize: 50 * 1024 * 1024,
    maxFiles: 10,
    multiple: false,
    disabled: false,
    uploadText: 'Click or drag files to upload',
    iconSize: '40px',
  }
)

const emit = defineEmits<{
  'update:modelValue': [files: UploadFile[]]
  upload: [files: UploadFile[]]
  error: [error: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const errorMessage = ref('')
const hasError = ref(false)
const files = ref<UploadFile[]>([])

const acceptText = computed(() =>
  props.accept
    .split(',')
    .map((ext) => ext.trim().replace('.', '').toUpperCase())
    .join(', ')
)

function triggerFileInput(): void {
  if (!props.disabled) fileInput.value?.click()
}
function onDragEnter(): void {
  if (!props.disabled) isDragging.value = true
}
function onDragOver(): void {
  if (!props.disabled) isDragging.value = true
}
function onDragLeave(): void {
  isDragging.value = false
}
function onDrop(event: DragEvent): void {
  isDragging.value = false
  if (props.disabled) return
  if (event.dataTransfer?.files) handleFiles(Array.from(event.dataTransfer.files))
}
function onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement
  if (input.files) handleFiles(Array.from(input.files))
}

function handleFiles(newFiles: File[]): void {
  errorMessage.value = ''
  hasError.value = false
  const validFiles: UploadFile[] = []
  for (const file of newFiles) {
    if (props.maxSize && file.size > props.maxSize) {
      errorMessage.value = `${file.name} exceeds max size`
      hasError.value = true
      continue
    }
    validFiles.push(file)
  }
  files.value = [...files.value, ...validFiles].slice(0, props.maxFiles)
  emit('update:modelValue', files.value)
  emit('upload', files.value)
}

function removeFile(index: number): void {
  files.value.splice(index, 1)
  emit('update:modelValue', files.value)
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const icons: Record<string, string> = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    xls: 'table_chart',
    xlsx: 'table_chart',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'gif',
  }
  return icons[ext] || 'insert_drive_file'
}

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const colors: Record<string, string> = {
    pdf: 'red',
    doc: 'blue',
    docx: 'blue',
    xls: 'green',
    xlsx: 'green',
    jpg: 'purple',
    png: 'purple',
  }
  return colors[ext] || 'grey'
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
</script>

<style lang="scss" scoped>
.upload-area {
  border: 2px dashed #ccc;
  transition: all 0.3s;
}
.upload-area:hover {
  border-color: var(--q-primary);
  background: #f0f4ff;
}
.upload-area-active {
  border-color: var(--q-primary);
  background: #e8f0fe;
}
</style>
