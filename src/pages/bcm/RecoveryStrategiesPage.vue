<!-- src/pages/bcm/RecoveryStrategiesPage.vue -->
<template>
  <q-page padding>
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Recovery Strategies</h4>
          <p class="text-grey-7 q-mb-none">Design and manage recovery strategies for BCPs</p>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Add Strategy"
          unelevated
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center">
          <q-card-section>
            <q-icon name="restore" size="30px" color="primary" />
            <div class="text-h4 q-mt-sm">{{ strategies.length }}</div>
            <div class="text-caption text-grey-7">Total Strategies</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center">
          <q-card-section>
            <q-icon name="attach_money" size="30px" color="green" />
            <div class="text-h4 q-mt-sm">{{ formatCurrency(totalCost) }}</div>
            <div class="text-caption text-grey-7">Total Est. Cost</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center">
          <q-card-section>
            <q-icon name="trending_up" size="30px" color="info" />
            <div class="text-h4 q-mt-sm">{{ avgSuccessRate }}%</div>
            <div class="text-caption text-grey-7">Avg. Success Rate</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center">
          <q-card-section>
            <q-icon name="check_circle" size="30px" color="positive" />
            <div class="text-h4 q-mt-sm">{{ testedCount }}</div>
            <div class="text-caption text-grey-7">Tested</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <EmptyState
      v-else-if="strategies.length === 0"
      icon="restore"
      title="No Recovery Strategies"
      description="Define recovery strategies for your business continuity plans."
      :action="{ label: 'Add Strategy', handler: () => (showCreateDialog = true) }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="strategy in strategies" :key="strategy.uuid" class="col-12 col-md-6 col-lg-4">
        <q-card class="strategy-card" flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getTypeColor(strategy.recovery_strategy_type)"
                :label="strategy.recovery_strategy_type"
                class="q-px-sm q-py-xs"
              />
              <q-btn flat round size="sm" icon="more_vert">
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="editStrategy(strategy)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="deleteStrategy(strategy)">
                      <q-item-section avatar
                        ><q-icon name="delete" color="negative"
                      /></q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="text-h6 q-mb-xs">
              {{ strategy.business_continuity_plan?.critical_function?.name }}
            </div>
            <p class="text-grey-7 text-body2 q-mb-md">
              {{ strategy.business_continuity_plan?.critical_function?.department?.name }}
            </p>

            <q-separator class="q-mb-sm" />

            <div class="row q-col-gutter-sm text-center q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey-6">Est. Recovery Cost</div>
                <div class="text-body2 text-weight-bold text-primary">
                  {{ formatCurrency(strategy.estimated_recovery_cost) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Test Success Rate</div>
                <div
                  class="text-body2 text-weight-bold"
                  :class="strategy.test_success_rate >= 80 ? 'text-green' : 'text-orange'"
                >
                  {{ strategy.test_success_rate }}%
                </div>
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-6 q-mb-xs">Success Rate</div>
              <q-linear-progress
                :value="strategy.test_success_rate / 100"
                :color="
                  strategy.test_success_rate >= 80
                    ? 'green'
                    : strategy.test_success_rate >= 50
                    ? 'orange'
                    : 'red'
                "
                size="15px"
                rounded
              >
                <div class="absolute-full flex flex-center">
                  <q-badge
                    :label="strategy.test_success_rate + '%'"
                    color="white"
                    text-color="black"
                  />
                </div>
              </q-linear-progress>
            </div>

            <div v-if="strategy.resource_requirements" class="q-mt-sm">
              <div class="text-caption text-grey-6 q-mb-xs">Resource Requirements</div>
              <div class="row q-gutter-xs">
                <q-badge
                  v-for="(value, key) in strategy.resource_requirements"
                  :key="key"
                  outline
                  color="primary"
                  :label="`${key}: ${value}`"
                  class="q-px-sm"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ editingStrategy ? 'Edit' : 'Create' }} Recovery Strategy</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveStrategy" class="q-gutter-md">
            <q-select
              v-model="form.bcp_id"
              :options="bcpOptions"
              label="Business Continuity Plan"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-select
              v-model="form.strategy_type"
              :options="strategyTypeOptions"
              label="Strategy Type"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="form.estimated_cost"
              label="Estimated Recovery Cost"
              type="number"
              outlined
              dense
              prefix="$"
              :rules="[requiredRule]"
            />
            <div class="text-h6 q-mb-sm">Resource Requirements</div>
            <q-input
              v-model="form.resources.servers"
              label="Servers"
              type="number"
              outlined
              dense
            />
            <q-input
              v-model="form.resources.personnel"
              label="Personnel"
              type="number"
              outlined
              dense
            />
            <q-input v-model="form.resources.network" label="Network" outlined dense />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup @click="resetForm" />
          <q-btn
            color="primary"
            :label="editingStrategy ? 'Update' : 'Create'"
            :loading="isSaving"
            @click="saveStrategy"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { BcmService } from '../../services/api/BcmService'
