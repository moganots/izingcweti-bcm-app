<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 700px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Business Impact Analysis</div>
        <div class="text-subtitle2 text-grey-7">
          {{ functionName }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <!-- Financial Impact -->
          <div class="text-subtitle1 q-mb-sm">Financial Impact</div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.financial_impact_daily"
                label="Daily Financial Impact ($)"
                outlined
                dense
                type="number"
                prefix="$"
                :rules="[requiredRule, positiveRule]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.financial_impact_total"
                label="Total Financial Impact ($)"
                outlined
                dense
                type="number"
                prefix="$"
                :rules="[requiredRule, positiveRule]"
              />
            </div>
          </div>

          <!-- Operational Impact -->
          <div class="text-subtitle1 q-mt-md q-mb-sm">Operational Impact</div>
          <q-input
            v-model="form.operational_impact"
            label="Operational Impact Description"
            type="textarea"
            outlined
            dense
            rows="3"
            :rules="[requiredRule]"
          />

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-select
                v-model="form.operational_impact_severity"
                :options="severityOptions"
                label="Severity"
                outlined
                dense
                emit-value
                map-options
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="form.downtime_cost_per_hour"
                label="Cost per Hour ($)"
                outlined
                dense
                type="number"
                prefix="$"
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="form.customers_affected"
                label="Customers Affected"
                outlined
                dense
                type="number"
              />
            </div>
          </div>

          <!-- Reputational Impact -->
          <div class="text-subtitle1 q-mt-md q-mb-sm">Reputational Impact</div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.reputational_impact"
                :options="impactLevelOptions"
                label="Reputational Impact Level"
                outlined
                dense
                emit-value
                map-options
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.reputational_impact_description"
                label="Description"
                type="textarea"
                outlined
                dense
                rows="2"
              />
            </div>
          </div>

          <!-- Regulatory Impact -->
          <div class="text-subtitle1 q-mt-md q-mb-sm">Regulatory Impact</div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.regulatory_impact"
                :options="regulatoryOptions"
                label="Regulatory Impact Level"
                outlined
                dense
                emit-value
                map-options
                :rules="[requiredRule]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.regulatory_impact_description"
                label="Description"
                type="textarea"
                outlined
                dense
                rows="2"
              />
            </div>
          </div>

          <!-- Additional Info -->
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="form.assessed_date" label="Assessment Date" type="date" outlined dense />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.assessed_by"
                label="Assessed By"
                outlined
                dense
                :rules="[requiredRule]"
              />
            </div>
          </div>

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
          label="Save BIA"
          :loading="loading"
          icon="save"
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
    functionName?: string
    biaData?: any
    loading?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: false,
    functionName: '',
    biaData: null,
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

const form = reactive({
  financial_impact_daily: 0,
  financial_impact_total: 0,
  operational_impact: '',
  operational_impact_severity: 'Medium',
  downtime_cost_per_hour: 0,
  customers_affected: 0,
  reputational_impact: 'Medium',
  reputational_impact_description: '',
  regulatory_impact: 'Medium',
  regulatory_impact_description: '',
  assessed_date: new Date().toISOString().split('T')[0],
  assessed_by: '',
  additional_notes: '',
})

watch(
  () => props.biaData,
  (data) => {
    if (data) {
      Object.assign(form, data)
    }
  },
  { immediate: true }
)

const severityOptions = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
]

const impactLevelOptions = [
  { label: 'None', value: 'None' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Severe', value: 'Severe' },
]

const regulatoryOptions = [
  { label: 'None', value: 'None' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
]

const requiredRule = (val: any) => !!val || 'This field is required'
const positiveRule = (val: number) => val >= 0 || 'Must be positive'

function handleSubmit(): void {
  if (!form.operational_impact || !form.assessed_by) return
  emit('submit', { ...form })
}
</script>