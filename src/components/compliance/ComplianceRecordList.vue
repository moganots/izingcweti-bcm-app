<template>
  <div class="compliance-record-list">
    <!-- Search & Filter Bar -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="search"
          outlined
          dense
          placeholder="Search compliance records..."
          clearable
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filterStandard"
          :options="standardFilterOptions"
          label="Standard"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="handleFilter"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filterStatus"
          :options="statusFilterOptions"
          label="Status"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="handleFilter"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
      <p class="text-grey-7 q-mt-sm">Loading compliance records...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredRecords.length === 0" class="text-center q-py-xl">
      <q-icon name="verified_user" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Compliance Records</div>
      <p class="text-grey-6">{{ search ? 'No matching records found' : 'Create your first compliance record' }}</p>
      <q-btn v-if="!search" color="primary" icon="add" label="Add Record" @click="$emit('create')" />
    </div>

    <!-- Grid -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="record in paginatedRecords" :key="record.id" class="col-12 col-md-6 col-lg-4">
        <ComplianceCard
          :record="record"
          @click="$emit('select', record)"
          @edit="$emit('edit', record)"
          @update-status="$emit('update-status', record)"
          @add-evidence="$emit('add-evidence', record)"
          @delete="$emit('delete', record)"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredRecords.length > 0" class="row justify-center q-mt-md">
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
import ComplianceCard from './ComplianceCard.vue'

const props = withDefaults(
  defineProps<{
    records?: any[]
    loading?: boolean
    total?: number
    page?: number
    limit?: number
  }>(),
  {
    records: () => [],
    loading: false,
    total: 0,
    page: 1,
    limit: 10,
  }
)

const emit = defineEmits<{
  create: []
  select: [record: any]
  edit: [record: any]
  'update-status': [record: any]
  'add-evidence': [record: any]
  delete: [record: any]
  'page-change': [page: number]
  search: [term: string]
  filter: [filters: { standard?: string | undefined; status?: string | undefined }]
}>()

const search = ref('')
const filterStandard = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const currentPage = ref(props.page)

const standardFilterOptions = [
  { label: 'ISO 22301', value: 'ISO22301' },
  { label: 'NIST 800-34', value: 'NIST800-34' },
  { label: 'FFIEC', value: 'FFIEC' },
  { label: 'COBIT 2019', value: 'COBIT2019' },
]

const statusFilterOptions = [
  { label: 'Compliant', value: 'Compliant' },
  { label: 'Partially Compliant', value: 'Partially' },
  { label: 'Non-Compliant', value: 'NonCompliant' },
]

const filteredRecords = computed(() => {
  let records = props.records

  if (search.value) {
    const query = search.value.toLowerCase()
    records = records.filter((r: any) =>
      r.organisation?.name?.toLowerCase().includes(query) ||
      r.compliance_standard?.toLowerCase().includes(query)
    )
  }

  if (filterStandard.value) {
    records = records.filter((r: any) => r.compliance_standard === filterStandard.value)
  }

  if (filterStatus.value) {
    records = records.filter((r: any) => r.compliance_status === filterStatus.value)
  }

  return records
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / props.limit))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * props.limit
  const end = start + props.limit
  return filteredRecords.value.slice(start, end)
})

function handleSearch(): void {
  currentPage.value = 1
  emit('search', search.value)
}

function handleFilter(): void {
  currentPage.value = 1
  emit('filter', {
    standard: filterStandard.value || undefined,
    status: filterStatus.value || undefined,
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