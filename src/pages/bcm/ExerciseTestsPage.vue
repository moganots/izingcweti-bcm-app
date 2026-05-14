<!-- src/pages/bcm/ExerciseTestsPage.vue -->
<template>
  <q-page padding>
    <div class="page-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h5 q-mb-xs">Exercise Tests</h4>
          <p class="text-grey-7 q-mb-none">Schedule and track BCP exercise tests</p>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Schedule Test"
          unelevated
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Tabs: Upcoming / Past -->
    <q-tabs
      v-model="activeTab"
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="upcoming" icon="event" label="Upcoming" />
      <q-tab name="past" icon="history" label="Past" />
      <q-tab name="all" icon="list" label="All" />
    </q-tabs>

    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <EmptyState
      v-else-if="filteredTests.length === 0"
      icon="playlist_add_check"
      title="No Exercise Tests"
      description="Schedule your first BCP exercise test."
      :action="{ label: 'Schedule Test', handler: () => (showCreateDialog = true) }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="test in filteredTests" :key="test.uuid" class="col-12 col-md-6 col-lg-4">
        <q-card class="test-card" flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="getTypeColor(test.exercise_test_type)"
                :label="test.exercise_test_type"
                class="q-px-sm q-py-xs"
              />
              <q-icon
                :name="test.passed ? 'check_circle' : 'schedule'"
                :color="test.passed ? 'green' : 'orange'"
                size="24px"
              />
            </div>

            <div class="text-h6 q-mb-xs">
              {{ test.business_continuity_plan?.critical_function?.name }}
            </div>
            <div class="text-grey-7 text-body2 q-mb-sm">{{ formatDate(test.date) }}</div>

            <q-separator class="q-mb-sm" />

            <div class="row items-center q-mb-sm">
              <q-icon name="people" size="20px" color="grey" class="q-mr-sm" />
              <span>{{ test.participants?.length || 0 }} participants</span>
            </div>

            <div v-if="test.passed" class="bg-green-1 q-pa-sm rounded-borders">
              <div class="text-green-8 text-caption font-weight-bold">Lessons Learned:</div>
              <div class="text-body2">{{ truncateText(test.lessons_learned, 100) }}</div>
            </div>

            <div v-if="test.corrective_actions" class="bg-orange-1 q-pa-sm rounded-borders q-mt-sm">
              <div class="text-orange-8 text-caption font-weight-bold">Corrective Actions:</div>
              <div class="text-body2">{{ truncateText(test.corrective_actions, 100) }}</div>
            </div>
          </q-card-section>

          <q-card-actions v-if="!test.passed" align="right">
            <q-btn
              flat
              color="green"
              icon="check"
              label="Record Result"
              @click="recordResult(test)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Create Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Schedule Exercise Test</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveTest" class="q-gutter-md">
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
              v-model="form.test_type"
              :options="testTypeOptions"
              label="Test Type"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="form.date"
              label="Test Date"
              type="date"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-select
              v-model="form.participants"
              :options="userOptions"
              label="Participants"
              outlined
              dense
              multiple
              use-chips
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="primary" label="Schedule" :loading="isSaving" @click="saveTest" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Record Result Dialog -->
    <q-dialog v-model="showResultDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Record Test Result</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveResult" class="q-gutter-md">
            <q-toggle v-model="resultForm.passed" label="Test Passed" color="green" />
            <q-input
              v-model="resultForm.lessons_learned"
              label="Lessons Learned"
              outlined
              type="textarea"
              rows="3"
              :rules="[requiredRule]"
            />
            <q-input
              v-model="resultForm.corrective_actions"
              label="Corrective Actions"
              outlined
              type="textarea"
              rows="3"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="primary" label="Save Result" :loading="isSaving" @click="saveResult" />
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
import { formatDate } from '../../utils/formatters'

const $q = useQuasar()

const tests = ref<any[]>([])
const bcps = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const activeTab = ref('upcoming')
const showCreateDialog = ref(false)
const showResultDialog = ref(false)
const editingTest = ref<any>(null)

const form = reactive({ bcp_id: '', test_type: '', date: '', participants: [] as string[] })
const resultForm = reactive({ passed: true, lessons_learned: '', corrective_actions: '' })

const filteredTests = computed(() => {
  const now = new Date()
  if (activeTab.value === 'upcoming')
    return tests.value.filter((t) => new Date(t.date) >= now && !t.passed)
  if (activeTab.value === 'past')
    return tests.value.filter((t) => new Date(t.date) < now || t.passed)
  return tests.value
})

const testTypeOptions = ['Tabletop', 'Walkthrough', 'Full']
const userOptions = [{ label: 'Demo User', value: 'demo@example.com' }]
const bcpOptions = computed(() =>
  bcps.value.map((b: any) => ({ label: b.critical_function?.name || 'Unknown', value: b.uuid }))
)
const requiredRule = (val: any) => !!val || 'Required'

onMounted(async () => {
  await Promise.all([loadTests(), loadBCPs()])
})

async function loadTests(): Promise<void> {
  isLoading.value = true
  try {
    const response = await BcmService.getExerciseTests()
    tests.value = response.data || []
  } catch (error) {
    console.error('Failed to load tests:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadBCPs(): Promise<void> {
  try {
    const response = await BcmService.getBCPs({ status: 'Active' })
    bcps.value = response.data || []
  } catch (error) {
    console.error('Failed to load BCPs:', error)
  }
}

async function saveTest(): Promise<void> {
  isSaving.value = true
  try {
    await BcmService.createExerciseTest(form)
    $q.notify({ type: 'positive', message: 'Test scheduled' })
    showCreateDialog.value = false
    await loadTests()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to schedule test' })
  } finally {
    isSaving.value = false
  }
}

function recordResult(test: any): void {
  editingTest.value = test
  showResultDialog.value = true
}

async function saveResult(): Promise<void> {
  isSaving.value = true
  try {
    await BcmService.recordTestResult(editingTest.value.uuid, resultForm)
    $q.notify({ type: 'positive', message: 'Result recorded' })
    showResultDialog.value = false
    await loadTests()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to save result' })
  } finally {
    isSaving.value = false
  }
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = { Tabletop: 'blue', Walkthrough: 'orange', Full: 'red' }
  return colors[type] || 'grey'
}

function truncateText(text: string, max: number): string {
  return text?.length > max ? text.substring(0, max) + '...' : text || ''
}
</script>
