<!-- src/pages/bcm/BcpListPage.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Business Continuity Plans</h4>
          <p class="text-grey-7 q-mb-none">Manage and review business continuity plans</p>
        </div>
        <div class="q-gutter-sm">
          <q-btn
            outline
            color="primary"
            icon="filter_list"
            label="Filters"
            @click="showFilters = !showFilters"
          />
          <q-btn
            color="primary"
            icon="add"
            label="New BCP"
            unelevated
            @click="$router.push('/bcm/bcp/create')"
          />
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-4 col-md-2" v-for="stat in statusStats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'">
          <q-card-section class="text-center">
            <div class="text-h5" :class="'text-' + stat.color">{{ stat.count }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-slide-transition>
      <q-card v-if="showFilters" class="q-mb-md" flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.search"
                outlined
                dense
                placeholder="Search plans..."
                clearable
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filters.status"
                outlined
                dense
                :options="statusOptions"
                label="Status"
                clearable
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filters.sortBy"
                outlined
                dense
                :options="sortOptions"
                label="Sort By"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="primary"
                icon="search"
                label="Apply"
                class="full-width"
                @click="loadBCPs"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-slide-transition>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="bcps.length === 0"
      icon="description"
      title="No BCPs Found"
      description="Create your first business continuity plan."
      :action="{ label: 'Create BCP', handler: () => $router.push('/bcm/bcp/create') }"
    />

    <!-- BCP Cards -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="bcp in bcps" :key="bcp.uuid" class="col-12 col-md-6 col-lg-4">
        <q-card class="bcp-card" flat bordered @click="$router.push(`/bcm/bcp/${bcp.uuid}`)">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getStatusColor(bcp.plan_status)"
                :label="bcp.plan_status"
                class="q-px-sm q-py-xs"
              />
              <q-badge outline color="primary" :label="'v' + bcp.version" />
            </div>

            <div class="text-h6 q-mb-xs">{{ bcp.critical_function?.name || 'Unknown' }}</div>
            <p class="text-grey-7 text-body2 q-mb-md">
              {{ bcp.critical_function?.department?.name }}
            </p>

            <q-separator class="q-mb-sm" />

            <div class="row q-col-gutter-sm text-center">
              <div class="col-6">
                <div class="text-caption text-grey-6">Review Due</div>
                <div
                  class="text-body2"
                  :class="isOverdue(bcp.review_due_date) ? 'text-negative text-weight-bold' : ''"
                >
                  {{ formatDate(bcp.review_due_date) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Approval Date</div>
                <div class="text-body2">{{ formatDate(bcp.approval_date) || 'Not approved' }}</div>
              </div>
            </div>

            <div class="q-mt-sm">
              <q-linear-progress
                :value="getBCPProgress(bcp)"
                :color="getProgressColor(bcp)"
                class="q-mb-xs"
              />
              <div class="row justify-between text-caption text-grey-6">
                <span>Progress</span>
                <span>{{ Math.round(getBCPProgress(bcp) * 100) }}%</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { BcmService } from '../../services/api/BcmService'
import EmptyState from '../../components/common/EmptyState.vue'
import { formatDate } from '../../utils/formatters'

const bcps = ref<any[]>([])
const isLoading = ref(false)
const showFilters = ref(false)

const filters = reactive({
  search: '',
  status: null,
  sortBy: 'created_at',
})

const statusOptions = ['Draft', 'Approved', 'Active', 'Archived']
const sortOptions = [
  { label: 'Created Date', value: 'created_at' },
  { label: 'Review Date', value: 'review_due_date' },
  { label: 'Status', value: 'plan_status' },
  { label: 'Version', value: 'version' },
]

const statusStats = reactive([
  { label: 'Active', color: 'green', count: 0 },
  { label: 'Approved', color: 'blue', count: 0 },
  { label: 'Draft', color: 'grey', count: 0 },
  { label: 'Archived', color: 'orange', count: 0 },
  { label: 'Overdue', color: 'red', count: 0 },
])

onMounted(() => loadBCPs())

async function loadBCPs(): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getBCPs(filters)
    bcps.value = response.data || []
    updateStats()
  } catch (error) {
    console.error('Failed to load BCPs:', error)
  } finally {
    isLoading.value = false
  }
}

function updateStats(): void {
  statusStats[0].count = bcps.value.filter((b) => b.plan_status === 'Active').length
  statusStats[1].count = bcps.value.filter((b) => b.plan_status === 'Approved').length
  statusStats[2].count = bcps.value.filter((b) => b.plan_status === 'Draft').length
  statusStats[3].count = bcps.value.filter((b) => b.plan_status === 'Archived').length
  statusStats[4].count = bcps.value.filter((b) => isOverdue(b.review_due_date)).length
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Draft: 'grey',
    Approved: 'blue',
    Active: 'green',
    Archived: 'orange',
  }
  return colors[status] || 'grey'
}

function isOverdue(date: string): boolean {
  return date ? new Date(date) < new Date() : false
}

function getBCPProgress(bcp: any): number {
  let progress = 0
  if (bcp.plan_status === 'Draft') progress = 0.25
  if (bcp.plan_status === 'Approved') progress = 0.5
  if (bcp.plan_status === 'Active') progress = 0.75
  if (bcp.recovery_strategies?.length > 0) progress += 0.1
  if (bcp.exercise_tests?.length > 0) progress += 0.15
  return Math.min(progress, 1)
}

function getProgressColor(bcp: any): string {
  const progress = getBCPProgress(bcp)
  if (progress < 0.3) return 'red'
  if (progress < 0.6) return 'orange'
  if (progress < 0.8) return 'yellow'
  return 'green'
}
</script>
