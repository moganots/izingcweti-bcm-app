<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ editing ? 'Edit Workflow' : 'Create Workflow' }}</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-select v-model="form.workflow_type" :options="typeOptions" label="Workflow Type *" outlined dense
          :rules="[requiredRule]" emit-value map-options />
        <q-input v-model="form.title" label="Title *" outlined dense :rules="[requiredRule]" autocomplete="off" />
        <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2" />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select v-model="form.priority" :options="priorityOptions" label="Priority" outlined dense emit-value
              map-options />
          </div>
          <div class="col-6">
            <q-input v-model="form.due_date" label="Due Date" type="date" outlined dense />
          </div>
        </div>

        <q-select v-model="form.assigned_to" :options="userOptions" label="Assign To" outlined dense clearable
          emit-value map-options />
        <q-select v-model="form.entity_type" :options="entityOptions" label="Related Entity Type" outlined dense
          clearable />
        <q-input v-model="form.entity_id" label="Related Entity ID" outlined dense v-if="form.entity_type" />

        <q-banner v-if="errorMessage" class="bg-red-1 text-red-8 rounded-borders" rounded>{{
          errorMessage
        }}</q-banner>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn flat color="grey" label="Cancel" class="full-width" @click="$emit('cancel')" />
          </div>
          <div class="col-6">
            <q-btn type="submit" color="primary" :label="editing ? 'Update' : 'Create'" :loading="submitting"
              class="full-width" unelevated />
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
    userOptions?: Array<{ label: string; value: string }>
  }>(),
  {
    editing: false,
    initialData: null,
    submitting: false,
    errorMessage: '',
    userOptions: () => [],
  }
)
const emit = defineEmits<{ submit: [data: any]; cancel: [] }>()

const form = reactive({
  workflow_type: '',
  title: '',
  description: '',
  priority: 3,
  due_date: '',
  assigned_to: '',
  entity_type: '',
  entity_id: '',
})

watch(
  () => props.initialData,
  (data) => {
    if (data) Object.assign(form, data)
  },
  { immediate: true }
)

const typeOptions = [
  { label: 'Policy Approval', value: 'PolicyApproval' },
  { label: 'Risk Assessment', value: 'RiskAssessment' },
  { label: 'BIA Review', value: 'BIAReview' },
  { label: 'BCP Approval', value: 'BCPApproval' },
  { label: 'Strategy Approval', value: 'StrategyApproval' },
  { label: 'Test Review', value: 'TestReview' },
  { label: 'Incident Management', value: 'IncidentManagement' },
  { label: 'Improvement Tracking', value: 'ImprovementTracking' },
  { label: 'Training Attestation', value: 'TrainingAttestation' },
  { label: 'Compliance Review', value: 'ComplianceReview' },
]
const priorityOptions = [
  { label: 'Critical (1)', value: 1 },
  { label: 'High (2)', value: 2 },
  { label: 'Medium (3)', value: 3 },
  { label: 'Low (4)', value: 4 },
  { label: 'Background (5)', value: 5 },
]
const entityOptions = ['incident', 'risk', 'bcp', 'document', 'compliance']
const requiredRule = (val: any) => !!val || 'Required'

function handleSubmit(): void {
  if (!form.workflow_type || !form.title) return
  emit('submit', { ...form })
}
</script>
