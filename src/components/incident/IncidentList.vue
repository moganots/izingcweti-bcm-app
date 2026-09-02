<template>
    <div class="incident-list">
        <!-- Search & Filter Bar -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
                <q-input v-model="searchQuery" outlined dense placeholder="Search incidents..." clearable
                    @update:model-value="handleSearch">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterSeverity" :options="severityOptions" label="Severity" outlined dense clearable
                    emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterStatus" :options="statusOptions" label="Status" outlined dense clearable
                    emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-btn v-if="hasActiveFilters" flat color="grey" label="Clear Filters" class="full-width"
                    @click="clearFilters" />
            </div>
            <div class="col-12 col-md-2 text-right">
                <q-btn color="negative" icon="add" label="Report Incident" unelevated @click="$emit('create')" />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-md">
            <q-spinner-dots size="40px" color="primary" />
            <p class="text-grey-7 q-mt-sm">Loading incidents...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredIncidents.length === 0" class="text-center q-py-xl">
            <q-icon name="report" size="60px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No Incidents Found</div>
            <p class="text-grey-6">
                {{ searchQuery ? 'No matching incidents found' : 'No incidents reported yet' }}
            </p>
            <q-btn v-if="!searchQuery" color="negative" icon="add" label="Report Incident" @click="$emit('create')" />
        </div>

        <!-- Grid -->
        <div v-else class="row q-col-gutter-md">
            <div v-for="incident in paginatedIncidents" :key="incident.id" class="col-12 col-md-6 col-lg-4">
                <IncidentCard :incident="incident" @click="$emit('select', incident)" @close="$emit('close', incident)"
                    @escalate="$emit('escalate', incident)" />
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredIncidents.length > 0" class="row justify-center q-mt-md">
            <q-pagination v-model="currentPage" :max="totalPages" :max-visible="5"
                @update:model-value="handlePageChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IncidentCard from './IncidentCard.vue'
import {
    IncidentSeverity,
    IncidentStatus,
    getIncidentSeverityLabel,
    getIncidentStatusLabel,
} from './../../models/entities/incident/incident.entity'

const props = withDefaults(
    defineProps<{
        incidents?: any[]
        loading?: boolean
        total?: number
        page?: number
        limit?: number
    }>(),
    {
        incidents: () => [],
        loading: false,
        total: 0,
        page: 1,
        limit: 10,
    }
)

const emit = defineEmits<{
    create: []
    select: [incident: any]
    close: [incident: any]
    escalate: [incident: any]
    'page-change': [page: number]
    search: [query: string]
    filter: [filters: any]
}>()

const searchQuery = ref('')
const filterSeverity = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const currentPage = ref(props.page)

const severityOptions = Object.values(IncidentSeverity).map((value) => ({
    label: getIncidentSeverityLabel(value),
    value,
}))

const statusOptions = Object.values(IncidentStatus).map((value) => ({
    label: getIncidentStatusLabel(value),
    value,
}))

const hasActiveFilters = computed(() => {
    return !!(filterSeverity.value || filterStatus.value || searchQuery.value)
})

const filteredIncidents = computed(() => {
    let incidents = props.incidents

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        incidents = incidents.filter((i: any) =>
            i.rootCause?.toLowerCase().includes(query) ||
            i.incidentTitle?.toLowerCase().includes(query) ||
            i.root_cause?.toLowerCase().includes(query)
        )
    }

    if (filterSeverity.value) {
        incidents = incidents.filter((i: any) =>
            i.incidentSeverity === filterSeverity.value ||
            i.incident_severity === filterSeverity.value
        )
    }

    if (filterStatus.value) {
        incidents = incidents.filter((i: any) =>
            i.incidentStatus === filterStatus.value ||
            getStatusFromIncident(i) === filterStatus.value
        )
    }

    return incidents
})

const totalPages = computed(() => Math.ceil(filteredIncidents.value.length / props.limit))

const paginatedIncidents = computed(() => {
    const start = (currentPage.value - 1) * props.limit
    const end = start + props.limit
    return filteredIncidents.value.slice(start, end)
})

function getStatusFromIncident(incident: any): string {
    if (incident.closed_at) return 'CLOSED'
    if (incident.escalation_status === 'ESCALATED') return 'ESCALATED'
    return 'OPEN'
}

function handleSearch(): void {
    currentPage.value = 1
    emit('search', searchQuery.value)
}

function applyFilters(): void {
    currentPage.value = 1
    emit('filter', {
        severity: filterSeverity.value,
        status: filterStatus.value,
    })
}

function clearFilters(): void {
    filterSeverity.value = null
    filterStatus.value = null
    searchQuery.value = ''
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