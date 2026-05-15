<template>
  <q-page padding>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading critical function..." />
    </div>

    <!-- Not Found -->
    <div v-else-if="!func" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="80px" color="grey" />
      <h5 class="text-grey-7 q-mt-md">Critical Function Not Found</h5>
      <q-btn color="primary" label="Back" @click="$router.push('/bcm/critical-functions')" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back & Actions -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back"
          @click="$router.push('/bcm/critical-functions')"
        />
        <div class="q-gutter-sm">
          <q-btn color="primary" icon="edit" label="Edit" outline @click="openEditDialog" />
          <q-btn color="negative" icon="delete" label="Delete" outline @click="confirmDelete" />
        </div>
      </div>

      <!-- Header -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h5 class="text-h5 q-mb-xs">{{ func.name }}</h5>
              <p class="text-grey-7 q-mb-none">
                {{ func.department?.name || 'No department' }} | Created:
                {{ formatDate(func.created_at) }}
              </p>
            </div>
            <q-badge
              :color="getPriorityColor(func.max_tolerable_outage)"
              :label="'MTO: ' + func.max_tolerable_outage"
              class="q-px-lg q-py-sm"
              style="font-size: 16px"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Details Grid -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-4">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="timer" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Max Tolerable Outage</div>
              <div class="text-h6">{{ func.max_tolerable_outage }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-4">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="restore" size="30px" color="info" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Work Recovery Time</div>
              <div class="text-h6">{{ func.work_recovery_time }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-md-4">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <q-icon name="account_tree" size="30px" color="secondary" class="q-mb-sm" />
              <div class="text-caption text-grey-7">Dependencies</div>
              <div class="text-h6">{{ func.dependency_ids?.length || 0 }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Dependencies List -->
      <q-card v-if="func.dependency_ids?.length" class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Dependent Functions</div>
          <q-list separator>
            <q-item v-for="depId in func.dependency_ids" :key="depId">
              <q-item-section avatar>
                <q-icon name="functions" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ depId }}</q-item-label>
                <q-item-label caption>Function ID</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- BIA Status -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Business Impact Analysis</div>
            <StatusBadge
              :status="func.business_impact_assessment ? 'COMPLETED' : 'PENDING'"
              type="document"
            />
          </div>
          <div v-if="func.business_impact_assessment">
            <p class="text-grey-7">A BIA has been completed for this function.</p>
            <q-btn
              color="primary"
              icon="visibility"
              label="View BIA"
              outline
              @click="$router.push(`/bcm/bia/${func.business_impact_assessment.uuid}`)"
            />
          </div>
          <div v-else>
            <p class="text-grey-7">No BIA has been completed for this function yet.</p>
            <q-btn
              color="primary"
              icon="add"
              label="Create BIA"
              unelevated
              @click="$router.push(`/bcm/bia/create?function_id=${func.uuid}`)"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- BCP Status -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Business Continuity Plan</div>
            <StatusBadge
              :status="func.business_continuity_plan ? 'COMPLETED' : 'PENDING'"
              type="document"
            />
          </div>
          <div v-if="func.business_continuity_plan">
            <p class="text-grey-7">A BCP has been created for this function.</p>
            <q-btn
              color="primary"
              icon="visibility"
              label="View BCP"
              outline
              @click="$router.push(`/bcm/bcp/${func.business_continuity_plan.uuid}`)"
            />
          </div>
          <div v-else>
            <p class="text-grey-7">No BCP has been created for this function yet.</p>
            <q-btn
              color="primary"
              icon="add"
              label="Create BCP"
              unelevated
              @click="$router.push(`/bcm/bcp/create?function_id=${func.uuid}`)"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Lifecycle Progress -->
      <BcmProgressTracker
        :function-id="func.uuid"
        :has-b-i-a="!!func.business_impact_assessment"
        :has-b-c-p="!!func.business_continuity_plan"
        :has-strategies="!!func.business_continuity_plan?.recovery_strategies?.length"
        :has-tests="!!func.business_continuity_plan?.exercise_tests?.length"
        @navigate="handleNavigate"
      />
    </template>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Edit Critical Function</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="handleUpdate" class="q-gutter-md">
            <q-input
              v-model="editForm.name"
              label="Function Name *"
              outlined
              dense
              :rules="[requiredRule]"
              autofocus
            />
            <q-select
              v-model="editForm.department_id"
              :options="deptOptions"
              label="Department *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-input
              v-model="editForm.max_tolerable_outage"
              label="Max Tolerable Outage *"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="editForm.work_recovery_time"
              label="Work Recovery Time *"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-select
              v-model="editForm.dependency_ids"
              :options="functionOptions"
              label="Dependencies"
              outlined
              dense
              multiple
              use-chips
              emit-value
              map-options
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Update"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBcmStore } from '../../stores/bcm.store'
import { formatDate } from '../../utils/date.utils'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import StatusBadge from '../../components/.common/StatusBadge.vue'
import BcmProgressTracker from '../../components/bcm/BcmProgressTracker.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const bcmStore = useBcmStore()

const func = computed(() => bcmStore.selectedFunction)
const isLoading = ref(true)
const saving = ref(false)
const showEditDialog = ref(false)

const editForm = reactive({
  name: '',
  department_id: '',
  max_tolerable_outage: '',
  work_recovery_time: '',
  dependency_ids: [] as string[],
})

const deptOptions = [
  { label: 'IT Operations', value: 'dept-1' },
  { label: 'Finance', value: 'dept-2' },
]

const functionOptions: Array<{ label: string; value: string }> = []
const requiredRule = (val: any) => !!val || 'Required'

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await bcmStore.loadCriticalFunction(id)
    isLoading.value = false
  }
})

function getPriorityColor(mto: string): string {
  if (!mto) return 'grey'
  const hours = parseInt(mto)
  if (hours <= 1) return 'red'
  if (hours <= 4) return 'orange'
  if (hours <= 8) return 'yellow'
  return 'green'
}

function openEditDialog(): void {
  if (!func.value) return
  editForm.name = func.value.name
  editForm.department_id = func.value.department_id
  editForm.max_tolerable_outage = func.value.max_tolerable_outage
  editForm.work_recovery_time = func.value.work_recovery_time
  editForm.dependency_ids = func.value.dependency_ids || []
  showEditDialog.value = true
}

async function handleUpdate(): Promise<void> {
  if (!func.value) return
  saving.value = true
  try {
    await bcmStore.updateCriticalFunction(func.value.uuid, editForm)
    $q.notify({ type: 'positive', message: 'Function updated' })
    showEditDialog.value = false
    await bcmStore.loadCriticalFunction(func.value.uuid)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to update' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(): void {
  $q.dialog({
    title: 'Delete Critical Function',
    message: `Delete "${func.value?.name}"? This cannot be undone.`,
    cancel: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await bcmStore.deleteCriticalFunction(func!?.value!?.uuid)
      $q.notify({ type: 'positive', message: 'Function deleted' })
      router.push('/bcm/critical-functions')
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to delete' })
    }
  })
}

function handleNavigate(route: string): void {
  router.push(route)
}
</script>
