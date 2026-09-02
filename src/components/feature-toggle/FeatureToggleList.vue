<template>
    <div class="feature-toggle-list">
        <!-- Search & Filter Bar -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
                <q-input v-model="searchQuery" outlined dense placeholder="Search feature toggles..." clearable
                    @update:model-value="handleSearch">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterStatus" :options="statusOptions" label="Status" outlined dense clearable
                    emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterType" :options="typeOptions" label="Type" outlined dense clearable emit-value
                    map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterEnvironment" :options="environmentOptions" label="Environment" outlined dense
                    clearable emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2 text-right">
                <q-btn color="primary" icon="add" label="Create Toggle" unelevated @click="$emit('create')" />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-md">
            <q-spinner-dots size="40px" color="primary" />
            <p class="text-grey-7 q-mt-sm">Loading feature toggles...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredToggles.length === 0" class="text-center q-py-xl">
            <q-icon name="toggle_off" size="60px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No Feature Toggles Found</div>
            <p class="text-grey-6">
                {{ searchQuery ? 'No matching toggles found' : 'Create your first feature toggle' }}
            </p>
            <q-btn v-if="!searchQuery" color="primary" icon="add" label="Create Toggle" @click="$emit('create')" />
        </div>

        <!-- List -->
        <div v-else>
            <q-list bordered separator>
                <q-item v-for="toggle in paginatedToggles" :key="toggle.id" clickable @click="$emit('select', toggle)">
                    <q-item-section avatar>
                        <q-icon :name="isToggleActive(toggle) ? 'toggle_on' : 'toggle_off'"
                            :color="isToggleActive(toggle) ? 'green' : 'grey'" size="32px" />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label class="text-weight-medium">{{ toggle.name }}</q-item-label>
                        <q-item-label caption>
                            {{ toggle.description || 'No description' }}
                        </q-item-label>
                        <q-item-label caption class="q-mt-xs">
                            <q-badge :color="getStatusColor(toggle.status)" :label="formatStatus(toggle.status)" />
                            <q-badge v-if="toggle.environment" :color="getEnvironmentColor(toggle.environment)"
                                :label="formatEnvironment(toggle.environment)" outline class="q-ml-sm" />
                            <span class="q-ml-sm">
                                <q-icon name="people" size="14px" />
                                {{ toggle.evaluation_count || 0 }} evaluations
                            </span>
                            <span class="q-ml-sm">
                                <q-icon name="trending_up" size="14px" />
                                {{ getTrueRate(toggle) }}% true
                            </span>
                        </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        <div class="q-gutter-xs">
                            <q-btn flat round size="sm" :icon="isToggleActive(toggle) ? 'pause' : 'play_arrow'"
                                :color="isToggleActive(toggle) ? 'orange' : 'green'"
                                @click.stop="$emit('toggle-status', toggle)">
                                <q-tooltip>
                                    {{ isToggleActive(toggle) ? 'Deactivate' : 'Activate' }}
                                </q-tooltip>
                            </q-btn>
                            <q-btn flat round size="sm" icon="more_vert" @click.stop>
                                <q-menu>
                                    <q-list dense>
                                        <q-item clickable v-close-popup @click="$emit('edit', toggle)">
                                            <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                            <q-item-section>Edit</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup @click="$emit('evaluate', toggle)">
                                            <q-item-section avatar><q-icon name="science" /></q-item-section>
                                            <q-item-section>Evaluate</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup @click="$emit('audit', toggle)">
                                            <q-item-section avatar><q-icon name="history" /></q-item-section>
                                            <q-item-section>Audit Log</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup @click="$emit('overrides', toggle)">
                                            <q-item-section avatar><q-icon name="rule" /></q-item-section>
                                            <q-item-section>Overrides</q-item-section>
                                        </q-item>
                                        <q-separator />
                                        <q-item clickable v-close-popup @click="$emit('delete', toggle)">
                                            <q-item-section avatar><q-icon name="delete"
                                                    color="negative" /></q-item-section>
                                            <q-item-section class="text-negative">Delete</q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </q-list>

            <!-- Pagination -->
            <div class="row justify-center q-mt-md">
                <q-pagination v-model="currentPage" :max="totalPages" :max-visible="5"
                    @update:model-value="handlePageChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    FeatureToggleStatus,
    FeatureToggleType,
    ToggleEnvironment,
    getFeatureToggleStatusLabel,
    getFeatureToggleStatusColor,
    getToggleEnvironmentLabel,
    getToggleEnvironmentColor,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

