<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 700px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">Upload Document</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <!-- Upload Area -->
                <div class="upload-area q-pa-lg rounded-borders text-center cursor-pointer" :class="{
                    'upload-area-active': isDragging,
                    'bg-negative-1 border-negative': hasError
                }" @dragenter.prevent="onDragEnter" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop" @click="triggerFileInput">
                    <input ref="fileInput" type="file" :accept="allowedTypes" multiple style="display: none"
                        @change="onFileSelected" />
                    <q-icon :name="isDragging ? 'cloud_done' : 'cloud_upload'" size="60px"
                        :color="isDragging ? 'primary' : 'grey-6'" class="q-mb-sm" />
                    <p class="text-body1 q-mb-xs" :class="hasError ? 'text-negative' : 'text-grey-8'">
                        {{ isDragging ? 'Drop files here' : 'Click or drag files to upload' }}
                    </p>
                    <p class="text-caption text-grey-6">PDF, Word, Excel, PowerPoint, Images, ZIP</p>
                    <p class="text-caption text-grey-6">Max size: 50MB per file</p>
                    <q-banner v-if="errorMessage" class="bg-negative-1 text-negative q-mt-sm" rounded dense>
                        {{ errorMessage }}
                    </q-banner>
                </div>

                <!-- File List -->
                <div v-if="uploadFiles.length > 0" class="q-mt-md">
                    <div class="text-subtitle2 q-mb-sm">Files to Upload ({{ uploadFiles.length }})</div>
                    <q-list bordered separator>
                        <q-item v-for="(file, index) in uploadFiles" :key="index">
                            <q-item-section avatar>
                                <q-icon :name="getFileIcon(file.name)" color="primary" size="24px" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="ellipsis">{{ file.name }}</q-item-label>
                                <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn flat round dense size="sm" icon="close" color="grey"
                                    @click="removeFile(index)" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Document Details -->
                <div class="q-mt-md">
                    <q-input v-model="form.title" label="Document Title *" outlined dense :rules="[requiredRule]" />

                    <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2" />

                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <q-select v-model="form.documentType" :options="documentTypeOptions" label="Document Type *"
                                outlined dense :rules="[requiredRule]" emit-value map-options />
                        </div>
                        <div class="col-6">
                            <q-select v-model="form.accessLevel" :options="accessLevelOptions" label="Access Level"
                                outlined dense emit-value map-options />
                        </div>
                    </div>

                    <q-select v-model="form.tags" :options="tagOptions" label="Tags" outlined dense multiple
                        use-chips />

                    <q-input v-model="form.expiresAt" label="Expiry Date" type="date" outlined dense clearable />

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>
                </div>

                <div class="row q-gutter-md q-mt-md">
                    <div class="col">
                        <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup
                            @click="$emit('cancel')" />
                    </div>
                    <div class="col">
                        <q-btn color="primary" label="Upload" :loading="uploading" class="full-width" unelevated
                            :disable="uploadFiles.length === 0 || !form.title || !form.documentType"
                            @click="handleUpload" />
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { formatFileSize } from '../../utils/formatters'
import { DocumentType, AccessLevel } from './../../models/entities/document/document.entity'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        uploading?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        uploading: false,
        errorMessage: '',
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    upload: [data: any]
    cancel: []
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const hasError = ref(false)

const uploadFiles = ref<File[]>([])
const form = reactive({
    title: '',
    description: '',
    documentType: null as string | null,
    accessLevel: 'INTERNAL',
    tags: [] as string[],
    expiresAt: null as string | null,
})

const allowedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip'
const maxFileSize = 50 * 1024 * 1024

const documentTypeOptions = Object.values(DocumentType).map((value) => ({
    label: formatDocumentType(value),
    value,
}))

const accessLevelOptions = Object.values(AccessLevel).map((value) => ({
    label: formatAccessLevel(value),
    value,
}))

const tagOptions = [
    'BCM', 'Policy', 'BIA', 'BCP', 'Risk', 'Compliance',
    'Training', 'Audit', 'Incident', 'Recovery', 'Test',
]

