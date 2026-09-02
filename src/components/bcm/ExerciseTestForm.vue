<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 600px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit' : 'Schedule' }} Exercise Test</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-select
            v-model="form.bcp_id"
            :options="bcpOptions"
            label="BCP"
            outlined
            dense
            emit-value
            map-options
            :rules="[requiredRule]"
          />

          <q-select
            v-model="form.exercise_test_type"
            :options="typeOptions"
            label="Test Type"
            outlined
            dense
            emit-value
            map-options
            :rules="[requiredRule]"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="form.date" label="Test Date" type="datetime-local" outlined dense />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.passed"
                :options="resultOptions"
                label="Test Result"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <q-input
            v-model="form.objectives"
            label="Test Objectives"
            type="textarea"
            outlined
            dense
            rows="2"
          />

          <q-input
            v-model="form.scenario_description"
            label="Scenario Description"
            type="textarea"
            outlined
            dense
            rows="2"
          />

          <div class="text-subtitle1 q-mt-md q-mb-sm">Participants</div>
          <q-input
            v-model="form.participants"
            label="Participants (comma separated)"
            outlined
            dense
            hint="Enter names or emails separated by commas"
          />

          <q-input
            v-model="form.lessons_learned"
            label="Lessons Learned"
            type="textarea"
            outlined
            dense
            rows="3"
          />

          <q-input
            v-model="form.corrective_actions"
            label="Corrective Actions"
            type="textarea"
            outlined
            dense
            rows="3"
          />

          <q-input
            v-model="form.additional_notes"
            label="Additional Notes"
            type="textarea"
            outlined
            dense
            rows="2"
          />

          <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
            {{ errorMessage }}
          </q-banner>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" v-close-popup @click="$emit('cancel')" />
        <q-btn
          color="primary"
          :label="isEditing ? 'Update' : 'Schedule'"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    testData?: any
    bcps?: any[]
    loading?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    testData: null,
    bcps: () => [],
    loading: false,
    errorMessage: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
  cancel: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEditing = computed(() => !!props.testData?.id)

const form = reactive({
  bcp_id: null as string | null,
  exercise_test_type: 'Tabletop',
  date: '',
  passed: null as boolean | null,
  objectives: '',
  scenario_description: '',
  participants: '',
  lessons_learned: '',
  corrective_actions: '',
  additional_notes: '',
})

watch(
  () => props.testData,
  (data) => {
    if (data) {
      Object.assign(form, data)
    }
  },
  { immediate: true }
)

const bcpOptions = computed(() =>
  props.bcps.map((b) => ({
    label: b.critical_function?.name || 'Unknown',
    value: b.id,
  }))
)

const typeOptions = [
  { label: 'Tabletop', value: 'Tabletop' },
  { label: 'Walkthrough', value: 'Walkthrough' },
  { label: 'Full', value: 'Full' },
]

const resultOptions = [
  { label: 'Passed', value: true },
  { label: 'Failed', value: false },
  { label: 'Not Completed', value: null },
]

const requiredRule = (val: any) => !!val || 'This field is required'

function handleSubmit(): void {
  if (!form.bcp_id || !form.exercise_test_type) return
  emit('submit', { ...form })
}
</script>