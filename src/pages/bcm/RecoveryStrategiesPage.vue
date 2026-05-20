<template>
  <q-page padding>
    <PageHeader
      title="Recovery Strategies"
      subtitle="Design and manage recovery strategies"
      show-refresh
      @refresh="loadStrategies"
    >
      <template #actions
        ><q-btn
          color="primary"
          icon="add"
          label="Add Strategy"
          unelevated
          @click="showCreateDialog = true"
      /></template>
    </PageHeader>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center"
          ><q-card-section
            ><q-icon name="restore" size="30px" color="primary" />
            <div class="text-h4 q-mt-sm">{{ strategies.length }}</div>
            <div class="text-caption text-grey-7">Total</div></q-card-section
          ></q-card
        >
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center"
          ><q-card-section
            ><q-icon name="attach_money" size="30px" color="green" />
            <div class="text-h4 q-mt-sm">{{ totalCost }}</div>
            <div class="text-caption text-grey-7">Total Cost</div></q-card-section
          ></q-card
        >
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center"
          ><q-card-section
            ><q-icon name="trending_up" size="30px" color="info" />
            <div class="text-h4 q-mt-sm">{{ avgSuccessRate }}%</div>
            <div class="text-caption text-grey-7">Avg Success</div></q-card-section
          ></q-card
        >
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="text-center"
          ><q-card-section
            ><q-icon name="check_circle" size="30px" color="positive" />
            <div class="text-h4 q-mt-sm">{{ testedCount }}</div>
            <div class="text-caption text-grey-7">Tested</div></q-card-section
          ></q-card
        >
      </div>
    </div>

    <div v-if="isLoading" class="text-center q-pa-xl"><LoadingSpinner /></div>
    <EmptyState
      v-else-if="strategies.length === 0"
      icon="restore"
      title="No Strategies"
      :action="{ label: 'Add Strategy', handler: () => (showCreateDialog = true) }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="s in strategies" :key="s.uuid" class="col-12 col-md-6 col-lg-4">
        <RecoveryStrategyCard :strategy="s" @edit="editStrategy(s)" @delete="deleteStrategy(s)" />
      </div>
    </div>

    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section
          ><div class="text-h6">
            {{ editingStrategy ? 'Edit' : 'Create' }} Strategy
          </div></q-card-section
        >
        <q-card-section>
          <q-form @submit.prevent="saveStrategy" class="q-gutter-md">
            <q-select
              v-model="form.bcp_id"
              :options="bcpOptions"
              label="BCP *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-select
              v-model="form.strategy_type"
              :options="['HotSite', 'ColdSite', 'CloudFailover', 'ManualWorkaround']"
              label="Type *"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model.number="form.estimated_cost"
              label="Est. Cost *"
              type="number"
              outlined
              dense
              prefix="$"
              :rules="[requiredRule]"
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn
                  flat
                  color="grey"
                  label="Cancel"
                  class="full-width"
                  v-close-popup
                  @click="resetForm"
                />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="editingStrategy ? 'Update' : 'Create'"
                  :loading="saving"
                  class="full-width"
                  unelevated
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBcmStore } from '../../stores/bcm/bcm.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import RecoveryStrategyCard from '../../components/bcm/RecoveryStrategyCard.vue'
import { formatCurrencyValue } from 'src/utils/number.utils'

const $q = useQuasar()
const bcmStore = useBcmStore()
const strategies = computed(() => bcmStore.recoveryStrategies)
const isLoading = computed(() => bcmStore.isLoadingStrategies)
const showCreateDialog = ref(false)
const editingStrategy = ref<any>(null)
const saving = ref(false)
const form = reactive({ bcp_id: '', strategy_type: '', estimated_cost: 0 })
const bcpOptions = [{ label: 'BCP-1', value: 'bcp-1' }]
const requiredRule = (val: any) => !!val || 'Required'

const totalCost = computed(() =>
  formatCurrencyValue(strategies.value.reduce((s: number, r: any) => s + (r.estimated_recovery_cost || 0), 0))
)
const avgSuccessRate = computed(() => {
  const d = strategies.value
  return d.length
    ? Math.round(d.reduce((s: number, r: any) => s + (r.test_success_rate || 0), 0) / d.length)
    : 0
})
const testedCount = computed(
  () => strategies.value.filter((r: any) => r.test_success_rate > 0).length
)

onMounted(() => loadStrategies())
async function loadStrategies(): Promise<void> {
  await bcmStore.loadRecoveryStrategies()
}
function editStrategy(s: any): void {
  editingStrategy.value = s
  form.bcp_id = s.business_continuity_plan_id
  form.strategy_type = s.recovery_strategy_type
  form.estimated_cost = s.estimated_recovery_cost
  showCreateDialog.value = true
}
async function saveStrategy(): Promise<void> {
  saving.value = true
  try {
    if (editingStrategy.value) {
      await bcmStore.updateRecoveryStrategy(editingStrategy.value.uuid, form as any)
      $q.notify({ type: 'positive', message: 'Updated' })
    } else {
      await bcmStore.createRecoveryStrategy(form as any)
      $q.notify({ type: 'positive', message: 'Created' })
    }
    showCreateDialog.value = false
    resetForm()
    await loadStrategies()
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    saving.value = false
  }
}
function deleteStrategy(s: any): void {
  $q.dialog({
    title: 'Delete',
    message: 'Delete this strategy?',
    cancel: true,
    ok: { color: 'negative' },
  }).onOk(async () => {
    await bcmStore.deleteRecoveryStrategy(s.uuid)
    $q.notify({ type: 'positive', message: 'Deleted' })
    await loadStrategies()
  })
}
function resetForm(): void {
  editingStrategy.value = null
  form.bcp_id = ''
  form.strategy_type = ''
  form.estimated_cost = 0
}
</script>
