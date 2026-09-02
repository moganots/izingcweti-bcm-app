<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Reassess Risk</div>
        <div class="text-subtitle2 text-grey-7">{{ risk?.title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <div class="text-subtitle2 q-mb-sm">Current Scores</div>
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-6">Inherent</div>
              <div class="text-h6">{{ currentInherent }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Residual</div>
              <div class="text-h6">{{ currentResidual }}</div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="form.inherentLikelihood"
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
                v-model="form.impactSeverity"
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
                v-model.number="form.residualLikelihood"
                label="Residual Likelihood (0-1)"
                type="number"
                outlined
                dense
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.residualImpact"
                :options="severityOptions"
                label="Residual Impact"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>
          </div>

          <q-input
            v-model="form.reassessmentNotes"
            label="Reassessment Notes"
            outlined
            dense
            type="textarea"
            rows="3"
            placeholder="Explain the changes in risk assessment..."
          />

          <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>
            {{ errorMessage }}
          </q-banner>

          <div class="row q-gutter-md">
            <div class="col">
              <q-btn flat label="Cancel" color="grey" class="full-width" v-close-popup @click="$emit('cancel')" />
            </div>
            <div class="col">
              <q-btn
                type="submit"
                color="primary"
                icon="refresh"
                label="Reassess"
                :loading="submitting"
                class="full-width"
                unelevated
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    risk?: any
    submitting?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    risk: null,
    submitting: false,
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

const currentInherent = computed(() => {
  return props.risk?.inherentRiskScore || props.risk?.inherent_risk_score || 0
})

const currentResidual = computed(() => {
  return props.risk?.residualRiskScore || props.risk?.residual_risk_score || 0
})

const form = reactive({
  inherentLikelihood: 0,
  impactSeverity: '',
  residualLikelihood: 0,
  residualImpact: '',
  reassessmentNotes: '',
})

const severityOptions = [
  { label: 'Insignificant', value: 'Insignificant' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
]

const requiredRule = (val: any) => !!val || val === 0 || 'This field is required'
const likelihoodRule = (val: number) => (val >= 0 && val <= 1) || 'Must be between 0 and 1'

watch(
  () => props.risk,
  (risk) => {
    if (risk) {
      form.inherentLikelihood = risk.inherentLikelihood || risk.inherent_likelihood || 0
      form.impactSeverity = risk.impactSeverity || risk.impact_severity || ''
      form.residualLikelihood = risk.residualLikelihood || risk.residual_likelihood || 0
      form.residualImpact = risk.residualImpact || risk.residual_impact || ''
    }
  },
  { immediate: true }
)

function handleSubmit(): void {
  if (!form.inherentLikelihood || !form.impactSeverity) return
  emit('submit', { ...form })
}
</script>