const props = withDefaults(
    defineProps<{
        toggles?: any[]
        loading?: boolean
        total?: number
        page?: number
        limit?: number
    }>(),
    {
        toggles: () => [],
        loading: false,
        total: 0,
        page: 1,
        limit: 10,
    }
)

const emit = defineEmits<{
    create: []
    select: [toggle: any]
    edit: [toggle: any]
    delete: [toggle: any]
    'toggle-status': [toggle: any]
    evaluate: [toggle: any]
    audit: [toggle: any]
    overrides: [toggle: any]
    'page-change': [page: number]
    search: [query: string]
    filter: [filters: any]
}>()

const searchQuery = ref('')
const filterStatus = ref<string | null>(null)
const filterType = ref<string | null>(null)
const filterEnvironment = ref<string | null>(null)
const currentPage = ref(props.page)

const statusOptions = Object.values(FeatureToggleStatus).map((value) => ({
    label: getFeatureToggleStatusLabel(value),
    value,
}))

const typeOptions = Object.values(FeatureToggleType).map((value) => ({
    label: formatToggleType(value),
    value,
}))

const environmentOptions = Object.values(ToggleEnvironment).map((value) => ({
    label: getToggleEnvironmentLabel(value),
    value,
}))

const filteredToggles = computed(() => {
    let toggles = props.toggles

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        toggles = toggles.filter((t: any) =>
            t.name?.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query)
        )
    }

    if (filterStatus.value) {
        toggles = toggles.filter((t: any) => t.status === filterStatus.value)
    }

    if (filterType.value) {
        toggles = toggles.filter((t: any) => t.toggleType === filterType.value || t.toggle_type === filterType.value)
    }

    if (filterEnvironment.value) {
        toggles = toggles.filter((t: any) => t.environment === filterEnvironment.value)
    }

    return toggles
})

const totalPages = computed(() => Math.ceil(filteredToggles.value.length / props.limit))

const paginatedToggles = computed(() => {
    const start = (currentPage.value - 1) * props.limit
    const end = start + props.limit
    return filteredToggles.value.slice(start, end)
})

function formatStatus(status: string): string {
    return getFeatureToggleStatusLabel(status)
}

function getStatusColor(status: string): string {
    return getFeatureToggleStatusColor(status)
}

function formatEnvironment(environment: string): string {
    return getToggleEnvironmentLabel(environment)
}

function getEnvironmentColor(environment: string): string {
    return getToggleEnvironmentColor(environment)
}

function formatToggleType(type: string): string {
    const labels: Record<string, string> = {
        RELEASE: 'Release',
        EXPERIMENT: 'Experiment',
        OPERATIONAL: 'Operational',
        PERMISSION: 'Permission',
        KILL_SWITCH: 'Kill Switch',
    }
    return labels[type] || type
}

function isToggleActive(toggle: any): boolean {
    return toggle.status === FeatureToggleStatus.ACTIVE
}

function getTrueRate(toggle: any): number {
    const total = toggle.evaluation_count || 0
    const trueCount = toggle.true_evaluation_count || 0
    if (total === 0) return 0
    return Math.round((trueCount / total) * 100)
}

function handleSearch(): void {
    currentPage.value = 1
    emit('search', searchQuery.value)
}

function applyFilters(): void {
    currentPage.value = 1
    emit('filter', {
        status: filterStatus.value,
        type: filterType.value,
        environment: filterEnvironment.value,
    })
}

function handlePageChange(page: number): void {
    currentPage.value = page
    emit('page-change', page)
}

watch(() => props.page, (newPage) => {
    currentPage.value = newPage
})
</script>