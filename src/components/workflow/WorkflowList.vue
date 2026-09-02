<template>
  <div class="workflow-list">
    <!-- Search & Filter Bar -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search workflows..."
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
          v-model="filterState"
          :options="stateOptions"
          label="State"
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
          v-model="filterType"
          :options="typeOptions"
          label="Type"
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
          v-model="filterPriority"
          :options="priorityOptions"
          label="Priority"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
      </div>
      <div class="col-12 col-md-2 text-right">
        <q-btn color="primary" icon="add" label="New Workflow" unelevated @click="$emit('create')" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner-dots size="40px" color="primary" />
      <p class="text-grey-7 q-mt-sm">Loading workflows...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredWorkflows.length === 0" class="text-center q-py-xl">
      <q-icon name="account_tree" size="60px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No Workflows Found</div>
      <p class="text-grey-6">
        {{ searchQuery ? 'No matching workflows found' : 'Create your first workflow' }}
      </p>
      <q-btn
        v-if="!searchQuery"
        color="primary"
        icon="add"
        label="New Workflow"
        @click="$emit('create')"
      />
    </div>

    <!-- Grid -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="workflow in paginatedWorkflows" :key="workflow.id" class="col-12 col-md-6 col-lg-4">
        <WorkflowCard
          :workflow="workflow"
          :show-actions="true"
          @click="$emit('select', workflow)"
          @submit="$emit('submit', workflow)"
          @approve="$emit('approve', workflow)"
          @reject="$emit('reject', workflow)"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredWorkflows.length > 0" class="row justify-center q-mt-md">
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
import WorkflowCard from './WorkflowCard.vue'
import {
  WorkflowState,
  WorkflowType,
  WorkflowPriority,
} from './../../models/entities/workflow/workflow.entity'
import {
  getWorkflowStateLabel,
  getWorkflowTypeLabel,
  getWorkflowPriorityLabel,
} from '../../types/workflow.types'

const props = withDefaults(
  defineProps<{
    workflows?: any[]
    loading?: boolean
    total?: number
    page?: number
    limit?: number
  }>(),
  {
    workflows: () => [],
    loading: false,
    total: 0,
    page: 1,
    limit: 10,
  }
)

const emit = defineEmits<{
  create: []
  select: [workflow: any]
  submit: [workflow: any]
  approve: [workflow: any]
  reject: [workflow: any]
  'page-change': [page: number]
  search: [query: string]
  filter: [filters: any]
}>()

const searchQuery = ref('')
const filterState = ref<string | null>(null)
const filterType = ref<string | null>(null)
const filterPriority = ref<string | null>(null)
const currentPage = ref(props.page)

const stateOptions = Object.values(WorkflowState).map((value) => ({
  label: getWorkflowStateLabel(value),
  value,
}))

const typeOptions = Object.values(WorkflowType).map((value) => ({
  label: getWorkflowTypeLabel(value),
  value,
}))

const priorityOptions = Object.values(WorkflowPriority).map((value) => ({
  label: getWorkflowPriorityLabel(value),
  value,
}))

const filteredWorkflows = computed(() => {
  let workflows = props.workflows

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    workflows = workflows.filter((w: any) =>
      w.title?.toLowerCase().includes(query) ||
      w.description?.toLowerCase().includes(query)
    )
  }

  if (filterState.value) {
    workflows = workflows.filter((w: any) => 
      w.workflowState === filterState.value || w.workflow_state === filterState.value
    )
  }

  if (filterType.value) {
    workflows = workflows.filter((w: any) => 
      w.workflowType === filterType.value || w.workflow_type === filterType.value
    )
  }

  if (filterPriority.value) {
    workflows = workflows.filter((w: any) => 
      w.priority === filterPriority.value
    )
  }

  return workflows
})

const totalPages = computed(() => Math.ceil(filteredWorkflows.value.length / props.limit))

const paginatedWorkflows = computed(() => {
  const start = (currentPage.value - 1) * props.limit
  const end = start + props.limit
  return filteredWorkflows.value.slice(start, end)
})

function handleSearch(): void {
  currentPage.value = 1
  emit('search', searchQuery.value)
}

function applyFilters(): void {
  currentPage.value = 1
  emit('filter', {
    state: filterState.value,
    type: filterType.value,
    priority: filterPriority.value,
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