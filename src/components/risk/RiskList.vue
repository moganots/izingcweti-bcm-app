<template>
  <div class="risk-list">
    <!-- Search & Filter Bar -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search risks..."
          clearable
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filterCategory"
          :options="categoryOptions"
          label="Category"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filterStatus"
          :options="statusOptions"
          label="Status"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filterSeverity"
          :options="severityOptions"
          label="Severity"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
      </div>
      <div class="col-12 col-md-2 text-right">
        <q-btn color="primary" icon="add" label="Add Risk" unelevated @click="$emit('create')" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
      <p class="text-grey-7 q-mt-sm">Loading risks...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredRisks.length === 0" class="text-center q-py-xl">
      <q-icon name="warning" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Risks Found</div>
      <p class="text-grey-6">
        {{ searchQuery ? 'No matching risks found' : 'Start by creating your first risk assessment' }}
      </p>
      <q-btn
        v-if="!searchQuery"
        color="primary"
        icon="add"
        label="Add Risk"
        @click="$emit('create')"
      />
    </div>

    <!-- Grid -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="risk in paginatedRisks" :key="risk.id" class="col-12 col-md-6 col-lg-4">
        <RiskCard
          :risk="risk"
          @click="$emit('select', risk)"
          @edit="$emit('edit', risk)"
          @reassess="$emit('reassess', risk)"
          @add-controls="$emit('add-controls', risk)"
          @delete="$emit('delete', risk)"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredRisks.length > 0" class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-visible="5"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import RiskCard from './RiskCard.vue'
import {
  RiskCategory,
  RiskStatus,
} from './../../models/entities/risk/risk.entity'

const props = withDefaults(
  defineProps<{
    risks?: any[]
    loading?: boolean
    total?: number
    page?: number
    limit?: number
  }>(),
  {
    risks: () => [],
    loading: false,
    total: 0,
    page: 1,
    limit: 10,
  }
)

const emit = defineEmits<{
  create: []
  select: [risk: any]
  edit: [risk: any]
  reassess: [risk: any]
  'add-controls': [risk: any]
  delete: [risk: any]
  'page-change': [page: number]
  search: [query: string]
  filter: [filters: any]
}>()

const searchQuery = ref('')
const filterCategory = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const filterSeverity = ref<string | null>(null)
const currentPage = ref(props.page)

const categoryOptions = Object.values(RiskCategory).map((value) => ({
  label: formatCategory(value),
  value,
}))

const statusOptions = Object.values(RiskStatus).map((value) => ({
  label: formatStatus(value),
  value,
}))

const severityOptions = [
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const filteredRisks = computed(() => {
  let risks = props.risks

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    risks = risks.filter((r: any) =>
      r.title?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
    )
  }

  if (filterCategory.value) {
    risks = risks.filter((r: any) => 
      r.riskCategory === filterCategory.value || 
      r.risk_category === filterCategory.value
    )
  }

  if (filterStatus.value) {
    risks = risks.filter((r: any) => 
      r.status === filterStatus.value
    )
  }

  if (filterSeverity.value) {
    risks = risks.filter((r: any) => {
      const score = r.inherentRiskScore || r.inherent_risk_score || 0
      if (filterSeverity.value === 'critical') return score >= 8.5
      if (filterSeverity.value === 'high') return score >= 7 && score < 8.5
      if (filterSeverity.value === 'medium') return score >= 5 && score < 7
      return score < 5
    })
  }

  return risks
})

const totalPages = computed(() => Math.ceil(filteredRisks.value.length / props.limit))

const paginatedRisks = computed(() => {
  const start = (currentPage.value - 1) * props.limit
  const end = start + props.limit
  return filteredRisks.value.slice(start, end)
})

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    FINANCIAL: 'Financial',
    OPERATIONAL: 'Operational',
    COMPLIANCE: 'Compliance',
    REPUTATIONAL: 'Reputational',
    STRATEGIC: 'Strategic',
    CYBERSECURITY: 'Cybersecurity',
    NATURAL_DISASTER: 'Natural Disaster',
    TECHNOLOGY_FAILURE: 'Technology Failure',
    HUMAN_ERROR: 'Human Error',
    THIRD_PARTY: 'Third Party',
  }
  return labels[category] || category
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    IDENTIFIED: 'Identified',
    ASSESSING: 'Assessing',
    APPROVED: 'Approved',
    TREATING: 'Treating',
    MONITORING: 'Monitoring',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

function handleSearch(): void {
  currentPage.value = 1
  emit('search', searchQuery.value)
}

function applyFilters(): void {
  currentPage.value = 1
  emit('filter', {
    category: filterCategory.value,
    status: filterStatus.value,
    severity: filterSeverity.value,
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