<!-- src/pages/bcm/BiaListPage.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Business Impact Analysis</h4>
          <p class="text-grey-7 q-mb-none">
            Assess and manage business impact for critical functions
          </p>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="New BIA"
          unelevated
          @click="$router.push('/bcm/bia/create')"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-primary text-white">
          <q-card-section>
            <div class="text-caption text-white-70">Total BIAs</div>
            <div class="text-h4 q-mt-sm">{{ stats.total }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-green text-white">
          <q-card-section>
            <div class="text-caption text-white-70">Completed</div>
            <div class="text-h4 q-mt-sm">{{ stats.completed }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-orange text-white">
          <q-card-section>
            <div class="text-caption text-white-70">In Progress</div>
            <div class="text-h4 q-mt-sm">{{ stats.inProgress }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-red text-white">
          <q-card-section>
            <div class="text-caption text-white-70">Critical Impact</div>
            <div class="text-h4 q-mt-sm">{{ stats.critical }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              outlined
              dense
              placeholder="Search BIAs..."
              clearable
              @update:model-value="loadBIAs"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.impact"
              outlined
              dense
              :options="impactOptions"
              label="Impact Level"
              clearable
              @update:model-value="loadBIAs"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.sortBy"
              outlined
              dense
              :options="sortOptions"
              label="Sort By"
              emit-value
              map-options
              @update:model-value="loadBIAs"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="bias.length === 0"
      icon="assessment"
      title="No BIAs Found"
      description="Start assessing business impact for your critical functions."
      :action="{ label: 'Create BIA', handler: () => $router.push('/bcm/bia/create') }"
    />

    <!-- BIA List -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="bia in bias" :key="bia.uuid" class="col-12 col-md-6">
        <q-card
          class="bia-card cursor-pointer"
          flat
          bordered
          @click="$router.push(`/bcm/bia/${bia.uuid}`)"
        >
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getImpactColor(bia.reputational_impact)"
                :label="bia.reputational_impact + ' Impact'"
                class="q-px-sm q-py-xs"
              />
              <span class="text-caption text-grey-7">
                {{ formatDate(bia.assessed_date) }}
              </span>
            </div>

            <div class="text-h6 q-mb-xs">
              {{ bia.critical_function?.name || 'Unknown Function' }}
            </div>
            <p class="text-grey-7 text-body2 q-mb-md">
              {{ bia.critical_function?.department?.name || 'No department' }}
            </p>

            <q-separator class="q-mb-sm" />

            <div class="row q-col-gutter-sm text-center">
              <div class="col-4">
                <div class="text-caption text-grey-6">Financial Impact</div>
                <div class="text-body2 text-weight-bold text-primary">
                  {{ formatCurrency(bia.financial_impact_per_day) }}
                </div>
                <div class="text-caption text-grey-6">per day</div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Operational</div>
                <div class="text-body2 text-weight-bold">
                  {{ truncateText(bia.operational_impact, 30) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Regulatory</div>
                <div class="text-body2 text-weight-bold">
                  {{ truncateText(bia.regulatory_impact, 30) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        direction-links
        color="primary"
        @update:model-value="loadBIAs"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { BcmService } from '../../services/api/BcmService'
import EmptyState from '../../components/common/EmptyState.vue'
import { formatDate, formatCurrency } from '../../utils/formatters'

// State
const bias = ref<any[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = reactive({
  search: '',
  impact: null,
  sortBy: 'assessed_date',
})

const stats = reactive({
  total: 0,
  completed: 0,
  inProgress: 0,
  critical: 0,
})

const impactOptions = ['Low', 'Med', 'High']
const sortOptions = [
  { label: 'Assessment Date', value: 'assessed_date' },
  { label: 'Financial Impact', value: 'financial_impact_per_day' },
  { label: 'Function Name', value: 'function_name' },
]

// Lifecycle
onMounted(async () => {
  await loadBIAs()
  await loadStats()
})

// Methods
async function loadBIAs(): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getBIAs({
      ...filters,
      page: currentPage.value,
      limit: 10,
    })
    bias.value = response.data || []
    totalPages.value = response.totalPages || 1
    stats.total = response.total || 0
  } catch (error) {
    console.error('Failed to load BIAs:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadStats(): Promise<void> {
  try {
    const response = await BcmService.getBIAStats()
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

function getImpactColor(impact: string): string {
  const colors: Record<string, string> = {
    Low: 'green',
    Med: 'orange',
    High: 'red',
  }
  return colors[impact] || 'grey'
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
</script>

<style lang="scss" scoped>
.bia-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
