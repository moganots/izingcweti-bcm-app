<template>
    <div class="document-list">
        <!-- Search & Filter Bar -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-5">
                <q-input v-model="searchQuery" outlined dense placeholder="Search documents..." clearable
                    @update:model-value="handleSearch">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                    <template v-slot:append>
                        <q-icon name="filter_list" class="cursor-pointer" @click="showFilters = !showFilters">
                            <q-tooltip>Toggle Filters</q-tooltip>
                        </q-icon>
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-7 text-right">
                <q-btn color="primary" icon="add" label="Upload Document" unelevated @click="$emit('create')" />
            </div>
        </div>

        <!-- Filters -->
        <q-slide-transition>
            <div v-show="showFilters" class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-3">
                    <q-select v-model="filterType" :options="typeOptions" label="Document Type" outlined dense clearable
                        emit-value map-options @update:model-value="applyFilters" />
                </div>
                <div class="col-12 col-md-3">
                    <q-select v-model="filterStatus" :options="statusOptions" label="Status" outlined dense clearable
                        emit-value map-options @update:model-value="applyFilters" />
                </div>
                <div class="col-12 col-md-3">
                    <q-select v-model="filterAccess" :options="accessOptions" label="Access Level" outlined dense
                        clearable emit-value map-options @update:model-value="applyFilters" />
                </div>
                <div class="col-12 col-md-3">
                    <q-btn flat color="grey" label="Clear Filters" class="full-width" @click="clearFilters" />
                </div>
            </div>
        </q-slide-transition>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-md">
            <q-spinner-dots size="40px" color="primary" />
            <p class="text-grey-7 q-mt-sm">Loading documents...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredDocuments.length === 0" class="text-center q-py-xl">
            <q-icon name="folder" size="60px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No Documents Found</div>
            <p class="text-grey-6">
                {{ searchQuery ? 'No matching documents found' : 'Upload your first document' }}
            </p>
            <q-btn v-if="!searchQuery" color="primary" icon="add" label="Upload Document" @click="$emit('create')" />
        </div>

        <!-- Grid -->
        <div v-else class="row q-col-gutter-md">
            <div v-for="doc in paginatedDocuments" :key="doc.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
                <DocumentCard :document="doc" @click="$emit('select', doc)" @download="$emit('download', doc)"
                    @preview="$emit('preview', doc)" @edit="$emit('edit', doc)" @delete="$emit('delete', doc)" />
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredDocuments.length > 0" class="row justify-center q-mt-md">
            <q-pagination v-model="currentPage" :max="totalPages" :max-visible="5"
                @update:model-value="handlePageChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DocumentCard from './DocumentCard.vue'
import { DocumentType, DocumentStatus, AccessLevel } from './../../models/entities/document/document.entity'

const props = withDefaults(
    defineProps<{
        documents?: any[]
        loading?: boolean
        total?: number
        page?: number
        limit?: number
    }>(),
    {
        documents: () => [],
        loading: false,
        total: 0,
        page: 1,
        limit: 12,
    }
)

const emit = defineEmits<{
    create: []
    select: [doc: any]
    download: [doc: any]
    preview: [doc: any]
    edit: [doc: any]
    delete: [doc: any]
    'page-change': [page: number]
    search: [query: string]
    filter: [filters: any]
}>()

const searchQuery = ref('')
const filterType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const filterAccess = ref<string | null>(null)
const showFilters = ref(false)
const currentPage = ref(props.page)

const typeOptions = Object.values(DocumentType).map((value) => ({
    label: formatDocumentType(value),
    value,
}))

const statusOptions = Object.values(DocumentStatus).map((value) => ({
    label: formatDocumentStatus(value),
    value,
}))

const accessOptions = Object.values(AccessLevel).map((value) => ({
    label: formatAccessLevel(value),
    value,
}))

const filteredDocuments = computed(() => {
    let docs = props.documents

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        docs = docs.filter((d: any) =>
            d.title?.toLowerCase().includes(query) ||
            d.description?.toLowerCase().includes(query) ||
            d.tags?.some((t: string) => t.toLowerCase().includes(query))
        )
    }

    if (filterType.value) {
        docs = docs.filter((d: any) => d.documentType === filterType.value || d.document_type === filterType.value)
    }

    if (filterStatus.value) {
        docs = docs.filter((d: any) => d.status === filterStatus.value)
    }

    if (filterAccess.value) {
        docs = docs.filter((d: any) => d.accessLevel === filterAccess.value || d.access_level === filterAccess.value)
    }

    return docs
})

const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / props.limit))

const paginatedDocuments = computed(() => {
    const start = (currentPage.value - 1) * props.limit
    const end = start + props.limit
    return filteredDocuments.value.slice(start, end)
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

function formatDocumentStatus(status: string): string {
    const labels: Record<string, string> = {
        DRAFT: 'Draft',
        PUBLISHED: 'Published',
        ARCHIVED: 'Archived',
        UNDER_REVIEW: 'Under Review',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        EXPIRED: 'Expired',
        PENDING_APPROVAL: 'Pending Approval',
        UNDER_REVISION: 'Under Revision',
        SUPERSEDED: 'Superseded',
    }
    return labels[status] || status
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

function handleSearch(): void {
    currentPage.value = 1
    emit('search', searchQuery.value)
}

function applyFilters(): void {
    currentPage.value = 1
    emit('filter', {
        type: filterType.value,
        status: filterStatus.value,
        access: filterAccess.value,
    })
}

function clearFilters(): void {
    filterType.value = null
    filterStatus.value = null
    filterAccess.value = null
    applyFilters()
}

function handlePageChange(page: number): void {
    currentPage.value = page
    emit('page-change', page)
}

watch(() => props.page, (newPage) => {
    currentPage.value = newPage
})
</script>