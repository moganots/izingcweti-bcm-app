<template>
  <q-page padding>
    <PageHeader
      title="Business Continuity Plans"
      subtitle="Manage and review business continuity plans"
      show-refresh
      @refresh="loadBCPs"
    >
      <template #actions>
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
      </template>
    </PageHeader>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-4 col-md-2" v-for="stat in statusStats" :key="stat.label">
        <q-card flat bordered :class="'bg-' + stat.color + '-1'"
          ><q-card-section class="text-center"
            ><div class="text-h5" :class="'text-' + stat.color">{{ stat.count }}</div>
            <div class="text-caption text-grey-7">{{ stat.label }}</div></q-card-section
          ></q-card
        >
      </div>
    </div>

    <q-slide-transition>
      <q-card v-if="showFilters" class="q-mb-md" flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="filterSearch" outlined dense placeholder="Search..." clearable />
            </div>
            <div class="col-6">
              <q-select
                v-model="filterStatus"
                :options="['Draft', 'Approved', 'Active', 'Archived']"
                outlined
                dense
                label="Status"
                clearable
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-slide-transition>

    <div v-if="isLoading" class="text-center q-pa-xl"><LoadingSpinner /></div>
    <EmptyState
      v-else-if="bcps.length === 0"
      icon="description"
      title="No BCPs Found"
      :action="{ label: 'Create BCP', handler: () => $router.push('/bcm/bcp/create') }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="bcp in bcps" :key="bcp.uuid" class="col-12 col-md-6 col-lg-4">
        <BcpCard
          :bcp="bcp"
          @click="$router.push(`/bcm/bcp/${bcp.uuid}`)"
          @submit="submitBCP(bcp)"
          @activate="activateBCP(bcp)"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBcmStore } from '../../stores/bcm.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import BcpCard from '../../components/bcm/BcpCard.vue'

const $q = useQuasar()
const bcmStore = useBcmStore()
const bcps = computed(() => bcmStore.bcps)
const isLoading = computed(() => bcmStore.isLoadingBCP)
const showFilters = ref(false)
const filterSearch = ref('')
const filterStatus = ref(null)

const statusStats = ref([
  { label: 'Active', color: 'green', count: 0 },
  { label: 'Approved', color: 'blue', count: 0 },
  { label: 'Draft', color: 'grey', count: 0 },
  { label: 'Archived', color: 'orange', count: 0 },
  { label: 'Overdue', color: 'red', count: 0 },
])

onMounted(() => loadBCPs())

async function loadBCPs(): Promise<void> {
  await bcmStore.loadBCPs()
  updateStats()
}
function updateStats(): void {
  const d = bcps.value
  if (statusStats && statusStats.value) {
    statusStats.value[0]!.count = d.filter((b: any) => b.plan_status === 'Active').length
    statusStats.value[1]!.count = d.filter((b: any) => b.plan_status === 'Approved').length
    statusStats.value[2]!.count = d.filter((b: any) => b.plan_status === 'Draft').length
    statusStats.value[3]!.count = d.filter((b: any) => b.plan_status === 'Archived').length
  }
}
async function submitBCP(bcp: any): Promise<void> {
  await bcmStore.approveBCP(bcp.uuid)
  $q.notify({ type: 'positive', message: 'BCP submitted' })
  await loadBCPs()
}
async function activateBCP(bcp: any): Promise<void> {
  await bcmStore.activateBCP(bcp.uuid)
  $q.notify({ type: 'positive', message: 'BCP activated' })
  await loadBCPs()
}
</script>