import EmptyState from '../../components/common/EmptyState.vue'
import { formatCurrency } from '../../utils/formatters'

const $q = useQuasar()

const strategies = ref<any[]>([])
const bcps = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showCreateDialog = ref(false)
const editingStrategy = ref<any>(null)

const form = reactive({
  bcp_id: '',
  strategy_type: '',
  estimated_cost: 0,
  resources: { servers: 0, personnel: 0, network: '' },
})

const totalCost = computed(() =>
  strategies.value.reduce((sum, s) => sum + (s.estimated_recovery_cost || 0), 0)
)
const avgSuccessRate = computed(() => {
  if (strategies.value.length === 0) return 0
  const total = strategies.value.reduce((sum, s) => sum + (s.test_success_rate || 0), 0)
  return Math.round(total / strategies.value.length)
})
const testedCount = computed(() => strategies.value.filter((s) => s.test_success_rate > 0).length)

const strategyTypeOptions = ['HotSite', 'ColdSite', 'CloudFailover', 'ManualWorkaround']
const bcpOptions = computed(() =>
  bcps.value.map((b: any) => ({ label: b.critical_function?.name || 'Unknown', value: b.uuid }))
)
const requiredRule = (val: any) => !!val || 'Required'

onMounted(async () => {
  await Promise.all([loadStrategies(), loadBCPs()])
})

async function loadStrategies(): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getRecoveryStrategies()
    strategies.value = response.data || []
  } catch (error) {
    console.error('Failed to load strategies:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadBCPs(): Promise<void> {
  try {
    const response = await BcmService.getBCPs()
    bcps.value = response.data || []
  } catch (error) {
    console.error('Failed to load BCPs:', error)
  }
}

function editStrategy(strategy: any): void {
  editingStrategy.value = strategy
  form.bcp_id = strategy.business_continuity_plan_id
  form.strategy_type = strategy.recovery_strategy_type
  form.estimated_cost = strategy.estimated_recovery_cost
  form.resources = strategy.resource_requirements || { servers: 0, personnel: 0, network: '' }
  showCreateDialog.value = true
}

async function saveStrategy(): Promise<void> {
  isSaving.value = true
  try {
    const data = {
      business_continuity_plan_id: form.bcp_id,
      recovery_strategy_type: form.strategy_type,
      estimated_recovery_cost: form.estimated_cost,
      resource_requirements: form.resources,
    }

    if (editingStrategy.value) {
      await BcmService.updateRecoveryStrategy(editingStrategy.value.uuid, data)
      $q.notify({ type: 'positive', message: 'Strategy updated' })
    } else {
      await BcmService.createRecoveryStrategy(data)
      $q.notify({ type: 'positive', message: 'Strategy created' })
    }
    showCreateDialog.value = false
    resetForm()
    await loadStrategies()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to save strategy' })
  } finally {
    isSaving.value = false
  }
}

function deleteStrategy(strategy: any): void {
  $q.dialog({
    title: 'Delete Strategy',
    message: 'Are you sure? This action cannot be undone.',
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await BcmService.deleteRecoveryStrategy(strategy.uuid)
      $q.notify({ type: 'positive', message: 'Strategy deleted' })
      await loadStrategies()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete' })
    }
  })
}

function resetForm(): void {
  editingStrategy.value = null
  form.bcp_id = ''
  form.strategy_type = ''
  form.estimated_cost = 0
  form.resources = { servers: 0, personnel: 0, network: '' }
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    HotSite: 'red',
    ColdSite: 'blue',
    CloudFailover: 'purple',
    ManualWorkaround: 'orange',
  }
  return colors[type] || 'grey'
}
</script>

<style lang="scss" scoped>
.strategy-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
