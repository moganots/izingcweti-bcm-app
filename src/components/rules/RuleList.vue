<template>
    <div class="rule-list">
        <!-- Search & Filter Bar -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
                <q-input v-model="searchQuery" outlined dense placeholder="Search rules..." clearable
                    @update:model-value="handleSearch">
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterType" :options="typeOptions" label="Type" outlined dense clearable emit-value
                    map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterStatus" :options="statusOptions" label="Status" outlined dense clearable
                    emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2">
                <q-select v-model="filterTrigger" :options="triggerOptions" label="Trigger" outlined dense clearable
                    emit-value map-options @update:model-value="applyFilters" />
            </div>
            <div class="col-12 col-md-2 text-right">
                <q-btn color="primary" icon="add" label="Create Rule" unelevated @click="$emit('create')" />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-md">
            <q-spinner-dots size="40px" color="primary" />
            <p class="text-grey-7 q-mt-sm">Loading rules...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredRules.length === 0" class="text-center q-py-xl">
            <q-icon name="rule" size="60px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No Rules Found</div>
            <p class="text-grey-6">
                {{ searchQuery ? 'No matching rules found' : 'Create your first automation rule' }}
            </p>
            <q-btn v-if="!searchQuery" color="primary" icon="add" label="Create Rule" @click="$emit('create')" />
        </div>

        <!-- Grid -->
        <div v-else class="row q-col-gutter-md">
            <div v-for="rule in paginatedRules" :key="rule.id" class="col-12 col-md-6 col-lg-4">
                <RuleCard :rule="rule" @click="$emit('select', rule)" @edit="$emit('edit', rule)"
                    @test="$emit('test', rule)" @activate="$emit('activate', rule)"
                    @deactivate="$emit('deactivate', rule)" @duplicate="$emit('duplicate', rule)"
                    @delete="$emit('delete', rule)" />
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredRules.length > 0" class="row justify-center q-mt-md">
            <q-pagination v-model="currentPage" :max="totalPages" :max-visible="5"
                @update:model-value="handlePageChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import RuleCard from './RuleCard.vue'
import {
    RuleType,
    RuleStatus,
    RuleTrigger,
    getRuleTypeLabel,
    getRuleStatusLabel,
    getRuleTriggerLabel,
} from '../../models/entities/rules/rule.entity.ts'

const props = withDefaults(
    defineProps<{
        rules?: any[]
        loading?: boolean
        total?: number
        page?: number
        limit?: number
    }>(),
    {
        rules: () => [],
        loading: false,
        total: 0,
        page: 1,
        limit: 10,
    }
)

const emit = defineEmits<{
    create: []
    select: [rule: any]
    edit: [rule: any]
    test: [rule: any]
    activate: [rule: any]
    deactivate: [rule: any]
    duplicate: [rule: any]
    delete: [rule: any]
    'page-change': [page: number]
    search: [query: string]
    filter: [filters: any]
}>()

const searchQuery = ref('')
const filterType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const filterTrigger = ref<string | null>(null)
const currentPage = ref(props.page)

const typeOptions = Object.values(RuleType).map((value) => ({
    label: getRuleTypeLabel(value),
    value,
}))

const statusOptions = Object.values(RuleStatus).map((value) => ({
    label: getRuleStatusLabel(value),
    value,
}))

const triggerOptions = Object.values(RuleTrigger).map((value) => ({
    label: getRuleTriggerLabel(value),
    value,
}))

const filteredRules = computed(() => {
    let rules = props.rules

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        rules = rules.filter((r: any) =>
            r.name?.toLowerCase().includes(query) ||
            r.description?.toLowerCase().includes(query)
        )
    }

    if (filterType.value) {
        rules = rules.filter((r: any) => r.ruleType === filterType.value || r.rule_type === filterType.value)
    }

    if (filterStatus.value) {
        rules = rules.filter((r: any) => r.status === filterStatus.value)
    }

    if (filterTrigger.value) {
        rules = rules.filter((r: any) => r.triggerEvent === filterTrigger.value || r.rule_trigger === filterTrigger.value)
    }

    return rules
})

const totalPages = computed(() => Math.ceil(filteredRules.value.length / props.limit))

const paginatedRules = computed(() => {
    const start = (currentPage.value - 1) * props.limit
    const end = start + props.limit
    return filteredRules.value.slice(start, end)
})

function handleSearch(): void {
    currentPage.value = 1
    emit('search', searchQuery.value)
}

function applyFilters(): void {
    currentPage.value = 1
    emit('filter', {
        type: filterType.value,
        status: filterStatus.value,
        trigger: filterTrigger.value,
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