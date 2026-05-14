<!-- src/pages/bcm/CriticalFunctionsPage.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Critical Functions</h4>
          <p class="text-grey-7 q-mb-none">Identify and manage critical business functions</p>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Add Function"
          unelevated
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filters.search"
              outlined
              dense
              placeholder="Search functions..."
              clearable
              @update:model-value="loadFunctions"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.department"
              outlined
              dense
              :options="departmentOptions"
              label="Department"
              clearable
              emit-value
              map-options
              @update:model-value="loadFunctions"
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
              @update:model-value="loadFunctions"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
      <p class="text-grey-7 q-mt-md">Loading critical functions...</p>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="functions.length === 0"
      icon="functions"
      title="No Critical Functions"
      description="No critical functions found. Create your first critical function to get started."
      :action="{ label: 'Add Function', handler: () => (showCreateDialog = true) }"
    />

    <!-- Functions List -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="func in functions" :key="func.uuid" class="col-12 col-md-6 col-lg-4">
        <q-card class="function-card" flat bordered @click="viewFunction(func)">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getPriorityColor(func.max_tolerable_outage)"
                :label="'MTO: ' + func.max_tolerable_outage"
                class="q-px-sm q-py-xs"
              />
              <q-btn flat round size="sm" icon="more_vert" @click.stop>
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="editFunction(func)">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="viewBIA(func)">
                      <q-item-section avatar>
                        <q-icon name="assessment" />
                      </q-item-section>
                      <q-item-section>View BIA</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="confirmDelete(func)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="text-h6 q-mb-xs">{{ func.name }}</div>
            <p class="text-grey-7 text-body2 q-mb-md">
              {{ func.department?.name || 'No department' }}
            </p>

            <q-separator class="q-mb-sm" />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="text-caption text-grey-6">Work Recovery Time</div>
                <div class="text-body2 text-weight-medium">{{ func.work_recovery_time }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Dependencies</div>
                <div class="text-body2 text-weight-medium">
                  {{ func.dependency_ids?.length || 0 }} functions
                </div>
              </div>
            </div>

            <!-- BIA Status -->
            <div class="q-mt-sm">
              <q-badge
                :color="func.business_impact_assessment ? 'green' : 'orange'"
                :label="func.business_impact_assessment ? 'BIA Completed' : 'BIA Pending'"
                class="q-px-sm q-py-xs"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ editingFunction ? 'Edit' : 'Create' }} Critical Function</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveFunction" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Function Name"
              outlined
              dense
              lazy-rules
              :rules="[requiredRule]"
              autofocus
            />

            <q-select
              v-model="form.department_id"
              :options="departmentOptions"
              label="Department"
              outlined
              dense
              lazy-rules
              :rules="[requiredRule]"
              emit-value
              map-options
            />

            <q-input
              v-model="form.max_tolerable_outage"
              label="Maximum Tolerable Outage (MTO)"
              outlined
              dense
              placeholder="e.g., 4 hours"
              lazy-rules
              :rules="[requiredRule]"
            />

            <q-input
              v-model="form.work_recovery_time"
              label="Work Recovery Time (WRT)"
              outlined
              dense
              placeholder="e.g., 2 hours"
              lazy-rules
              :rules="[requiredRule]"
            />

            <q-select
              v-model="form.dependency_ids"
              :options="functionOptions.filter((f) => f.value !== editingFunction?.uuid)"
              label="Dependencies"
              outlined
              dense
              multiple
              use-chips
              emit-value
              map-options
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup @click="resetForm" />
          <q-btn
            color="primary"
            :label="editingFunction ? 'Update' : 'Create'"
            :loading="isSaving"
            @click="saveFunction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { BcmService } from '../../services/api/BcmService'
import EmptyState from '../../components/common/EmptyState.vue'

const router = useRouter()
const $q = useQuasar()

// State
const functions = ref<any[]>([])
const departments = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showCreateDialog = ref(false)
const editingFunction = ref<any>(null)

const filters = reactive({
  search: '',
  department: null,
  sortBy: 'name',
})

const form = reactive({
  name: '',
  department_id: '',
  max_tolerable_outage: '',
  work_recovery_time: '',
  dependency_ids: [] as string[],
})

// Options
const departmentOptions = computed(() =>
  departments.value.map((d: any) => ({ label: d.name, value: d.uuid }))
)

const functionOptions = computed(() =>
  functions.value.map((f: any) => ({ label: f.name, value: f.uuid }))
)

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'MTO', value: 'max_tolerable_outage' },
  { label: 'Department', value: 'department' },
  { label: 'Created Date', value: 'created_at' },
]

const requiredRule = (val: any) => !!val || 'This field is required'

// Lifecycle
onMounted(async () => {
  await loadFunctions()
  await loadDepartments()
})

// Methods
async function loadFunctions(): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getCriticalFunctions(filters)
    functions.value = response.data || []
  } catch (error) {
    console.error('Failed to load functions:', error)
    $q.notify({ type: 'negative', message: 'Failed to load critical functions' })
  } finally {
    isLoading.value = false
  }
}

async function loadDepartments(): Promise<void> {
  try {
    const response = await BcmService.getDepartments()
    departments.value = response.data || []
  } catch (error) {
    console.error('Failed to load departments:', error)
  }
}

function viewFunction(func: any): void {
  // Navigate to detail or show details
  console.log('View function:', func)
}

function viewBIA(func: any): void {
  if (func.business_impact_assessment) {
    router.push(`/bcm/bia/${func.business_impact_assessment.uuid}`)
  } else {
    router.push(`/bcm/bia/create?function_id=${func.uuid}`)
  }
}

function editFunction(func: any): void {
  editingFunction.value = func
  form.name = func.name
  form.department_id = func.department_id
  form.max_tolerable_outage = func.max_tolerable_outage
  form.work_recovery_time = func.work_recovery_time
  form.dependency_ids = func.dependency_ids || []
  showCreateDialog.value = true
}

async function saveFunction(): Promise<void> {
  if (!form.name || !form.department_id || !form.max_tolerable_outage || !form.work_recovery_time) {
    $q.notify({ type: 'negative', message: 'Please fill all required fields' })
    return
  }

  isSaving.value = true
  try {
    if (editingFunction.value) {
      await BcmService.updateCriticalFunction(editingFunction.value.uuid, form)
      $q.notify({ type: 'positive', message: 'Function updated successfully' })
    } else {
      await BcmService.createCriticalFunction(form)
      $q.notify({ type: 'positive', message: 'Function created successfully' })
    }

    showCreateDialog.value = false
    resetForm()
    await loadFunctions()
  } catch (error) {
    console.error('Failed to save function:', error)
    $q.notify({ type: 'negative', message: 'Failed to save critical function' })
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(func: any): void {
  $q.dialog({
    title: 'Delete Critical Function',
    message: `Are you sure you want to delete "${func.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await BcmService.deleteCriticalFunction(func.uuid)
      $q.notify({ type: 'positive', message: 'Function deleted successfully' })
      await loadFunctions()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete function' })
    }
  })
}

function resetForm(): void {
  editingFunction.value = null
  form.name = ''
  form.department_id = ''
  form.max_tolerable_outage = ''
  form.work_recovery_time = ''
  form.dependency_ids = []
}

function getPriorityColor(mto: string): string {
  if (!mto) return 'grey'
  const hours = parseInt(mto)
  if (hours <= 1) return 'red'
  if (hours <= 4) return 'orange'
  if (hours <= 8) return 'yellow'
  return 'green'
}
</script>

<style lang="scss" scoped>
.function-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
