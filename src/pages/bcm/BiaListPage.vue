<template>
  <q-page padding>
    <PageHeader
      title="Business Impact Analysis"
      subtitle="Assess and manage business impact"
      show-refresh
      @refresh="loadBIAs"
    >
      <template #actions>
        <q-btn
        dense round
          color="primary"
          icon="add_home_work"
          @click="$router.push('/bcm/bia/create')"
        />
      </template>
    </PageHeader>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'"
          ><q-card-section class="text-center"
            ><div class="text-h4" :class="'text-' + stat.color">{{ stat.value }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div></q-card-section
          ></q-card
        >
      </div>
    </div>

    <div v-if="isLoading" class="text-center q-pa-xl"><LoadingSpinner /></div>
    <EmptyState
      v-else-if="bias.length === 0"
      icon="assessment"
      title="No BIAs Found"
      description="Start assessing business impact."
      :action="{ label: 'Create BIA', handler: () => $router.push('/bcm/bia/create') }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="bia in bias" :key="bia.uuid" class="col-12 col-md-6">
        <q-card class="cursor-pointer" flat bordered @click="$router.push(`/bcm/bia/${bia.uuid}`)">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getImpactColor(bia.reputational_impact)"
                :label="bia.reputational_impact + ' Impact'"
                class="q-px-sm q-py-xs"
              />
              <span class="text-caption text-grey-7">{{ formatDate(bia.assessed_date) }}</span>
            </div>
            <div class="text-h6 q-mb-xs">{{ bia.critical_function?.name || 'Unknown' }}</div>
            <q-separator class="q-mb-sm" />
            <div class="row q-col-gutter-sm text-center">
              <div class="col-4">
                <div class="text-caption text-grey-6">Financial</div>
                <div class="text-body2 text-weight-bold text-primary">
                  {{ formatCurrency(bia.financial_impact_per_day) }}/day
                </div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Operational</div>
                <div class="text-body2">{{ truncateText(bia.operational_impact, 20) }}</div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Regulatory</div>
                <div class="text-body2">{{ truncateText(bia.regulatory_impact, 20) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBcmStore } from '../../stores/bcm/bcm.store'
import { formatDate } from '../../utils/date.utils'
import { formatCurrency, truncateText } from '../../utils/formatters'
import PageHeader from '../../components/.common/PageHeader.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'

const bcmStore = useBcmStore()
const bias = computed(() => bcmStore.bias)
const isLoading = computed(() => bcmStore.isLoadingBIA)

const stats = ref([
  { label: 'Total', value: 0, color: 'primary' },
  { label: 'Completed', value: 0, color: 'green' },
  { label: 'In Progress', value: 0, color: 'orange' },
  { label: 'Critical', value: 0, color: 'red' },
])

onMounted(() => loadBIAs())

async function loadBIAs(): Promise<void> {
  await bcmStore.loadBIAs()
  updateStats()
}
function updateStats(): void {
  const d = bias.value
  if (stats && stats.value) {
    stats.value[0]!.value = d.length
    stats.value[3]!.value = d.filter((b: any) => b.reputational_impact === 'High').length
  }
}
function getImpactColor(impact: string): string {
  return { Low: 'green', Med: 'orange', High: 'red' }[impact] || 'grey'
}
</script>
