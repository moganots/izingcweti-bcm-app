<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ editing ? 'Edit Risk' : 'Create Risk' }}</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-select
          v-model="form.risk_category"
          :options="categoryOptions"
          label="Risk Category *"
          outlined
          dense
          :rules="[requiredRule]"
          emit-value
          map-options
        />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="form.likelihood"
              label="Likelihood (0-1) *"
              type="number"
              outlined
              dense
              min="0"
              max="1"
              step="0.01"
              :rules="[requiredRule, likelihoodRule]"
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="form.impact_severity"
              :options="severityOptions"
              label="Impact Severity *"
              outlined
              dense
              :rules="[requiredRule]"
              emit-value
              map-options
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="form.inherent_score"
              label="Inherent Risk Score *"
              type="number"
              outlined
              dense
              min="0"
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.residual_score"
              label="Residual Risk Score *"
              type="number"
              outlined
              dense
              min="0"
              :rules="[requiredRule, residualRule]"
            />
          </div>
        </div>

        <q-select
          v-model="form.mitigation_controls"
          :options="controlOptions"
          label="Mitigation Controls"
          outlined
          dense
          multiple
          use-chips
          emit-value
          map-options
        />

        <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
          {{ errorMessage }}
        </q-banner>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="primary"
              :label="editing ? 'Update' : 'Create'"
              :loading="submitting"
              class="full-width"
              unelevated
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    editing?: boolean
    initialData?: any
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    editing: false,
    initialData: null,
    submitting: false,
    errorMessage: '',
  }
)

const emit = defineEmits<{ submit: [data: any]; cancel: [] }>()

const form = reactive({
  risk_category: '',
  likelihood: 0,
  impact_severity: '',
  inherent_score: 0,
  residual_score: 0,
  mitigation_controls: [] as string[],
})

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.risk_category = data.risk_category || ''
      form.likelihood = data.likelihood || 0
      form.impact_severity = data.impact_severity || ''
      form.inherent_score = data.inherent_risk_score || 0
      form.residual_score = data.residual_risk_score || 0
      form.mitigation_controls = data.mitigation_control_ids || []
    }
  },
  { immediate: true }
)

const categoryOptions = [
  { label: 'Financial', value: 'Financial' },
  { label: 'Operational', value: 'Operational' },
  { label: 'Compliance & Legal', value: 'Compliance_and_Legal' },
  { label: 'Reputational', value: 'Reputational' },
  { label: 'People & Safety', value: 'People_and_Safety' },
  { label: 'Assets & IT', value: 'Assets_and_IT' },
  { label: 'Cyber', value: 'Cyber' },
  { label: 'Natural', value: 'Natural' },
  { label: 'Human', value: 'Human' },
  { label: 'Supply Chain', value: 'Supply' },
]

const severityOptions = [
  { label: 'Insignificant', value: 'Insignificant' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
]

const controlOptions = [
  { label: 'Control-001', value: 'Control-001' },
  { label: 'Control-002', value: 'Control-002' },
  { label: 'Control-003', value: 'Control-003' },
  { label: 'Control-004', value: 'Control-004' },
]

const requiredRule = (val: any) => !!val || val === 0 || 'Required'
const likelihoodRule = (val: number) => (val >= 0 && val <= 1) || 'Must be between 0 and 1'
const residualRule = (val: number) => {
  if (val > form.inherent_score) return 'Residual cannot exceed inherent score'
  return true
}

function handleSubmit(): void {
  emit('submit', { ...form })
}
</script>
