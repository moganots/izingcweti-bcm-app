<template>
    <q-dialog v-model="dialogVisible" persistent>
        <q-card style="width: 600px; max-width: 90vw">
            <q-card-section>
                <div class="text-h6">
                    {{ isEditing ? 'Edit' : 'Upload' }} Document
                </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
                    <!-- File Upload -->
                    <FileUploader v-if="!isEditing" v-model="files" :accept="allowedTypes" :max-size="maxFileSize"
                        upload-text="Click or drag files to upload" @upload="onFilesSelected" />

                    <!-- Current File (editing) -->
                    <q-banner v-if="isEditing && document" class="bg-grey-1 rounded-borders">
                        <template v-slot:avatar>
                            <q-icon :name="getFileIcon(document.fileType || document.file_type)" size="24px" />
                        </template>
                        <div>
                            <strong>{{ document.fileName || document.file_name }}</strong>
                            <div class="text-caption">{{ formatFileSize(document.fileSize || document.file_size) }}
                            </div>
                        </div>
                    </q-banner>

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

                    <q-select v-model="form.tags" :options="tagOptions" label="Tags" outlined dense multiple use-chips
                        emit-value map-options />

                    <q-input v-model="form.expiresAt" label="Expiry Date" type="date" outlined dense clearable />

                    <q-input v-model="metadataInput" label="Custom Metadata (JSON)" outlined dense type="textarea"
                        rows="2" placeholder='{"key": "value"}' />

                    <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
                        {{ errorMessage }}
                    </q-banner>

                    <div class="row q-gutter-md">
                        <div class="col">
                            <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup
                                @click="$emit('cancel')" />
                        </div>
                        <div class="col">
                            <q-btn type="submit" color="primary" :label="isEditing ? 'Update' : 'Upload'"
                                :loading="submitting" class="full-width" unelevated
                                :disable="!isEditing && files.length === 0" />
                        </div>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { formatFileSize } from './../../utils/formatters'
import FileUploader from './../.common/FileUploader.vue'
import { DocumentType, AccessLevel } from './../../models/entities/document/document.entity'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        editing?: boolean
        document?: any
        submitting?: boolean
        errorMessage?: string
    }>(),
    {
        modelValue: false,
        editing: false,
        document: null,
        submitting: false,
        errorMessage: '',
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [data: any]
    cancel: []
}>()

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const isEditing = computed(() => props.editing || !!props.document?.id)

const files = ref<File[]>([])
const metadataInput = ref('')

const form = reactive({
    title: '',
    description: '',
    documentType: null as string | null,
    accessLevel: 'INTERNAL',
    tags: [] as string[],
    expiresAt: null as string | null,
})

const allowedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.json'
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
    'Procedure', 'Workflow', 'Emergency', 'Critical',
]

const requiredRule = (val: any) => !!val || 'This field is required'

watch(
    () => props.document,
    (doc) => {
        if (doc) {
            form.title = doc.title || ''
            form.description = doc.description || ''
            form.documentType = doc.documentType || doc.document_type || null
            form.accessLevel = doc.accessLevel || doc.access_level || 'INTERNAL'
            form.tags = doc.tags || []
            form.expiresAt = doc.expiresAt || doc.expires_at || null

            if (doc.metadata) {
                metadataInput.value = typeof doc.metadata === 'string'
                    ? doc.metadata
                    : JSON.stringify(doc.metadata, null, 2)
            }
        }
    },
    { immediate: true }
)

watch(files, (newFiles) => {
    if (newFiles.length > 0 && !form.title) {
        form.title = newFiles[0]!.name!.replace(/\.[^/.]+$/, '')
    }
})

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

function onFilesSelected(selectedFiles: File[]): void {
    files.value = selectedFiles
}

function getFileIcon(fileType: string): string {
    if (!fileType) return 'insert_drive_file'
    if (fileType.includes('pdf')) return 'picture_as_pdf'
    if (fileType.includes('word')) return 'description'
    if (fileType.includes('excel')) return 'table_chart'
    if (fileType.includes('image')) return 'image'
    return 'insert_drive_file'
}

function handleSubmit(): void {
    if (!form.title || !form.documentType) return
    if (!isEditing.value && files.value.length === 0) return

    let metadata = null
    if (metadataInput.value) {
        try {
            metadata = JSON.parse(metadataInput.value)
        } catch {
            // Invalid JSON, use as string
            metadata = metadataInput.value
        }
    }

    const submitData = {
        title: form.title,
        description: form.description,
        documentType: form.documentType,
        accessLevel: form.accessLevel,
        tags: form.tags,
        expiresAt: form.expiresAt,
        metadata,
        files: files.value,
    }

    emit('submit', submitData)
}
</script>