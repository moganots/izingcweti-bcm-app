<template>
  <q-page padding>
    <PageHeader
      title="Critical Functions"
      subtitle="Identify and manage critical business functions"
      show-refresh
      @refresh="loadFunctions"
    >
      <template #actions>
        <q-btn dense round color="primary" icon="post_add" @click="showCreateDialog = true" />
      </template>
    </PageHeader>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <SearchBar v-model="search" placeholder="Search functions..." @search="loadFunctions" />
      </div>
    </div>

    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading critical functions..." />
    </div>
    <EmptyState
      v-else-if="functions.length === 0"
      icon="functions"
      title="No Critical Functions"
      description="Create your first critical function to get started."
      :action="{ label: 'Add Function', handler: () => (showCreateDialog = true) }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="func in functions" :key="func.uuid" class="col-12 col-md-6 col-lg-4">
        <CriticalFunctionCard
          :func="func"
          @click="viewFunction(func)"
          @edit="editFunction(func)"
          @view-bia="viewBIA(func)"
          @delete="confirmDelete(func)"
        />
      </div>
    </div>

    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section
          ><div class="text-h6">
            {{ editingFunc ? 'Edit' : 'Create' }} Critical Function
          </div></q-card-section
        >
        <q-card-section>
          <q-form @submit.prevent="saveFunction" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Function Name *"
              outlined
              dense
              :rules="[requiredRule]"
              autofocus
            />
            <q-select
              v-model="form.department_id"
              :options="deptOptions"
              label="Department *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
            <q-input
              v-model="form.max_tolerable_outage"
              label="Max Tolerable Outage (MTO) *"
              outlined
              dense
              placeholder="e.g., 4 hours"
              :rules="[requiredRule]"
            />
            <q-input
              v-model="form.work_recovery_time"
              label="Work Recovery Time (WRT) *"
              outlined
              dense
              placeholder="e.g., 2 hours"
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
                  :label="editingFunc ? 'Update' : 'Create'"
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
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBcmStore } from '../../stores/bcm/bcm.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import SearchBar from '../../components/.common/SearchBar.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import CriticalFunctionCard from '../../components/bcm/CriticalFunctionCard.vue'

const router = useRouter()
const $q = useQuasar()
const bcmStore = useBcmStore()

const functions = computed(() => bcmStore.criticalFunctions)
const isLoading = computed(() => bcmStore.isLoadingFunctions)
const search = ref('')
const showCreateDialog = ref(false)
const editingFunc = ref<any>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  department_id: '',
  max_tolerable_outage: '',
  work_recovery_time: '',
})
const deptOptions = [
  { label: 'IT Operations', value: 'dept-1' },
  { label: 'Finance', value: 'dept-2' },
]
const requiredRule = (val: any) => !!val || 'Required'

onMounted(() => loadFunctions())

async function loadFunctions(): Promise<void> {
  await bcmStore.loadCriticalFunctions({ search: search.value })
}
function viewFunction(func: any): void {
  console.log('View:', func)
}
function viewBIA(func: any): void {
  if (func.business_impact_assessment)
    router.push(`/bcm/bia/${func.business_impact_assessment.uuid}`)
  else router.push(`/bcm/bia/create?function_id=${func.uuid}`)
}

function editFunction(func: any): void {
  editingFunc.value = func
  form.name = func.name
  form.department_id = func.department_id
  form.max_tolerable_outage = func.max_tolerable_outage
  form.work_recovery_time = func.work_recovery_time
  showCreateDialog.value = true
}

async function saveFunction(): Promise<void> {
  saving.value = true
  try {
    if (editingFunc.value) {
      await bcmStore.updateCriticalFunction(editingFunc.value.uuid, form)
      $q.notify({ type: 'positive', message: 'Updated' })
    } else {
      await bcmStore.createCriticalFunction(form)
      $q.notify({ type: 'positive', message: 'Created' })
    }
    showCreateDialog.value = false
    resetForm()
    await loadFunctions()
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    saving.value = false
  }
}

function confirmDelete(func: any): void {
  $q.dialog({
    title: 'Delete',
    message: `Delete "${func.name}"?`,
    cancel: true,
    ok: { color: 'negative' },
  }).onOk(async () => {
    await bcmStore.deleteCriticalFunction(func.uuid)
    $q.notify({ type: 'positive', message: 'Deleted' })
    await loadFunctions()
  })
}

function resetForm(): void {
  editingFunc.value = null
  form.name = ''
  form.department_id = ''
  form.max_tolerable_outage = ''
  form.work_recovery_time = ''
}
</script>
