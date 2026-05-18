<template>
  <q-page padding>
    <PageHeader
      title="Exercise Tests"
      subtitle="Schedule and track BCP exercise tests"
      show-refresh
      @refresh="loadTests"
    >
      <template #actions
        ><q-btn
          color="primary"
          icon="add"
          label="Schedule Test"
          unelevated
          @click="showCreateDialog = true"
      /></template>
    </PageHeader>

    <q-tabs
      v-model="activeTab"
      class="q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="upcoming" icon="event" label="Upcoming" /><q-tab
        name="past"
        icon="history"
        label="Past"
      /><q-tab name="all" icon="list" label="All" />
    </q-tabs>

    <div v-if="isLoading" class="text-center q-pa-xl"><LoadingSpinner /></div>
    <EmptyState
      v-else-if="filteredTests.length === 0"
      icon="playlist_add_check"
      title="No Tests"
      :action="{ label: 'Schedule Test', handler: () => (showCreateDialog = true) }"
    />

    <div v-else class="row q-col-gutter-md">
      <div v-for="test in filteredTests" :key="test.uuid" class="col-12 col-md-6 col-lg-4">
        <ExerciseTestCard :test="test" @record-result="recordResult(test)" />
      </div>
    </div>

    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Schedule Test</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveTest" class="q-gutter-md">
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
              v-model="form.test_type"
              :options="['Tabletop', 'Walkthrough', 'Full']"
              label="Type *"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <q-input
              v-model="form.date"
              label="Date *"
              type="date"
              outlined
              dense
              :rules="[requiredRule]"
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Schedule"
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

    <q-dialog v-model="showResultDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section><div class="text-h6">Record Result</div></q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveResult" class="q-gutter-md">
            <q-toggle v-model="resultForm.passed" label="Test Passed" color="green" />
            <q-input
              v-model="resultForm.lessons_learned"
              label="Lessons Learned *"
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
              rows="2"
            />
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn flat color="grey" label="Cancel" class="full-width" v-close-popup />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Save"
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
import ExerciseTestCard from '../../components/bcm/ExerciseTestCard.vue'

const $q = useQuasar()
const bcmStore = useBcmStore()
const tests = computed(() => bcmStore.exerciseTests)
const isLoading = computed(() => bcmStore.isLoadingTests)
const activeTab = ref('upcoming')
const showCreateDialog = ref(false)
const showResultDialog = ref(false)
const saving = ref(false)
const editingTest = ref<any>(null)
const form = reactive({ bcp_id: '', test_type: '', date: '' })
const resultForm = reactive({ passed: true, lessons_learned: '', corrective_actions: '' })
const bcpOptions = [{ label: 'BCP-1', value: 'bcp-1' }]
const requiredRule = (val: any) => !!val || 'Required'

const filteredTests = computed(() => {
  const now = new Date()
  if (activeTab.value === 'upcoming')
    return tests.value.filter((t: any) => new Date(t.date) >= now && !t.passed)
  if (activeTab.value === 'past')
    return tests.value.filter((t: any) => new Date(t.date) < now || t.passed)
  return tests.value
})

onMounted(() => loadTests())
async function loadTests(): Promise<void> {
  await bcmStore.loadExerciseTests()
}
async function saveTest(): Promise<void> {
  saving.value = true
  try {
    await bcmStore.createExerciseTest(form)
    $q.notify({ type: 'positive', message: 'Scheduled' })
    showCreateDialog.value = false
    await loadTests()
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    saving.value = false
  }
}
function recordResult(test: any): void {
  editingTest.value = test
  showResultDialog.value = true
}
async function saveResult(): Promise<void> {
  saving.value = true
  try {
    await bcmStore.recordTestResult(editingTest.value.uuid, resultForm)
    $q.notify({ type: 'positive', message: 'Recorded' })
    showResultDialog.value = false
    await loadTests()
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    saving.value = false
  }
}
</script>