const requiredRule = (val: any) => !!val || 'This field is required'

function formatDocumentType(type: string): string {
    const labels: Record<string, string> = {
        BCM_POLICY: 'BCM Policy',
        RISK_ASSESSMENT: 'Risk Assessment',
        BIA_REPORT: 'BIA Report',
        BCP_DOCUMENT: 'BCP Document',
        RECOVERY_STRATEGY: 'Recovery Strategy',
        TEST_RESULTS: 'Test Results',
        INCIDENT_REPORT: 'Incident Report',
        COMPLIANCE_EVIDENCE: 'Compliance Evidence',
        TRAINING_MATERIAL: 'Training Material',
        AUDIT_REPORT: 'Audit Report',
        EXERCISE_REPORT: 'Exercise Report',
        MEETING_MINUTES: 'Meeting Minutes',
        PROCEDURE: 'Procedure',
        WORK_INSTRUCTION: 'Work Instruction',
        CONTACT_LIST: 'Contact List',
        VENDOR_CONTRACT: 'Vendor Contract',
        SLA_DOCUMENT: 'SLA Document',
        REGULATORY_DOCUMENT: 'Regulatory Document',
        CERTIFICATE: 'Certificate',
        GAP_ANALYSIS: 'Gap Analysis',
        IMPROVEMENT_PLAN: 'Improvement Plan',
        OTHER: 'Other',
    }
    return labels[type] || type
}

function formatAccessLevel(level: string): string {
    const labels: Record<string, string> = {
        PUBLIC: 'Public',
        INTERNAL: 'Internal',
        CONFIDENTIAL: 'Confidential',
        RESTRICTED: 'Restricted',
        PRIVATE: 'Private',
    }
    return labels[level] || level
}

function getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    const icons: Record<string, string> = {
        pdf: 'picture_as_pdf',
        doc: 'description',
        docx: 'description',
        xls: 'table_chart',
        xlsx: 'table_chart',
        ppt: 'slideshow',
        pptx: 'slideshow',
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        zip: 'folder_zip',
        txt: 'text_snippet',
    }
    return icons[ext] || 'insert_drive_file'
}

function triggerFileInput(): void {
    fileInput.value?.click()
}

function onDragEnter(): void {
    isDragging.value = true
}

function onDragOver(): void {
    isDragging.value = true
}

function onDragLeave(): void {
    isDragging.value = false
}

function onDrop(event: DragEvent): void {
    isDragging.value = false
    if (event.dataTransfer?.files) {
        handleFiles(Array.from(event.dataTransfer.files))
    }
}

function onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files) {
        handleFiles(Array.from(input.files))
    }
    input.value = ''
}

function handleFiles(newFiles: File[]): void {
    hasError.value = false
    const validFiles: File[] = []

    for (const file of newFiles) {
        if (file.size > maxFileSize) {
            hasError.value = true
            continue
        }
        validFiles.push(file)
    }

    uploadFiles.value = [...uploadFiles.value, ...validFiles]

    if (uploadFiles.value.length > 0 && !form.title) {
        form.title = uploadFiles.value[0]!.name!.replace(/\.[^/.]+$/, '')
    }
}

function removeFile(index: number): void {
    uploadFiles.value.splice(index, 1)
}

function handleUpload(): void {
    if (uploadFiles.value.length === 0 || !form.title || !form.documentType) return

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description || '')
    formData.append('documentType', form.documentType)
    formData.append('accessLevel', form.accessLevel)
    form.tags.forEach((tag) => formData.append('tags[]', tag))
    if (form.expiresAt) formData.append('expiresAt', form.expiresAt)
    uploadFiles.value.forEach((file) => formData.append('files', file))

    emit('upload', formData)
}
</script>

<style lang="scss" scoped>
.upload-area {
    border: 2px dashed #ccc;
    transition: all 0.3s;

    &:hover {
        border-color: var(--q-primary);
        background: #f0f4ff;
    }
}

.upload-area-active {
    border-color: var(--q-primary);
    background: #e8f0fe;
}
</style>